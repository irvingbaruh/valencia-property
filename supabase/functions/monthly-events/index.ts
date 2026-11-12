import { createClient } from 'npm:@supabase/supabase-js@2';
import webpush from 'npm:web-push@3.6.7';

// Monthly "This month in Valencia and Alicante" mail + push, built from the city_events table.
// pg_cron calls it hourly with the shared token; it only acts on the configured day/hour (Madrid time).
// Idempotent per month through digest_runs. Body options (token required): force, month (1-12), only_email (test: no claim, one recipient).
const TOKEN = '7816db7dc9f69f8e9337699337ca4648077b54401d865dbd';
const SITE = 'https://lockandloft.com';
const LANGS = ['tr', 'es', 'en', 'de'];
const SLUG: Record<string, string> = { tr: 'takvim', es: 'calendario', en: 'events', de: 'veranstaltungen' };
const LOCALE: Record<string, string> = { tr: 'tr-TR', es: 'es-ES', en: 'en-GB', de: 'de-DE' };
const T: Record<string, Record<string, string>> = {
  tr: { subject: 'Bu ay Valencia ve Alicante\'de: {month}', intro: '{month} ayında Valencia ve Alicante\'de öne çıkanlar:', btn: 'Tüm takvimi aç', both: 'Valencia ve Alicante', valencia: 'Valencia', alicante: 'Alicante', pushTitle: 'Bu ay Valencia\'da', why: 'Bu e-postayı Lock & Loft bültenine abone olduğunuz için aldınız. E-postalarımızda açılma ve tıklama istatistikleri tutulur.', out: 'Abonelikten çık' },
  es: { subject: 'Este mes en Valencia y Alicante: {month}', intro: 'Lo más destacado de {month} en Valencia y Alicante:', btn: 'Abrir el calendario', both: 'Valencia y Alicante', valencia: 'Valencia', alicante: 'Alicante', pushTitle: 'Este mes en Valencia', why: 'Recibe este correo porque se suscribió al boletín de Lock & Loft. En nuestros correos se registran estadísticas de apertura y clics.', out: 'Darse de baja' },
  en: { subject: 'This month in Valencia and Alicante: {month}', intro: 'What is on in Valencia and Alicante in {month}:', btn: 'Open the calendar', both: 'Valencia and Alicante', valencia: 'Valencia', alicante: 'Alicante', pushTitle: 'This month in Valencia', why: 'You are receiving this email because you subscribed to the Lock & Loft newsletter. We record email open and click statistics.', out: 'Unsubscribe' },
  de: { subject: 'Diesen Monat in Valencia und Alicante: {month}', intro: 'Was im {month} in Valencia und Alicante los ist:', btn: 'Kalender öffnen', both: 'Valencia und Alicante', valencia: 'Valencia', alicante: 'Alicante', pushTitle: 'Diesen Monat in Valencia', why: 'Sie erhalten diese E-Mail, weil Sie den Lock & Loft Newsletter abonniert haben. Wir erfassen Öffnungs- und Klickstatistiken.', out: 'Abmelden' },
};
const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'content-type, authorization, apikey, x-client-info, x-auto-token', 'Access-Control-Allow-Methods': 'POST, OPTIONS' };
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...CORS, 'Content-Type': 'application/json' } });
const esc = (s: unknown) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const lg = (l: unknown) => (LANGS.includes(String(l)) ? String(l) : 'tr');
const pick = (o: any, base: string, lang: string) => { for (const l of [lang, 'en', 'tr', 'es', 'de']) { const v = o[`${base}_${l}`]; if (v && String(v).trim()) return String(v); } return ''; };
const clip = (s: string, n: number) => (s.length > n ? s.slice(0, n).replace(/\s+\S*$/, '') + '…' : s);

const madrid = () => {
  const p = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Madrid', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hourCycle: 'h23' }).formatToParts(new Date());
  const g = (t: string) => Number(p.find((x) => x.type === t)!.value);
  return { year: g('year'), month: g('month'), day: g('day'), hour: g('hour') };
};
const monthName = (lang: string, year: number, month: number) => new Intl.DateTimeFormat(LOCALE[lang], { month: 'long', timeZone: 'UTC' }).format(new Date(Date.UTC(year, month - 1, 15)));

