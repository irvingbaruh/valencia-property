import { createClient } from 'npm:@supabase/supabase-js@2';

// Weekly check of RE/MAX listing pages. A listing that is sold or gone is switched off; members who saved it as a
// favourite get a notification (in-app + push + e-mail through the notifications table) and it leaves their favourites.
// Called by pg_cron with the shared token. Body: { dry: true } only reports; { wait: true } processes one batch inline.
const TOKEN = '646b7b1fd5552979ad2a68905cc68a30fb1658a0b26b1513';
const LANGS = ['tr', 'es', 'en', 'de'];
const BATCH = 25;
const STALE_DAYS = 6;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const TEXT: Record<string, { title: string; body: (t: string) => string }> = {
  tr: { title: 'Favorinizdeki ev satıldı', body: (t) => `"${t}" artık satışta değil; favorilerinizden kaldırdık.` },
  es: { title: 'Una propiedad de tus favoritos se ha vendido', body: (t) => `"${t}" ya no está a la venta; la hemos quitado de tus favoritos.` },
  en: { title: 'A home in your favourites has been sold', body: (t) => `"${t}" is no longer for sale; we removed it from your favourites.` },
  de: { title: 'Ein Favorit wurde verkauft', body: (t) => `"${t}" steht nicht mehr zum Verkauf; wir haben es aus Ihren Favoriten entfernt.` },
};

type Result = { state: 'available' | 'sold' | 'gone' | 'unreachable'; code: number; note?: string };
async function look(url: string): Promise<Result> {
  let r: Response;
  try { r = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0 (compatible; LockLoftListingCheck/1.0; +https://lockandloft.com)', accept: 'text/html' } }); } catch (_) { return { state: 'unreachable', code: 0 }; }
  if (r.status === 404 || r.status === 410) return { state: 'gone', code: r.status };
  if (r.status !== 200) return { state: 'unreachable', code: r.status };
  const html = await r.text();
  const nodes: any[] = [];
  for (const m of html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) {
    try { const x = JSON.parse(m[1]); (x['@graph'] || [x]).forEach((n: any) => nodes.push(n)); } catch (_) { /* ignore */ }
  }
  const listing = nodes.find((n) => n['@type'] === 'RealEstateListing');
  if (!listing) {
    // maybe a bot-check page or a removed-listing page: report what it is, but do not treat as sold
    const title = (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || '';
    const gone = /no longer|not available|no está disponible|sold|vendid/i.test(html.slice(0, 200000));
    return { state: 'unreachable', code: 200, note: `${title.trim().slice(0, 80)} | len=${html.length} | gonewords=${gone}` };
  }
  const offer = nodes.find((n) => n['@type'] === 'Offer') || listing.offers || {};
  if (offer.availability && !/InStock/i.test(String(offer.availability))) return { state: 'sold', code: 200 };
  return { state: 'available', code: 200 };
}

async function markSold(sb: any, p: any) {
  const { data: favs } = await sb.from('favorites').select('user_id').eq('property_id', p.id);
  const users = [...new Set((favs || []).map((f: any) => f.user_id))];
  const { data: prefs } = users.length ? await sb.from('profiles').select('id,preferred_language').in('id', users) : { data: [] };
  const lang: Record<string, string> = Object.fromEntries((prefs || []).map((x: any) => [x.id, x.preferred_language]));
  const rows = users.map((u: any) => {
    const row: any = { user_id: u, type: 'listing_sold' };
    for (const l of LANGS) {
      const name = p[`title_${l}`] || p.title_tr || p.title_en || '';
      row[`title_${l}`] = TEXT[l].title; row[`body_${l}`] = TEXT[l].body(name);
    }
    return row;
  });
  // Notify first, drop the favourites next, switch the listing off last (so the generic "no longer available" push finds no favourites).
  if (rows.length) await sb.from('notifications').insert(rows);
  if (users.length) await sb.from('favorites').delete().eq('property_id', p.id);
  await sb.from('properties').update({ is_active: false, is_featured: false, source_status: 'sold', last_checked_at: new Date().toISOString(), check_failures: 0 }).eq('id', p.id);
  return users.length;
}

async function batch(sb: any, dry: boolean, skip: string[] = []) {
  const cutoff = new Date(Date.now() - (dry ? -1 : STALE_DAYS) * 86400000).toISOString();
  const retry = new Date(Date.now() - (dry ? -1 : 3 * 3600000)).toISOString(); // an attempt that failed is retried after 3 hours
  let q = sb.from('properties').select('id,external_url,is_active,check_failures,last_checked_at,title_tr,title_es,title_en,title_de')
    .eq('is_active', true).ilike('external_url', '%remax.com%').or(`last_checked_at.is.null,last_checked_at.lt.${cutoff}`).or(`check_attempted_at.is.null,check_attempted_at.lt.${retry}`)
    .order('last_checked_at', { ascending: true, nullsFirst: true }).limit(BATCH);
  if (skip.length) q = q.not('id', 'in', `(${skip.join(',')})`);
  const { data: list } = await q;
  const out = { checked: 0, available: 0, sold: 0, unreachable: 0, notified: 0, codes: {} as Record<string, number>, detail: undefined as string[] | undefined };
  const decisions: { p: any; state: string }[] = [];
  for (const p of list || []) {
    await sleep(2000);
    let res = await look(p.external_url);
    // 202/403/429 = the site is rate-limiting or showing a bot check; 404/410 = confirm once before believing it
    if (res.state === 'gone') { await sleep(3000); res = await look(p.external_url); }
    else if (res.state === 'unreachable' && [202, 403, 429].includes(res.code)) { await sleep(6000); res = await look(p.external_url); }
    if (!dry) await sb.from('properties').update({ check_attempted_at: new Date().toISOString() }).eq('id', p.id);
    out.checked++;
    out.codes[res.code] = (out.codes[res.code] || 0) + 1;
    decisions.push({ p, state: res.state });
    if (dry) (out.detail ||= []).push(`${p.external_url.split('/').slice(-3, -2)[0]} ${res.state} ${res.code} ${res.note || ''}`);
  }
  const soldN = decisions.filter((d) => d.state === 'sold' || d.state === 'gone').length;
  // Safety valve: if a large share of a batch looks sold, something is off with the source; change nothing.
  const suspicious = !dry && soldN > Math.max(3, Math.floor(decisions.length * 0.4));
  for (const { p, state } of decisions) {
    if (state === 'unreachable') { out.unreachable++; continue; }
    if (state === 'available') {
      out.available++;
      if (!dry) await sb.from('properties').update({ last_checked_at: new Date().toISOString(), check_failures: 0, source_status: 'available' }).eq('id', p.id);
      continue;
    }
    out.sold++;
    if (!dry && !suspicious) out.notified += await markSold(sb, p);
  }
  if (suspicious) (out as any).aborted = 'too_many_sold';
  return { ...out, ids: (list || []).map((x: any) => x.id), more: (list || []).length === BATCH };
}

Deno.serve(async (req) => {
  if (req.headers.get('x-check-token') !== TOKEN) return new Response('forbidden', { status: 403 });
  const b = await req.json().catch(() => ({}));
  const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  if (b.wait || b.dry) return Response.json(await batch(sb, !!b.dry));
  // One batch per call; pg_cron calls this every 20 minutes during the weekly window, so a long list is covered over several calls.
  // @ts-ignore
  EdgeRuntime.waitUntil(batch(sb, false).then((r) => console.log(JSON.stringify({ ...r, ids: undefined }))));
  return Response.json({ started: true });
});
