import { createClient } from 'npm:@supabase/supabase-js@2';

// Automatic e-mails: welcome (on confirmed signup), new blog post, weekly market digest.
// Called by DB trigger / pg_cron with the shared token. Every kind is idempotent (claims a "sent" marker first).
const TOKEN = '<set in deployed function; same value used by trigger + pg_cron>';
const SITE = 'https://lockandloft.com';
const LANGS = ['tr', 'es', 'en', 'de'];
const PANEL: Record<string, string> = { tr: 'panel', es: 'mi-cuenta', en: 'account', de: 'mein-konto' };
const PROPS: Record<string, string> = { tr: 'mulkler', es: 'propiedades', en: 'properties', de: 'immobilien' };
const MARKET: Record<string, string> = { tr: 'piyasa', es: 'mercado', en: 'market', de: 'markt' };

const T: Record<string, Record<string, string>> = {
  tr: {
    welcomeSubject: 'Lock & Loft\'a hoş geldiniz',
    welcomeTitle: 'Hoş geldiniz{name}',
    welcomeBody: 'Hesabınız hazır. Lock & Loft ile Valensiya\'da mülk arama, hukuki süreç, renovasyon ve kira yönetimi adımlarını tek yerden takip edebilirsiniz.\n\nHesabınızdan favori mülklerinizi kaydedebilir, hizmet aşamalarınızı ve belgelerinizi görebilirsiniz. Sorularınız için bize her zaman yazabilirsiniz.',
    welcomeBtn: 'Hesabıma git', welcomeBtn2: 'Mülklere göz at',
    welcomeWhy: 'Bu e-postayı Lock & Loft\'ta hesap oluşturduğunuz için aldınız.',
    readMore: 'Yazıyı oku', allNotes: 'Tüm piyasa notları', source: 'Kaynak', digestSubject: 'Bu haftanın piyasa notları',
    digestIntro: 'Bu hafta İspanya gayrimenkul ve ekonomisinden öne çıkanlar:',
    why: 'Bu e-postayı Lock & Loft bültenine abone olduğunuz için aldınız. E-postalarımızda açılma ve tıklama istatistikleri tutulur.', out: 'Abonelikten çık',
  },
  es: {
    welcomeSubject: 'Bienvenido a Lock & Loft',
    welcomeTitle: 'Bienvenido{name}',
    welcomeBody: 'Su cuenta está lista. Con Lock & Loft puede seguir en un solo lugar la búsqueda de propiedades en Valencia, los trámites legales, la reforma y la gestión de alquileres.\n\nDesde su cuenta puede guardar propiedades favoritas y ver las fases de sus servicios y sus documentos. Escríbanos cuando quiera.',
    welcomeBtn: 'Ir a mi cuenta', welcomeBtn2: 'Ver propiedades',
    welcomeWhy: 'Recibe este correo porque ha creado una cuenta en Lock & Loft.',
    readMore: 'Leer el artículo', allNotes: 'Todas las notas de mercado', source: 'Fuente', digestSubject: 'Notas de mercado de la semana',
    digestIntro: 'Lo más destacado de esta semana en el mercado inmobiliario y la economía de España:',
    why: 'Recibe este correo porque se suscribió al boletín de Lock & Loft. En nuestros correos se registran estadísticas de apertura y clics.', out: 'Darse de baja',
  },
  en: {
    welcomeSubject: 'Welcome to Lock & Loft',
    welcomeTitle: 'Welcome{name}',
    welcomeBody: 'Your account is ready. With Lock & Loft you can follow property search in Valencia, legal steps, renovation and rental management in one place.\n\nFrom your account you can save favourite properties and see your service stages and documents. Write to us any time.',
    welcomeBtn: 'Open my account', welcomeBtn2: 'Browse properties',
    welcomeWhy: 'You are receiving this email because you created an account at Lock & Loft.',
    readMore: 'Read the article', allNotes: 'All market notes', source: 'Source', digestSubject: 'This week\'s market notes',
    digestIntro: 'This week\'s highlights from Spanish property and economic data:',
    why: 'You are receiving this email because you subscribed to the Lock & Loft newsletter. We record email open and click statistics.', out: 'Unsubscribe',
  },
  de: {
    welcomeSubject: 'Willkommen bei Lock & Loft',
    welcomeTitle: 'Willkommen{name}',
    welcomeBody: 'Ihr Konto ist bereit. Mit Lock & Loft verfolgen Sie Immobiliensuche in Valencia, rechtliche Schritte, Renovierung und Vermietungsverwaltung an einem Ort.\n\nIn Ihrem Konto können Sie Lieblingsobjekte speichern sowie Ihre Servicephasen und Dokumente einsehen. Schreiben Sie uns jederzeit.',
    welcomeBtn: 'Zum Konto', welcomeBtn2: 'Immobilien ansehen',
    welcomeWhy: 'Sie erhalten diese E-Mail, weil Sie ein Konto bei Lock & Loft erstellt haben.',
    readMore: 'Artikel lesen', allNotes: 'Alle Marktnotizen', source: 'Quelle', digestSubject: 'Marktnotizen der Woche',
    digestIntro: 'Die wichtigsten Daten dieser Woche zu Spaniens Immobilienmarkt und Wirtschaft:',
    why: 'Sie erhalten diese E-Mail, weil Sie den Lock & Loft Newsletter abonniert haben. Wir erfassen Öffnungs- und Klickstatistiken.', out: 'Abmelden',
  },
};

