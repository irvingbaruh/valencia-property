import { createClient } from 'npm:@supabase/supabase-js@2';
import webpush from 'npm:web-push@3.6.7';

// Sends Web Push notifications to site members' phones (audience = 'member').
//  - database triggers call it with {kind, id} (deduplicated per event through push_log)
//  - pg_cron calls kind "rates" hourly with x-cron-key (EUR/TRY alerts + optional daily rate)
//  - a signed-in member can send a test to their own devices
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'content-type, authorization, apikey, x-client-info, x-cron-key',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...CORS, 'Content-Type': 'application/json' } });
const ID = /^[0-9a-f-]{36}$/i;
const LANGS = ['tr', 'es', 'en', 'de'];
const cut = (s: unknown, n: number) => { const t = String(s ?? '').replace(/\s+/g, ' ').trim(); return t.length > n ? t.slice(0, n - 1) + '…' : t; };
const eur = (n: unknown) => '€' + Math.round(Number(n) || 0).toLocaleString('de-DE');

const SLUG: Record<string, Record<string, string>> = {
  panel: { tr: 'panel', es: 'mi-cuenta', en: 'account', de: 'mein-konto' },
  mulkler: { tr: 'mulkler', es: 'propiedades', en: 'properties', de: 'immobilien' },
  piyasa: { tr: 'piyasa', es: 'mercado', en: 'market', de: 'markt' },
};
const panelUrl = (l: string) => `/${l}/${SLUG.panel[l]}/`;

const T: Record<string, Record<string, string>> = {
  tr: {
    listing_new: 'Yeni ilan', off: 'Favori ilanınız artık yayında değil', price: 'Favori ilanınızın fiyatı değişti',
    blog: 'Yeni blog yazısı', market: 'Yeni piyasa notu', above: 'EUR/TRY yükseldi', below: 'EUR/TRY düştü',
    daily: 'Günün EUR/TRY kuru', test: 'Bildirimler bu cihazda çalışıyor.', doc_new: 'Dosyalarınıza yeni belge eklendi',
    doc_approved: 'Belgeniz onaylandı', doc_rejected: 'Belgeniz için düzeltme gerekiyor', doc_status: 'Belge durumu güncellendi',
  },
  es: {
    listing_new: 'Nueva propiedad', off: 'Tu propiedad favorita ya no está disponible', price: 'Ha cambiado el precio de tu propiedad favorita',
    blog: 'Nuevo artículo del blog', market: 'Nueva nota de mercado', above: 'EUR/TRY ha subido', below: 'EUR/TRY ha bajado',
    daily: 'EUR/TRY de hoy', test: 'Las notificaciones funcionan en este dispositivo.', doc_new: 'Se ha añadido un documento a tus archivos',
    doc_approved: 'Tu documento ha sido aprobado', doc_rejected: 'Tu documento necesita correcciones', doc_status: 'Estado del documento actualizado',
  },
  en: {
    listing_new: 'New listing', off: 'Your favourite listing is no longer available', price: 'The price of your favourite listing changed',
    blog: 'New blog post', market: 'New market note', above: 'EUR/TRY went up', below: 'EUR/TRY went down',
    daily: "Today's EUR/TRY rate", test: 'Notifications work on this device.', doc_new: 'A new document was added to your files',
    doc_approved: 'Your document was approved', doc_rejected: 'Your document needs changes', doc_status: 'Document status updated',
  },
  de: {
    listing_new: 'Neues Inserat', off: 'Ihr favorisiertes Inserat ist nicht mehr verfügbar', price: 'Der Preis Ihres favorisierten Inserats hat sich geändert',
    blog: 'Neuer Blogbeitrag', market: 'Neue Marktnotiz', above: 'EUR/TRY ist gestiegen', below: 'EUR/TRY ist gefallen',
    daily: 'EUR/TRY-Kurs heute', test: 'Benachrichtigungen funktionieren auf diesem Gerät.', doc_new: 'Ihren Dateien wurde ein Dokument hinzugefügt',
    doc_approved: 'Ihr Dokument wurde genehmigt', doc_rejected: 'Ihr Dokument muss überarbeitet werden', doc_status: 'Dokumentstatus aktualisiert',
  },
};