function shell(title: string, inner: string, footer: string) {
  return `<!doctype html><html><body style="margin:0;background:#F4F4F1;font-family:Arial,Helvetica,sans-serif;color:#222">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:12px;overflow:hidden">
<tr><td style="background:#0B0B11;padding:22px 28px"><a href="${SITE}"><img src="${SITE}/brand/email-logo.png" width="255" height="48" alt="Lock &amp; Loft" style="display:block;border:0;color:#C9A84C;font-size:20px"></a></td></tr>
<tr><td style="padding:28px;font-size:15px"><h1 style="margin:0 0 20px;font-size:22px;color:#0B0B11">${esc(title)}</h1>${inner}</td></tr>
<tr><td style="padding:18px 28px;background:#FAFAF8;font-size:12px;color:#777">${footer}</td></tr>
</table></td></tr></table></body></html>`;
}

// Events whose recurring month matches, or whose dated range touches the month.
async function eventsFor(sb: any, year: number, month: number) {
  const first = `${year}-${String(month).padStart(2, '0')}-01`;
  const last = new Date(Date.UTC(year, month, 0)).toISOString().slice(0, 10);
  const { data } = await sb.from('city_events').select('*').eq('status', 'published');
  return (data || []).filter((e: any) => {
    if (e.recurring_month) return e.recurring_month === month;
    const end = e.end_date || e.start_date;
    return e.start_date <= last && end >= first;
  }).sort((a: any, b: any) => (a.start_date || '').localeCompare(b.start_date || '') || a.city.localeCompare(b.city));
}

async function subscribers(sb: any) {
  const { data: profs } = await sb.from('profiles').select('id,preferred_language,unsubscribe_token').eq('marketing_opt_in', true);
  const out: { email: string; lang: string; token: string }[] = [];
  for (const p of profs || []) {
    const { data: u } = await sb.auth.admin.getUserById(p.id);
    const email = u?.user?.email;
    if (!email || !u.user.email_confirmed_at) continue;
    out.push({ email, lang: lg(p.preferred_language), token: p.unsubscribe_token });
  }
  return out;
}

async function sendMail(sb: any, messages: any[], ref: string) {
  const key = Deno.env.get('RESEND_API_KEY');
  let sent = 0, failed = 0;
  for (let i = 0; i < messages.length; i += 100) {
    const chunk = messages.slice(i, i + 100);
    let ok = false, err = '';
    try {
      const res = await fetch('https://api.resend.com/emails/batch', { method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }, body: JSON.stringify(chunk.map(({ _lang, ...m }: any) => m)) });
      ok = res.ok;
      if (!ok) err = (await res.text()).slice(0, 300);
    } catch (e) { err = String(e).slice(0, 300); }
    if (ok) sent += chunk.length; else failed += chunk.length;
    await sb.from('auto_mail_log').insert(chunk.map((m: any) => ({ kind: 'monthly_events', to_email: m.to[0], lang: m._lang, subject: m.subject, status: ok ? 'sent' : 'failed', error: ok ? null : err, ref, html: String(m.html).slice(0, 60000) }))).then(() => {}, () => {});
  }
  return { sent, failed };
}

async function sendPush(sb: any, events: any[], year: number, month: number) {
  const { data: cfg } = await sb.from('push_config').select('key,value');
  const C = Object.fromEntries((cfg || []).map((r: any) => [r.key, r.value]));
  if (!C.vapid_public || !C.vapid_private) return { skipped: 'push_not_configured' };
  webpush.setVapidDetails('mailto:info@lockandloft.com', C.vapid_public, C.vapid_private);
  const { data } = await sb.from('push_subscriptions').select('id,user_id,endpoint,p256dh,auth,events,locale').eq('audience', 'member');
  const list = (data || []).filter((s: any) => s.events?.content === true);
  const ids = [...new Set(list.map((s: any) => s.user_id))];
  const prefs: Record<string, string> = {};
  if (ids.length) { const { data: ps } = await sb.from('profiles').select('id,preferred_language').in('id', ids); for (const p of ps || []) if (p.preferred_language) prefs[p.id] = p.preferred_language; }
  let sent = 0, failed = 0;
  await Promise.all(list.map(async (s: any) => {
    const lang = [s.locale, prefs[s.user_id]].find((x) => LANGS.includes(x)) || 'tr';
    const names = events.slice(0, 3).map((e) => pick(e, 'title', lang)).filter(Boolean);
    const payload = { title: T[lang].pushTitle, body: clip(names.join(' · '), 140), url: `/${lang}/${SLUG[lang]}/`, tag: `monthly-events-${year}-${month}` };
    try {
      await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, JSON.stringify(payload), { TTL: 60 * 60 * 24, urgency: 'normal' });
      sent++;
    } catch (e: any) {
      failed++;
      if (e?.statusCode === 404 || e?.statusCode === 410) await sb.from('push_subscriptions').delete().eq('id', s.id);
    }
  }));
  return { sent, failed };
}

