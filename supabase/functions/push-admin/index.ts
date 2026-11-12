import { createClient } from 'npm:@supabase/supabase-js@2';
import webpush from 'npm:web-push@3.6.7';

// Sends Web Push notifications to the admins' phones.
//  - database triggers call it with {kind, id} for real events (deduplicated per event)
//  - the track function calls it with the service key for "new visitor"
//  - pg_cron calls it with x-cron-key for the daily summary
//  - a signed-in admin can send a test to their own devices
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'content-type, authorization, apikey, x-client-info, x-cron-key',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...CORS, 'Content-Type': 'application/json' } });
const ADMIN = '/lockandloft/admin';
const ID = /^[0-9a-f-]{36}$/i;
const cut = (s: unknown, n: number) => { const t = String(s ?? '').replace(/\s+/g, ' ').trim(); return t.length > n ? t.slice(0, n - 1) + '…' : t; };
const LANG: Record<string, string> = { tr: 'Türkçe', es: 'İspanyolca', en: 'İngilizce', de: 'Almanca' };

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
  try {
    const body = await req.json();
    const kind = String(body?.kind || '');
    const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const SERVICE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const bearer = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');

    const { data: cfg } = await sb.from('push_config').select('key,value');
    const C = Object.fromEntries((cfg || []).map((r: any) => [r.key, r.value]));
    if (!C.vapid_public || !C.vapid_private) return json({ error: 'not_configured' }, 500);
    webpush.setVapidDetails('mailto:info@lockandloft.com', C.vapid_public, C.vapid_private);

    let payload: { title: string; body: string; url: string; tag?: string } | null = null;
    let onlyUser: string | null = null;

    if (kind === 'test') {
      const { data: u } = await sb.auth.getUser(bearer);
      if (!u?.user) return json({ error: 'unauthorized' }, 401);
      const { data: adm } = await sb.from('profiles').select('role').eq('id', u.user.id).maybeSingle();
      if (adm?.role !== 'admin') return json({ error: 'forbidden' }, 403);
      onlyUser = u.user.id;
      payload = { title: 'Lock & Loft', body: 'Bildirimler bu cihazda çalışıyor.', url: `${ADMIN}/dashboard/`, tag: 'test' };
    } else if (kind === 'visit') {
      if (bearer !== SERVICE) return json({ error: 'unauthorized' }, 401);
      const i = body.info || {};
      payload = {
        title: 'Sitede yeni ziyaretçi',
        body: cut([i.country, i.device === 'mobile' ? 'telefon' : i.device === 'tablet' ? 'tablet' : 'bilgisayar', LANG[i.locale] || '', i.path].filter(Boolean).join(' · '), 120),
        url: `${ADMIN}/trafik/`, tag: 'visit',
      };
    } else if (kind === 'digest') {
      if (req.headers.get('x-cron-key') !== C.cron_key) return json({ error: 'unauthorized' }, 401);
      const day = new Date().toISOString().slice(0, 10);
      const { error: dup } = await sb.from('push_log').insert({ kind, ref: day });
      if (dup) return json({ skipped: 'done' });
      const from = new Date(); from.setUTCHours(0, 0, 0, 0);
      const q = (k: string) => sb.from('site_events').select('id', { count: 'exact', head: true }).eq('kind', k).gte('created_at', from.toISOString());
      const [v, c, lc] = await Promise.all([q('view'), q('click'), q('listing_click')]);
      const { data: vis } = await sb.from('site_events').select('vh').eq('kind', 'view').gte('created_at', from.toISOString()).limit(5000);
      const visitors = new Set((vis || []).map((r: any) => r.vh)).size;
      payload = {
        title: 'Bugünün özeti',
        body: `${visitors} ziyaretçi, ${v.count || 0} sayfa görüntüleme, ${c.count || 0} tıklama, ${lc.count || 0} ilan tıklaması`,
        url: `${ADMIN}/trafik/`, tag: 'digest',
      };
    } else {
      // event kinds backed by a real row
      const id = String(body?.id || '');
      if (!ID.test(id)) return json({ error: 'bad_request' }, 400);
      const { error: dup } = await sb.from('push_log').insert({ kind, ref: id });
      if (dup) return json({ skipped: 'done' });
      const who = async (uid: string) => {
        const [{ data: p }, { data: u }] = await Promise.all([
          sb.from('profiles').select('full_name').eq('id', uid).maybeSingle(),
          sb.auth.admin.getUserById(uid),
        ]);
        return p?.full_name || u?.user?.email || 'Üye';
      };
      if (kind === 'contact_message') {
        const { data: r } = await sb.from('contact_messages').select('name,message').eq('id', id).maybeSingle();
        if (!r) return json({ skipped: 'not_found' });
        payload = { title: 'Yeni iletişim mesajı', body: `${r.name}: ${cut(r.message, 100)}`, url: `${ADMIN}/bildirimler/`, tag: kind };
      } else if (kind === 'intake') {
        const { data: r } = await sb.from('client_intake').select('user_id,answers').eq('id', id).maybeSingle();
        if (!r) return json({ skipped: 'not_found' });
        const a = (r.answers || {}) as Record<string, string>;
        payload = { title: 'Yeni danışmanlık talebi', body: cut(`${await who(r.user_id)}${a.budget ? ' · ' + a.budget : ''}`, 120), url: `${ADMIN}/uyeler/detay/?id=${r.user_id}`, tag: kind };
      } else if (kind === 'member') {
        const { data: r } = await sb.from('profiles').select('id,role').eq('id', id).maybeSingle();
        if (!r || r.role === 'admin') return json({ skipped: 'n/a' });
        payload = { title: 'Yeni üye', body: await who(id), url: `${ADMIN}/uyeler/detay/?id=${id}`, tag: kind };
      } else if (kind === 'document_upload' || kind === 'doc_delete_request') {
        const { data: r } = await sb.from('documents').select('user_id,file_name,delete_reason').eq('id', id).maybeSingle();
        if (!r) return json({ skipped: 'not_found' });
        payload = kind === 'document_upload'
          ? { title: 'Yeni belge yüklendi', body: cut(`${await who(r.user_id)} · ${r.file_name}`, 120), url: `${ADMIN}/dosyalar/`, tag: kind }
          : { title: 'Belge silme isteği', body: cut(`${await who(r.user_id)} · ${r.file_name}`, 120), url: `${ADMIN}/dosyalar/?filter=delete`, tag: kind };
      } else if (kind === 'review') {
        const { data: r } = await sb.from('reviews').select('display_name,rating,comment').eq('id', id).maybeSingle();
        if (!r) return json({ skipped: 'not_found' });
        payload = { title: `Yeni yorum (${r.rating}/5)`, body: cut(`${r.display_name}${r.comment ? ': ' + r.comment : ''}`, 120), url: `${ADMIN}/yorumlar/`, tag: kind };
      } else if (kind === 'chat_started') {
        const { data: s } = await sb.from('chat_sessions').select('first_message,language').eq('id', id).maybeSingle();
        let first = s?.first_message;
        if (!first) {
          const { data: m } = await sb.from('chat_messages').select('content').eq('session_id', id).eq('role', 'user').order('created_at').limit(1);
          first = m?.[0]?.content;
        }
        payload = { title: `Sohbet başladı${s?.language ? ' (' + (LANG[s.language] || s.language) + ')' : ''}`, body: cut(first || 'Bir ziyaretçi sohbeti kullanıyor.', 120), url: `${ADMIN}/sohbetler/`, tag: kind };
      } else if (kind === 'chat_lead') {
        const { data: s } = await sb.from('chat_sessions').select('contact_name,contact_phone,contact_email').eq('id', id).maybeSingle();
        payload = { title: 'Sohbette iletişim bilgisi bırakıldı', body: cut([s?.contact_name, s?.contact_phone || s?.contact_email].filter(Boolean).join(' · ') || 'Yeni potansiyel müşteri', 120), url: `${ADMIN}/sohbetler/`, tag: kind };
      } else {
        return json({ error: 'bad_kind' }, 400);
      }
    }

    let q = sb.from('push_subscriptions').select('id,endpoint,p256dh,auth,events').eq('audience', 'admin');
    if (onlyUser) q = q.eq('user_id', onlyUser);
    const { data: subs } = await q;
    const targets = (subs || []).filter((s: any) => kind === 'test' || s.events?.[kind] === true);
    let sent = 0, failed = 0;
    await Promise.all(targets.map(async (s: any) => {
      try {
        await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, JSON.stringify(payload), { TTL: 60 * 60 * 12, urgency: 'high' });
        sent++;
        await sb.from('push_subscriptions').update({ last_ok_at: new Date().toISOString() }).eq('id', s.id);
      } catch (e: any) {
        failed++;
        if (e?.statusCode === 404 || e?.statusCode === 410) await sb.from('push_subscriptions').delete().eq('id', s.id);
      }
    }));
    return json({ ok: true, sent, failed });
  } catch (e) {
    return json({ error: 'server_error', detail: String((e as Error)?.message || e).slice(0, 200) }, 500);
  }
});