const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { 'Content-Type': 'application/json' } });
const esc = (s: unknown) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const lg = (l: unknown) => (LANGS.includes(String(l)) ? String(l) : 'tr');
const pick = (o: any, base: string, lang: string) => {
  for (const l of [lang, 'en', 'tr', 'es', 'de']) { const v = o[`${base}_${l}`]; if (v && String(v).trim()) return String(v); }
  return '';
};
const clip = (s: string, n: number) => (s.length > n ? s.slice(0, n).replace(/\s+\S*$/, '') + '…' : s);
const paras = (s: string) => s.split(/\n{2,}/).map((p) => `<p style="margin:0 0 16px;line-height:1.6">${esc(p.trim()).replace(/\n/g, '<br>')}</p>`).join('');
const btn = (href: string, label: string, primary = true) =>
  `<a href="${href}" style="display:inline-block;margin:0 10px 10px 0;${primary ? 'background:#C9A84C;color:#0B0B11' : 'background:#F4F1EA;color:#0B0B11'};text-decoration:none;font-weight:bold;padding:12px 22px;border-radius:8px">${esc(label)}</a>`;

function shell(title: string, inner: string, footer: string) {
  return `<!doctype html><html><body style="margin:0;background:#F4F4F1;font-family:Arial,Helvetica,sans-serif;color:#222">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:12px;overflow:hidden">
<tr><td style="background:#0B0B11;padding:22px 28px"><a href="${SITE}"><img src="${SITE}/brand/email-logo.png" width="255" height="48" alt="Lock &amp; Loft" style="display:block;border:0;color:#C9A84C;font-size:20px"></a></td></tr>
<tr><td style="padding:28px;font-size:15px"><h1 style="margin:0 0 20px;font-size:22px;color:#0B0B11">${esc(title)}</h1>${inner}</td></tr>
<tr><td style="padding:18px 28px;background:#FAFAF8;font-size:12px;color:#777">${footer}</td></tr>
</table></td></tr></table></body></html>`;
}
const subFooter = (lang: string, token: string) => {
  const link = `${SITE}/abonelik/?t=${token}&l=${lang}`;
  return { html: `${esc(T[lang].why)}<br><a href="${link}" style="color:#777">${esc(T[lang].out)}</a>`, link };
};

async function sendBatch(messages: any[]) {
  const key = Deno.env.get('RESEND_API_KEY');
  let sent = 0, failed = 0;
  for (let i = 0; i < messages.length; i += 100) {
    const chunk = messages.slice(i, i + 100);
    const res = await fetch('https://api.resend.com/emails/batch', {
      method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }, body: JSON.stringify(chunk),
    });
    if (res.ok) sent += chunk.length; else failed += chunk.length;
  }
  return { sent, failed };
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

async function welcome(sb: any, userId: string, from: string) {
  const { data: claimed } = await sb.from('profiles').update({ welcome_sent_at: new Date().toISOString() }).eq('id', userId).is('welcome_sent_at', null).select('full_name,preferred_language');
  if (!claimed?.length) return { skipped: 'done_or_missing' };
  const { data: u } = await sb.auth.admin.getUserById(userId);
  const email = u?.user?.email;
  const rollback = () => sb.from('profiles').update({ welcome_sent_at: null }).eq('id', userId);
  if (!email) { await rollback(); return { skipped: 'no_email' }; }
  const lang = lg(claimed[0].preferred_language);
  const first = String(claimed[0].full_name || '').trim().split(/\s+/)[0];
  const t = T[lang];
  const inner = paras(t.welcomeBody) + btn(`${SITE}/${lang}/${PANEL[lang]}/`, t.welcomeBtn) + btn(`${SITE}/${lang}/${PROPS[lang]}/`, t.welcomeBtn2, false);
  const html = shell(t.welcomeTitle.replace('{name}', first ? `, ${first}` : ''), inner, esc(t.welcomeWhy));
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST', headers: { Authorization: `Bearer ${Deno.env.get('RESEND_API_KEY')}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to: [email], subject: t.welcomeSubject, html, tags: [{ name: 'auto_kind', value: 'welcome' }] }),
  });
  if (!res.ok) { await rollback(); return { error: 'send_failed' }; }
  return { ok: true };
}