function buildMessage(from: string, s: { email: string; lang: string; token: string }, events: any[], year: number, month: number) {
  const t = T[s.lang];
  const mname = monthName(s.lang, year, month);
  const subject = t.subject.replace('{month}', mname);
  const link = `${SITE}/abonelik/?t=${s.token}&l=${s.lang}`;
  const items = events.map((e) => {
    const place = t[e.city] || t.both;
    const date = pick(e, 'date_label', s.lang);
    return `<div style="margin:0 0 20px;padding:0 0 16px;border-bottom:1px solid #EEE"><div style="font-size:12px;color:#777;margin:0 0 4px">${esc(place)}${date ? ' · ' + esc(date) : ''}</div><h2 style="margin:0 0 6px;font-size:17px;color:#0B0B11">${esc(pick(e, 'title', s.lang))}</h2><p style="margin:0;line-height:1.6">${esc(clip(pick(e, 'summary', s.lang), 320))}</p></div>`;
  }).join('');
  const button = `<a href="${SITE}/${s.lang}/${SLUG[s.lang]}/" style="display:inline-block;background:#C9A84C;color:#0B0B11;text-decoration:none;font-weight:bold;padding:12px 22px;border-radius:8px">${esc(t.btn)}</a>`;
  const inner = `<p style="margin:0 0 20px;line-height:1.6">${esc(t.intro.replace('{month}', mname))}</p>${items}${button}`;
  return { from, to: [s.email], subject, html: shell(subject, inner, `${esc(t.why)}<br><a href="${link}" style="color:#777">${esc(t.out)}</a>`), headers: { 'List-Unsubscribe': `<${link}>` }, tags: [{ name: 'auto_kind', value: 'monthly_events' }], _lang: s.lang };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
  try {
    if (req.headers.get('x-auto-token') !== TOKEN) return json({ error: 'forbidden' }, 403);
    const from = Deno.env.get('MAIL_FROM');
    if (!from || !Deno.env.get('RESEND_API_KEY')) return json({ error: 'not_configured' }, 400);
    const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const body = await req.json().catch(() => ({}));
    const { data: st } = await sb.from('site_settings').select('value').eq('key', 'monthly_events').maybeSingle();
    const cfg = { enabled: true, day: 1, hour: 9, push: true, ...((st?.value as any) || {}) };
    const now = madrid();
    const month = Number(body.month) >= 1 && Number(body.month) <= 12 ? Number(body.month) : now.month;
    const year = now.year;

    // Test mode: one recipient, no claim, no push.
    if (body.only_email) {
      const events = await eventsFor(sb, year, month);
      if (!events.length) return json({ skipped: 'no_events' });
      const lang = lg(body.lang);
      const m = buildMessage(from, { email: String(body.only_email), lang, token: 'test' }, events, year, month);
      m.subject = `[TEST] ${m.subject}`;
      return json({ events: events.length, ...(await sendMail(sb, [m], `test-${year}-${month}`)) });
    }

    if (!cfg.enabled && !body.force) return json({ skipped: 'disabled' });
    if (!body.force && (now.day !== Number(cfg.day) || now.hour !== Number(cfg.hour))) return json({ skipped: 'not_scheduled_now' });
    const period = `${year}-${String(month).padStart(2, '0')}`;
    const events = await eventsFor(sb, year, month);
    if (!events.length) return json({ skipped: 'no_events', period });
    const { error: claim } = await sb.from('digest_runs').insert({ kind: 'monthly_events', period });
    if (claim) return json({ skipped: 'already_sent', period });
    const subs = await subscribers(sb);
    const mail = subs.length ? await sendMail(sb, subs.map((s) => buildMessage(from, s, events, year, month)), period) : { sent: 0, failed: 0 };
    if (mail.sent === 0 && mail.failed > 0) { await sb.from('digest_runs').delete().eq('kind', 'monthly_events').eq('period', period); return json({ error: 'send_failed', period, ...mail }, 502); }
    const pushRes = cfg.push === false ? { skipped: 'push_disabled' } : await sendPush(sb, events, year, month);
    return json({ period, events: events.length, mail, push: pushRes });
  } catch (e) {
    return json({ error: 'server_error', detail: String(e).slice(0, 300) }, 500);
  }
});
