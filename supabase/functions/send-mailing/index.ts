import { createClient } from 'npm:@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
const SITE = 'https://lockandloft.com';
const LANGS = ['tr', 'es', 'en', 'de'];
const FOOTER: Record<string, { why: string; out: string }> = {
  tr: { why: 'Bu e-postayı Lock & Loft bültenine abone olduğunuz için aldınız.', out: 'Abonelikten çık' },
  es: { why: 'Recibe este correo porque se suscribió al boletín de Lock & Loft.', out: 'Darse de baja' },
  en: { why: 'You are receiving this email because you subscribed to the Lock & Loft newsletter.', out: 'Unsubscribe' },
  de: { why: 'Sie erhalten diese E-Mail, weil Sie den Lock & Loft Newsletter abonniert haben.', out: 'Abmelden' },
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function bodyToHtml(text: string) {
  return text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => {
      let h = esc(p).replace(/\n/g, '<br>');
      h = h.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      h = h.replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" style="color:#9A7B2C">$1</a>');
      return `<p style="margin:0 0 16px;line-height:1.6">${h}</p>`;
    })
    .join('');
}

function render(subject: string, body: string, lang: string, token: string) {
  const f = FOOTER[lang] || FOOTER.en;
  const link = `${SITE}/abonelik/?t=${token}&l=${lang}`;
  const html = `<!doctype html><html><body style="margin:0;background:#F4F4F1;font-family:Arial,Helvetica,sans-serif;color:#222">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:12px;overflow:hidden">
<tr><td style="background:#0B0B11;padding:22px 28px"><a href="${SITE}"><img src="${SITE}/brand/email-logo.png" width="255" height="48" alt="Lock &amp; Loft" style="display:block;border:0;color:#C9A84C;font-size:20px"></a></td></tr>
<tr><td style="padding:28px;font-size:15px"><h1 style="margin:0 0 20px;font-size:22px;color:#0B0B11">${esc(subject)}</h1>${bodyToHtml(body)}</td></tr>
<tr><td style="padding:18px 28px;background:#FAFAF8;font-size:12px;color:#777">${esc(f.why)}<br><a href="${link}" style="color:#777">${esc(f.out)}</a></td></tr>
</table></td></tr></table></body></html>`;
  return { html, link };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  try {
    const auth = req.headers.get('Authorization') || '';
    const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: auth } },
    });
    const { data: userData } = await sb.auth.getUser();
    const user = userData?.user;
    if (!user) return json({ error: 'unauthorized' }, 401);
    const { data: isAdmin } = await sb.rpc('is_admin');
    if (!isAdmin) return json({ error: 'forbidden' }, 403);

    const key = Deno.env.get('RESEND_API_KEY');
    const from = Deno.env.get('MAIL_FROM');
    if (!key || !from) return json({ error: 'not_configured' }, 400);

    const { campaign_id, test } = await req.json();
    const { data: c, error: ce } = await sb.from('mailing_campaigns').select('*').eq('id', campaign_id).single();
    if (ce || !c) return json({ error: 'campaign_not_found' }, 404);
    if (c.status === 'sent' && !test) return json({ error: 'already_sent' }, 400);

    const pick = (lang: string) => {
      for (const l of [lang, 'en', 'tr', 'es', 'de']) {
        if (c[`subject_${l}`]?.trim() && c[`body_${l}`]?.trim()) return { l, subject: c[`subject_${l}`], body: c[`body_${l}`] };
      }
      return null;
    };

    let recipients: { email: string; lang: string; token: string }[] = [];
    if (test) {
      recipients = [{ email: user.email!, lang: 'tr', token: '00000000-0000-0000-0000-000000000000' }];
    } else {
      const { data: subs, error: se } = await sb.rpc('admin_mailing_subscribers');
      if (se) return json({ error: 'subscribers_failed' }, 500);
      const allowed: string[] = Array.isArray(c.audience_langs) && c.audience_langs.length ? c.audience_langs : LANGS;
      recipients = (subs || [])
        .filter((s: any) => allowed.includes(LANGS.includes(s.lang) ? s.lang : 'tr'))
        .map((s: any) => ({
        email: s.email,
        lang: LANGS.includes(s.lang) ? s.lang : 'tr',
        token: s.unsubscribe_token,
      }));
    }

    const messages: any[] = [];
    for (const r of recipients) {
      const m = pick(r.lang);
      if (!m) continue;
      const { html, link } = render(m.subject, m.body, m.l, r.token);
      messages.push({
        from,
        to: [r.email],
        subject: (test ? '[TEST] ' : '') + m.subject,
        html,
        headers: { 'List-Unsubscribe': `<${link}>` },
      });
    }
    if (!messages.length) return json({ error: 'nothing_to_send' }, 400);

    let sent = 0;
    let failed = 0;
    for (let i = 0; i < messages.length; i += 100) {
      const chunk = messages.slice(i, i + 100);
      const res = await fetch('https://api.resend.com/emails/batch', {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(chunk),
      });
      if (res.ok) sent += chunk.length;
      else failed += chunk.length;
    }

    if (!test) {
      await sb
        .from('mailing_campaigns')
        .update({ status: failed === messages.length ? 'draft' : 'sent', sent_at: new Date().toISOString(), sent_count: sent, failed_count: failed, updated_at: new Date().toISOString() })
        .eq('id', campaign_id);
    }
    return json({ sent, failed, test: Boolean(test) });
  } catch (e) {
    return json({ error: 'server_error', detail: String(e) }, 500);
  }
});
