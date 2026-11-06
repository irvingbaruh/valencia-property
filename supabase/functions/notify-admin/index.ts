import { createClient } from 'npm:@supabase/supabase-js@2';

// Called by database triggers (pg_net) when a contact message, consultation request or
// new member is created. The function only acts on a real, not-yet-notified row, so a
// forged call with an unknown id does nothing, and every event is mailed at most once.
const SITE = 'https://lockandloft.com';
const ADMIN = `${SITE}/lockandloft/admin`;
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { 'Content-Type': 'application/json' } });
const esc = (s: unknown) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const SETTING: Record<string, string> = { contact_message: 'contact_message', intake: 'intake', member: 'member' };
const TABLE: Record<string, string> = { contact_message: 'contact_messages', intake: 'client_intake', member: 'profiles' };

const row = (k: string, v: unknown) =>
  v ? `<tr><td style="padding:4px 12px 4px 0;color:#777;vertical-align:top">${esc(k)}</td><td style="padding:4px 0">${esc(v)}</td></tr>` : '';

Deno.serve(async (req) => {
  try {
    const { kind, id } = await req.json();
    if (!SETTING[kind] || !/^[0-9a-f-]{36}$/i.test(String(id))) return json({ error: 'bad_request' }, 400);
    const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

    const { data: cfgRow } = await sb.from('site_settings').select('value').eq('key', 'admin_notifications').maybeSingle();
    const cfg = (cfgRow?.value || {}) as { emails?: string[]; contact_message?: boolean; intake?: boolean; member?: boolean };
    const emails = (cfg.emails || []).filter((e) => /^\S+@\S+\.\S+$/.test(e));
    if (!cfg[SETTING[kind] as 'intake'] || emails.length === 0) return json({ skipped: 'disabled' });

    const { data: r } = await sb.from(TABLE[kind]).select('*').eq('id', id).maybeSingle();
    if (!r || r.admin_notified_at) return json({ skipped: 'not_found_or_done' });
    // claim the row first so concurrent calls cannot send twice
    const { data: claimed } = await sb.from(TABLE[kind]).update({ admin_notified_at: new Date().toISOString() }).eq('id', id).is('admin_notified_at', null).select('id');
    if (!claimed || claimed.length === 0) return json({ skipped: 'claimed' });

    let subject = '';
    let rows = '';
    let link = `${ADMIN}/bildirimler/`;
    if (kind === 'contact_message') {
      subject = `Yeni iletişim mesajı: ${r.name}`;
      rows = row('Ad', r.name) + row('E-posta', r.email) + row('Telefon', r.phone) + row('Dil', r.lang) + row('Mesaj', r.message);
    } else {
      const uid = kind === 'intake' ? r.user_id : r.id;
      const { data: p } = await sb.from('profiles_with_email').select('full_name,email,phone').eq('id', uid).maybeSingle();
      link = `${ADMIN}/uyeler/detay/?id=${uid}`;
      if (kind === 'intake') {
        const a = r.answers || {};
        subject = `Yeni danışmanlık talebi: ${p?.full_name || p?.email || ''}`;
        rows = row('Üye', p?.full_name) + row('E-posta', p?.email) + row('Telefon', p?.phone) + row('Bütçe', a.budget) + row('Zaman', a.timeframe) + row('Not', a.note);
      } else {
        subject = `Yeni üye: ${p?.full_name || p?.email || ''}`;
        rows = row('Ad', p?.full_name) + row('E-posta', p?.email) + row('Telefon', p?.phone);
      }
    }
    const html = `<!doctype html><html><body style="font-family:Arial,Helvetica,sans-serif;color:#222;font-size:15px"><h2 style="margin:0 0 14px">${esc(subject)}</h2><table style="font-size:14px;border-collapse:collapse">${rows}</table><p style="margin-top:20px"><a href="${link}" style="color:#9A7B2C">Yönetim panelinde aç</a></p></body></html>`;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${Deno.env.get('RESEND_API_KEY')}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: Deno.env.get('MAIL_FROM'), to: emails, subject, html }),
    });
    if (!res.ok) {
      await sb.from(TABLE[kind]).update({ admin_notified_at: null }).eq('id', id); // allow a retry
      return json({ error: 'send_failed' }, 502);
    }
    return json({ ok: true });
  } catch {
    return json({ error: 'server_error' }, 500);
  }
});