// Posts published at least 15 minutes ago (grace period for quick fixes) that were not mailed yet.
async function blogPending(sb: any, from: string) {
  const cutoff = new Date(Date.now() - 15 * 60000).toISOString();
  const { data: posts } = await sb.from('blog_posts').select('*').eq('status', 'published').is('subscribers_emailed_at', null).lte('published_at', cutoff);
  const results: any[] = [];
  for (const post of posts || []) {
    const { data: claimed } = await sb.from('blog_posts').update({ subscribers_emailed_at: new Date().toISOString() }).eq('id', post.id).is('subscribers_emailed_at', null).select('id');
    if (!claimed?.length) continue;
    const subs = await subscribers(sb);
    const messages = subs.map((s) => {
      const t = T[s.lang];
      const title = pick(post, 'title', s.lang);
      if (!title) return null;
      const excerpt = clip(pick(post, 'excerpt', s.lang), 300);
      const f = subFooter(s.lang, s.token);
      const url = `${SITE}/${s.lang}/blog/yazi/?s=${encodeURIComponent(post.slug)}`;
      const cover = post.cover_image ? `<p style="margin:0 0 18px"><img src="${esc(post.cover_image)}" width="544" alt="" style="display:block;width:100%;max-width:544px;border-radius:8px"></p>` : '';
      const inner = cover + (excerpt ? paras(excerpt) : '') + btn(url, t.readMore);
      return { from, to: [s.email], subject: title, html: shell(title, inner, f.html), headers: { 'List-Unsubscribe': `<${f.link}>` }, tags: [{ name: 'auto_kind', value: 'blog' }] };
    }).filter(Boolean);
    results.push({ post: post.slug, ...(messages.length ? await sendBatch(messages as any[]) : { sent: 0 }) });
  }
  return { results };
}

// Weekly digest: market notes published in the last 14 days that were not mailed yet (max 5).
async function marketDigest(sb: any, from: string) {
  const since = new Date(Date.now() - 14 * 86400000).toISOString();
  const { data: notes } = await sb.from('market_notes').select('*').eq('status', 'published').is('digest_sent_at', null).gte('published_at', since).order('published_at', { ascending: false }).limit(5);
  if (!notes?.length) return { skipped: 'no_new_notes' };
  const ids = notes.map((n: any) => n.id);
  const { data: claimed } = await sb.from('market_notes').update({ digest_sent_at: new Date().toISOString() }).in('id', ids).is('digest_sent_at', null).select('id');
  if (!claimed?.length) return { skipped: 'claimed' };
  const subs = await subscribers(sb);
  const messages = subs.map((s) => {
    const t = T[s.lang];
    const f = subFooter(s.lang, s.token);
    const items = notes.map((n: any) => {
      const src = n.source_url ? `<a href="${esc(n.source_url)}" style="color:#777">${esc(t.source)}: ${esc(n.source_name || n.source_url)}</a>` : esc(n.source_name ? `${t.source}: ${n.source_name}` : '');
      return `<div style="margin:0 0 22px;padding:0 0 18px;border-bottom:1px solid #EEE"><h2 style="margin:0 0 8px;font-size:17px;color:#0B0B11">${esc(pick(n, 'title', s.lang))}</h2><p style="margin:0 0 8px;line-height:1.6">${esc(clip(pick(n, 'summary', s.lang), 320))}</p><div style="font-size:12px;color:#777">${src}</div></div>`;
    }).join('');
    const inner = `<p style="margin:0 0 20px;line-height:1.6">${esc(t.digestIntro)}</p>${items}${btn(`${SITE}/${s.lang}/${MARKET[s.lang]}/`, t.allNotes)}`;
    return { from, to: [s.email], subject: t.digestSubject, html: shell(t.digestSubject, inner, f.html), headers: { 'List-Unsubscribe': `<${f.link}>` }, tags: [{ name: 'auto_kind', value: 'market_digest' }] };
  });
  const r = messages.length ? await sendBatch(messages) : { sent: 0, failed: 0 };
  return { notes: notes.length, ...r };
}

Deno.serve(async (req) => {
  try {
    if (req.headers.get('x-auto-token') !== TOKEN) return json({ error: 'forbidden' }, 403);
    const from = Deno.env.get('MAIL_FROM');
    if (!from || !Deno.env.get('RESEND_API_KEY')) return json({ error: 'not_configured' }, 400);
    const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const body = await req.json().catch(() => ({}));
    if (body.kind === 'welcome' && /^[0-9a-f-]{36}$/i.test(String(body.user_id))) return json(await welcome(sb, body.user_id, from));
    if (body.kind === 'blog_pending') return json(await blogPending(sb, from));
    if (body.kind === 'market_digest') return json(await marketDigest(sb, from));
    return json({ error: 'bad_request' }, 400);
  } catch (e) {
    return json({ error: 'server_error', detail: String(e) }, 500);
  }
});
