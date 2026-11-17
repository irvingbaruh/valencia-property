import { createClient } from 'npm:@supabase/supabase-js@2';
import webpush from 'npm:web-push@3.6.7';

// Admin-written push messages to members. Called from the admin "Push Gönder" page with the admin's session.
//  { title, body, url?, image?, audience: {mode:'all'|'users', ids?, lang:'tr'|'all'}, preview?: true }
//  preview = send only to the caller's own devices (nothing is logged).
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'content-type, authorization, apikey, x-client-info',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...CORS, 'Content-Type': 'application/json' } });
const ID = /^[0-9a-f-]{36}$/i;
const LANGS = ['tr', 'es', 'en', 'de'];
const clean = (s: unknown, n: number) => String(s ?? '').replace(/\s+/g, ' ').trim().slice(0, n);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
  try {
    const auth = req.headers.get('authorization') || '';
    const jwt = auth.replace(/^Bearer\s+/i, '');
    const userClient = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: auth } } });
    const { data: isAdmin } = await userClient.rpc('is_admin');
    if (!jwt || !isAdmin) return json({ error: 'forbidden' }, 403);

    const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: u } = await sb.auth.getUser(jwt);
    const me = u?.user?.id;
    if (!me) return json({ error: 'forbidden' }, 403);

    const b = await req.json().catch(() => ({}));
    const title = clean(b.title, 65);
    const text = clean(b.body, 240);
    if (!title || !text) return json({ error: 'missing_text' }, 400);
    let url = String(b.url || '').trim() || '/';
    if (!(/^\/(?!\/)/.test(url) || /^https:\/\//i.test(url)) || url.length > 400) return json({ error: 'bad_url' }, 400);
    const image = String(b.image || '').trim();
    if (image && (!/^https:\/\//i.test(image) || image.length > 500)) return json({ error: 'bad_image' }, 400);

    const { data: cfg } = await sb.from('push_config').select('key,value');
    const C = Object.fromEntries((cfg || []).map((r: any) => [r.key, r.value]));
    if (!C.vapid_public || !C.vapid_private) return json({ error: 'not_configured' }, 500);
    webpush.setVapidDetails('mailto:info@lockandloft.com', C.vapid_public, C.vapid_private);

    const preview = b.preview === true;
    const aud = b.audience || {};
    const mode = aud.mode === 'users' ? 'users' : 'all';
    const ids: string[] = Array.isArray(aud.ids) ? aud.ids.filter((x: unknown) => typeof x === 'string' && ID.test(x)).slice(0, 3000) : [];
    const langOnly = aud.lang === 'all' ? null : 'tr';

    let q = sb.from('push_subscriptions').select('id,user_id,endpoint,p256dh,auth,events,locale');
    if (preview) q = q.eq('user_id', me);
    else q = q.eq('audience', 'member');
    const { data: all } = await q.range(0, 4999);
    let subs = all || [];
    if (!preview && mode === 'users') {
      const want = new Set(ids);
      subs = subs.filter((s: any) => want.has(s.user_id));
    }

    let skippedOff = 0, skippedLang = 0;
    if (!preview) {
      const on = subs.filter((s: any) => s.events?.announce !== false);
      skippedOff = subs.length - on.length;
      subs = on;
      if (langOnly) {
        const uids = [...new Set(subs.map((s: any) => s.user_id))];
        const prefs: Record<string, string> = {};
        if (uids.length) {
          const { data: ps } = await sb.from('profiles').select('id,preferred_language').in('id', uids);
          for (const p of ps || []) if (p.preferred_language) prefs[p.id] = p.preferred_language;
        }
        const keep = subs.filter((s: any) => ([s.locale, prefs[s.user_id]].find((x) => LANGS.includes(x)) || 'tr') === langOnly);
        skippedLang = subs.length - keep.length;
        subs = keep;
      }
    }

    const payload = JSON.stringify({ title, body: text, url, image: image || undefined, tag: `b-${crypto.randomUUID().slice(0, 8)}` });
    if (payload.length > 3500) return json({ error: 'too_long' }, 400);

    let sent = 0, failed = 0;
    await Promise.all(subs.map(async (s: any) => {
      try {
        await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, payload, { TTL: 60 * 60 * 24 * 2, urgency: 'normal' });
        sent++;
        await sb.from('push_subscriptions').update({ last_ok_at: new Date().toISOString() }).eq('id', s.id);
      } catch (e: any) {
        failed++;
        if (e?.statusCode === 404 || e?.statusCode === 410) await sb.from('push_subscriptions').delete().eq('id', s.id);
      }
    }));

    if (!preview) {
      await sb.from('push_broadcasts').insert({
        title, body: text, url, image: image || null,
        audience: { mode, count: mode === 'users' ? ids.length : null, lang: langOnly || 'all' },
        targets: subs.length, sent, failed, created_by: me,
      });
    }
    return json({ ok: true, preview, targets: subs.length, sent, failed, skippedOff, skippedLang });
  } catch (e) {
    return json({ error: 'server_error', detail: String((e as Error)?.message || e).slice(0, 200) }, 500);
  }
});
