import { createClient } from 'npm:@supabase/supabase-js@2';

// Mails a member the same message that was added to their in-app notifications, in their language.
// Called by a database trigger; acts only on a real notification that has not been mailed yet.
const SITE = 'https://lockandloft.com';
const PANEL: Record<string, string> = { tr: 'panel', es: 'mi-cuenta', en: 'account', de: 'mein-konto' };
const BTN: Record<string, string> = { tr: 'Hesabıma git', es: 'Ir a mi cuenta', en: 'Open my account', de: 'Zum Konto' };
const WHY: Record<string, string> = {
  tr: 'Bu e-postayı Lock & Loft hesabınızdaki bir güncelleme nedeniyle aldınız.',
  es: 'Recibe este correo por una actualización en su cuenta de Lock & Loft.',
  en: 'You are receiving this email because of an update in your Lock & Loft account.',
  de: 'Sie erhalten diese E-Mail wegen einer Aktualisierung in Ihrem Lock & Loft-Konto.',
};
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { 'Content-Type': 'application/json' } });
const esc = (s: unknown) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

Deno.serve(async (req) => {
  try {
    const { id } = await req.json();
    if (!/^[0-9a-f-]{36}$/i.test(String(id))) return json({ error: 'bad_request' }, 400);
    const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: n } = await sb.from('notifications').select('*').eq('id', id).maybeSingle();
    if (!n || n.email_sent) return json({ skipped: 'not_found_or_done' });
    const { data: claimed } = await sb.from('notifications').update({ email_sent: true, email_sent_at: new Date().toISOString() }).eq('id', id).eq('email_sent', false).select('id');
    if (!claimed || claimed.length === 0) return json({ skipped: 'claimed' });

    const [{ data: p }, { data: u }] = await Promise.all([
      sb.from('profiles').select('preferred_language,full_name').eq('id', n.user_id).maybeSingle(),
      sb.auth.admin.getUserById(n.user_id),
    ]);
    const email = u?.user?.email;
    if (!email) return json({ skipped: 'no_email' });
    const lang = ['tr', 'es', 'en', 'de'].includes(p?.preferred_language) ? p!.preferred_language : 'tr';
    const title = n[`title_${lang}`] || n.title_tr || '';
    const body = n[`body_${lang}`] || n.body_tr || '';
    if (!title) return json({ skipped: 'empty' });
    const link = `${SITE}/${lang}/${PANEL[lang]}/`;

    const html = `<!doctype html><html><body style="margin:0;background:#F4F4F1;font-family:Arial,Helvetica,sans-serif;color:#222">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:12px;overflow:hidden">
<tr><td style="background:#0B0B11;padding:22px 28px"><a href="${SITE}"><img src="${SITE}/brand/email-logo.png" width="255" height="48" alt="Lock &amp; Loft" style="display:block;border:0;color:#C9A84C;font-size:20px"></a></td></tr>
<tr><td style="padding:28px;font-size:15px"><h1 style="margin:0 0 14px;font-size:20px;color:#0B0B11">${esc(title)}</h1>${body ? `<p style="margin:0 0 22px;line-height:1.6">${esc(body)}</p>` : ''}<a href="${link}" style="display:inline-block;background:#C9A84C;color:#0B0B11;text-decoration:none;font-weight:bold;padding:12px 22px;border-radius:8px">${esc(BTN[lang])}</a></td></tr>
<tr><td style="padding:18px 28px;background:#FAFAF8;font-size:12px;color:#777">${esc(WHY[lang])}</td></tr>
</table></td></tr></table></body></html>`;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${Deno.env.get('RESEND_API_KEY')}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: Deno.env.get('MAIL_FROM'), to: [email], subject: title, html }),
    });
    if (!res.ok) {
      await sb.from('notifications').update({ email_sent: false, email_sent_at: null }).eq('id', id);
      return json({ error: 'send_failed' }, 502);
    }
    return json({ ok: true });
  } catch {
    return json({ error: 'server_error' }, 500);
  }
});