type Payload = { title: string; body: string; url: string; tag?: string };

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
  try {
    const body = await req.json();
    const kind = String(body?.kind || '');
    const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const bearer = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');

    const { data: cfg } = await sb.from('push_config').select('key,value');
    const C = Object.fromEntries((cfg || []).map((r: any) => [r.key, r.value]));
    if (!C.vapid_public || !C.vapid_private) return json({ error: 'not_configured' }, 500);
    webpush.setVapidDetails('mailto:info@lockandloft.com', C.vapid_public, C.vapid_private);

    // Member devices (audience = member) that have this notification type switched on.
    const loadSubs = async (eventKey: string | null, userIds?: string[]) => {
      let q = sb.from('push_subscriptions').select('id,user_id,endpoint,p256dh,auth,events,locale,rate_above,rate_below,rate_state').eq('audience', 'member');
      if (userIds) q = q.in('user_id', userIds.length ? userIds : ['00000000-0000-0000-0000-000000000000']);
      const { data } = await q;
      const list = (data || []).filter((s: any) => !eventKey || s.events?.[eventKey] === true);
      const ids = [...new Set(list.map((s: any) => s.user_id))];
      const prefs: Record<string, string> = {};
      if (ids.length) {
        const { data: ps } = await sb.from('profiles').select('id,preferred_language').in('id', ids);
        for (const p of ps || []) if (p.preferred_language) prefs[p.id] = p.preferred_language;
      }
      return list.map((s: any) => {
        const l = [s.locale, prefs[s.user_id]].find((x) => LANGS.includes(x)) || 'tr';
        return { ...s, lang: l };
      });
    };

    const push = async (subs: any[], make: (s: any) => Payload | null) => {
      let sent = 0, failed = 0;
      await Promise.all(subs.map(async (s) => {
        const p = make(s);
        if (!p) return;
        try {
          await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, JSON.stringify(p), { TTL: 60 * 60 * 24, urgency: 'normal' });
          sent++;
          await sb.from('push_subscriptions').update({ last_ok_at: new Date().toISOString() }).eq('id', s.id);
        } catch (e: any) {
          failed++;
          if (e?.statusCode === 404 || e?.statusCode === 410) await sb.from('push_subscriptions').delete().eq('id', s.id);
        }
      }));
      return json({ ok: true, sent, failed });
    };

    const once = async (k: string, ref: string) => {
      const { error } = await sb.from('push_log').insert({ kind: k, ref });
      return !error; // false = already handled
    };

    // ---- member test -------------------------------------------------------
    if (kind === 'test') {
      const { data: u } = await sb.auth.getUser(bearer);
      if (!u?.user) return json({ error: 'unauthorized' }, 401);
      const subs = await loadSubs(null, [u.user.id]);
      return push(subs, (s) => ({ title: 'Lock & Loft', body: T[s.lang].test, url: panelUrl(s.lang), tag: 'test' }));
    }

    // ---- hourly rates (cron) ----------------------------------------------
    if (kind === 'rates') {
      if (req.headers.get('x-cron-key') !== C.cron_key) return json({ error: 'unauthorized' }, 401);
      const r = await fetch('https://api.frankfurter.dev/v1/latest?base=EUR&symbols=TRY');
      const rate = Number((await r.json())?.rates?.TRY);
      if (!rate || !isFinite(rate)) return json({ error: 'no_rate' }, 502);
      const fmt = (l: string) => rate.toLocaleString(l === 'tr' ? 'tr-TR' : l === 'de' ? 'de-DE' : l === 'es' ? 'es-ES' : 'en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const subs = await loadSubs('rate_alert');
      let sent = 0;
      const due: any[] = [];
      for (const s of subs) {
        const above = s.rate_above != null ? Number(s.rate_above) : null;
        const below = s.rate_below != null ? Number(s.rate_below) : null;
        const state = above != null && rate >= above ? 'above' : below != null && rate <= below ? 'below' : 'mid';
        if (state !== s.rate_state) {
          await sb.from('push_subscriptions').update({ rate_state: state }).eq('id', s.id);
          if (s.rate_state != null && state !== 'mid') due.push({ ...s, state });
        }
      }
      if (due.length) {
        const res = await push(due, (s) => ({ title: T[s.lang][s.state], body: `1 EUR = ${fmt(s.lang)} TRY`, url: `/${s.lang}/`, tag: 'rate' }));
        sent += (await res.json()).sent || 0;
      }
      // optional daily rate, about 09:00 Istanbul time
      if (new Date().getUTCHours() === 6 && (await once('rate_daily', new Date().toISOString().slice(0, 10)))) {
        const daily = (await loadSubs('rate_daily'));
        const res = await push(daily, (s) => ({ title: T[s.lang].daily, body: `1 EUR = ${fmt(s.lang)} TRY`, url: `/${s.lang}/`, tag: 'rate-daily' }));
        sent += (await res.json()).sent || 0;
      }
      return json({ ok: true, rate, sent });
    }

    // ---- events backed by a real row ---------------------------------------
    const id = String(body?.id || '');
    if (!ID.test(id)) return json({ error: 'bad_request' }, 400);
    const pick = (row: any, base: string, l: string) => row?.[`${base}_${l}`] || row?.[`${base}_tr`] || '';

    if (kind === 'notification') {
      if (!(await once(kind, id))) return json({ skipped: 'done' });
      const { data: n } = await sb.from('notifications').select('*').eq('id', id).maybeSingle();
      if (!n) return json({ skipped: 'not_found' });
      const subs = await loadSubs('account', [n.user_id]);
      return push(subs, (s) => ({
        title: cut(pick(n, 'title', s.lang), 80) || 'Lock & Loft',
        body: cut(pick(n, 'body', s.lang), 140),
        url: panelUrl(s.lang),
        tag: `n-${id}`,
      }));
    }

    if (kind === 'doc_new' || kind === 'doc_status') {
      const ref = kind === 'doc_status' ? `${id}:${body.status || ''}` : id;
      if (!(await once(kind, ref))) return json({ skipped: 'done' });
      const { data: d } = await sb.from('documents').select('user_id,file_name,status,rejection_reason').eq('id', id).maybeSingle();
      if (!d) return json({ skipped: 'not_found' });
      const subs = await loadSubs('account', [d.user_id]);
      return push(subs, (s) => {
        const k = kind === 'doc_new' ? 'doc_new' : d.status === 'approved' ? 'doc_approved' : d.status === 'rejected' ? 'doc_rejected' : 'doc_status';
        return { title: T[s.lang][k], body: cut(d.status === 'rejected' && d.rejection_reason ? `${d.file_name} · ${d.rejection_reason}` : d.file_name, 140), url: panelUrl(s.lang), tag: `d-${id}` };
      });
    }

    if (kind === 'listing_new' || kind === 'listing_change') {
      const { data: p } = await sb.from('properties').select('id,price,region,city,is_active,title_tr,title_es,title_en,title_de').eq('id', id).maybeSingle();
      if (!p) return json({ skipped: 'not_found' });
      const change = String(body?.change || '');
      const ref = kind === 'listing_new' ? id : `${id}:${change}:${change === 'price' ? p.price : ''}`;
      if (!(await once(kind, ref))) return json({ skipped: 'done' });
      const href = (l: string) => `/${l}/${SLUG.mulkler[l]}/ilan/?id=${id}`;
      const place = [p.region, p.city].filter(Boolean).join(', ');
      if (kind === 'listing_new') {
        // A bulk import should not flood phones: after 3 new listings within 15 minutes, stay quiet.
        const since = new Date(Date.now() - 15 * 60 * 1000).toISOString();
        const { count } = await sb.from('push_log').select('id', { count: 'exact', head: true }).eq('kind', 'listing_new').gte('created_at', since);
        if ((count || 0) > 3) return json({ skipped: 'burst' });
        const subs = await loadSubs('new_listing');
        return push(subs, (s) => ({
          title: `${T[s.lang].listing_new}: ${cut(pick(p, 'title', s.lang), 60)}`,
          body: cut([eur(p.price), place].filter(Boolean).join(' · '), 120),
          url: href(s.lang), tag: `l-${id}`,
        }));
      }
      const { data: favs } = await sb.from('favorites').select('user_id').eq('property_id', id);
      const users = [...new Set((favs || []).map((f: any) => f.user_id))];
      if (!users.length) return json({ skipped: 'no_favorites' });
      const subs = await loadSubs('favorite_change', users);
      return push(subs, (s) => ({
        title: change === 'off' ? T[s.lang].off : T[s.lang].price,
        body: cut(change === 'off' ? pick(p, 'title', s.lang) : `${pick(p, 'title', s.lang)} · ${body.old_price ? eur(body.old_price) + ' → ' : ''}${eur(p.price)}`, 140),
        url: change === 'off' ? panelUrl(s.lang) : href(s.lang), tag: `lc-${id}`,
      }));
    }

    if (kind === 'blog' || kind === 'market') {
      if (!(await once(kind, id))) return json({ skipped: 'done' });
      const table = kind === 'blog' ? 'blog_posts' : 'market_notes';
      const sel = kind === 'blog' ? 'slug,title_tr,title_es,title_en,title_de' : 'title_tr,title_es,title_en,title_de';
      const { data: r } = await sb.from(table).select(sel).eq('id', id).maybeSingle();
      if (!r) return json({ skipped: 'not_found' });
      const subs = await loadSubs('content');
      return push(subs, (s) => ({
        title: T[s.lang][kind],
        body: cut(pick(r, 'title', s.lang), 140),
        url: kind === 'blog' ? `/${s.lang}/blog/yazi/?s=${(r as any).slug}` : `/${s.lang}/${SLUG.piyasa[s.lang]}/`,
        tag: `${kind}-${id}`,
      }));
    }

    return json({ error: 'bad_kind' }, 400);
  } catch (e) {
    return json({ error: 'server_error', detail: String((e as Error)?.message || e).slice(0, 200) }, 500);
  }
});
