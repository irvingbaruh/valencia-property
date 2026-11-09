import { createClient } from 'npm:@supabase/supabase-js@2';

// Cookieless first-party analytics. Stores page views, clicks and listing impressions.
// No cookies, no IP stored: a visitor is a per-day hash of IP + browser + secret, so the same
// person cannot be followed from one day to the next.
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'content-type, authorization, apikey, x-client-info',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const ok = (b: unknown = { ok: true }, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...CORS, 'Content-Type': 'application/json' } });
const BOT = /bot|crawl|spider|slurp|facebookexternalhit|preview|headless|lighthouse|pingdom|uptime|monitor|curl|wget|python|axios|node-fetch|go-http|java\/|httpclient|scrapy|phantom|selenium|playwright|puppeteer/i;
const KINDS = ['view', 'click', 'listing_view', 'listing_click'];
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const clip = (v: unknown, n: number) => (typeof v === 'string' ? v.trim().slice(0, n) : '');

const device = (ua: string) => (/ipad|tablet|android(?!.*mobile)/i.test(ua) ? 'tablet' : /mobi|iphone|android/i.test(ua) ? 'mobile' : 'desktop');
const sha = async (s: string) => {
  const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(b)].slice(0, 8).map((x) => x.toString(16).padStart(2, '0')).join('');
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
  if (req.method !== 'POST') return ok({ error: 'method' }, 405);
  try {
    const ua = req.headers.get('user-agent') || '';
    if (!ua || BOT.test(ua)) return ok({ skipped: 'bot' });
    const raw = JSON.parse(await req.text());
    const list = Array.isArray(raw?.events) ? raw.events.slice(0, 20) : [];
    if (!list.length) return ok({ skipped: 'empty' });

    const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'x';
    const day = new Date().toISOString().slice(0, 10);
    const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const vh = await sha(`${ip}|${ua}|${day}|${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!.slice(-24)}`);
    const country = (req.headers.get('cf-ipcountry') || '').toUpperCase();
    let city = '';
    try { city = decodeURIComponent(req.headers.get('cf-ipcity') || '').slice(0, 60); } catch { city = ''; }
    if (raw?.debug === true) return ok({ headers: [...req.headers.keys()] });
    const dev = device(ua);

    // crude flood guard: a person does not produce more than 300 events in a day
    const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
    const { count } = await sb.from('site_events').select('id', { count: 'exact', head: true }).eq('vh', vh).gte('created_at', since);
    if ((count || 0) > 300) return ok({ skipped: 'rate' });

    const rows = list
      .filter((e: any) => KINDS.includes(e?.k) && typeof e?.p === 'string' && e.p.startsWith('/'))
      .map((e: any) => ({
        kind: e.k,
        path: clip(e.p.split('?')[0], 200),
        locale: ['tr', 'es', 'en', 'de'].includes(e.l) ? e.l : null,
        label: clip(e.lb, 80) || null,
        target: clip(e.t, 200) || null,
        listing_id: UUID.test(String(e.id || '')) ? e.id : null,
        referrer: clip(e.r, 80) || null,
        country: /^[A-Z]{2}$/.test(country) && country !== 'XX' && country !== 'T1' ? country : null,
        city: city || null,
        device: dev,
        vh,
      }));
    if (!rows.length) return ok({ skipped: 'invalid' });

    // first page view of this visitor today -> optional "new visitor" push (off by default)
    let firstToday = false;
    if (rows.some((r) => r.kind === 'view')) {
      const startOfDay = `${day}T00:00:00Z`;
      const { count: seen } = await sb.from('site_events').select('id', { count: 'exact', head: true }).eq('vh', vh).gte('created_at', startOfDay);
      firstToday = (seen || 0) === 0;
    }
    const { error } = await sb.from('site_events').insert(rows);
    if (error) return ok({ error: 'db' }, 500);

    if (firstToday) {
      const v = rows.find((r) => r.kind === 'view')!;
      fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/push-admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}` },
        body: JSON.stringify({ kind: 'visit', info: { country: v.country, device: v.device, path: v.path, locale: v.locale, referrer: v.referrer } }),
      }).catch(() => {});
    }
    return ok();
  } catch {
    return ok({ error: 'bad_request' }, 400);
  }
});
