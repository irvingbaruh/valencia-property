import { createClient } from 'npm:@supabase/supabase-js@2';

// Called by database triggers (pg_net). Acts only on a real, not-yet-notified row, so a forged
// call with an unknown id does nothing and every event is mailed at most once.
const ADMIN = 'https://lockandloft.com/lockandloft/admin';
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { 'Content-Type': 'application/json' } });
const esc = (s: unknown) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const KINDS: Record<string, { setting: string; table: string; claim: string }> = {
  contact_message: { setting: 'contact_message', table: 'contact_messages', claim: 'admin_notified_at' },
  intake: { setting: 'intake', table: 'client_intake', claim: 'admin_notified_at' },
  member: { setting: 'member', table: 'profiles', claim: 'admin_notified_at' },
  document_upload: { setting: 'document_upload', table: 'documents', claim: 'admin_notified_at' },
  document_delete_request: { setting: 'doc_delete_request', table: 'documents', claim: 'delete_notified_at' },
};
const row = (k: string, v: unknown) =>
  v ? `<tr><td style="padding:4px 12px 4px 0;color:#777;vertical-align:top">${esc(k)}</td><td style="padding:4px 0">${esc(v)}</td></tr>` : '';

Deno.serve(async (req) => {
  try {
    const { kind, id } = await req.json();
    const K = KINDS[kind];
    if (!K || !/^[0-9a-f-]{36}$/i.test(String(id))) return json({ error: 'bad_request' }, 400);
    const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

    const { data: cfgRow } = await sb.from('site_settings').select('value').eq('key', 'admin_notifications').maybeSingle();
    const cfg = (cfgRow?.value || {}) as Record<string, unknown>;
    const emails = ((cfg.emails as string[]) || []).filter((e) => /^\S+@\S+\.\S+$/.test(e));
    if (!cfg[K.setting] || emails.length === 0) return json({ skipped: 'disabled' });

    const { data: r } = await sb.from(K.table).select('*').eq('id', id).maybeSingle();
    if (!r || r[K.claim]) return json({ skipped: 'not_found_or_done' });
    if (kind === 'document_delete_request' && !r.delete_requested_at) return json({ skipped: 'no_request' });
    const { data: claimed } = await sb.from(K.table).update({ [K.claim]: new Date().toISOString() }).eq('id', id).is(K.claim, null).select('id');
    if (!claimed || claimed.length === 0) return json({ skipped: 'claimed' });

    const who = async (uid: string) => {
      const [{ data: p }, { data: u }] = await Promise.all([
        sb.from('profiles').select('full_name,phone').eq('id', uid).maybeSingle(),
        sb.auth.admin.getUserById(uid),
      ]);
      return { name: p?.full_name || '', phone: p?.phone || '', email: u?.user?.email || '' };
    };

    let subject = '';
    let rows = '';
    let link = `${ADMIN}/bildirimler/`;
    if (kind === 'contact_message') {
      subject = `Yeni iletişim mesajı: ${r.name}`;
      rows = row('Ad', r.name) + row('E-posta', r.email) + row('Telefon', r.phone) + row('Dil', r.lang) + row('Mesaj', r.message);
    } else {
      const uid = kind === 'member' ? r.id : r.user_id;
      const p = await who(uid);
      link = `${ADMIN}/uyeler/detay/?id=${uid}`;
      const base = row('Üye', p.name) + row('E-posta', p.email) + row('Telefon', p.phone);
      if (kind === 'intake') {
        const a = r.answers || {};
        subject = `Yeni danışmanlık talebi: ${p.name || p.email}`;
        rows = base + row('Bütçe', a.budget) + row('Zaman', a.timeframe) + row('Not', a.note);
      } else if (kind === 'member') {
        subject = `Yeni üye: ${p.name || p.email}`;
        rows = base;
      } else if (kind === 'document_upload') {
        subject = `Yeni belge yüklendi: ${p.name || p.email}`;
        rows = base + row('Dosya', r.file_name);
        link = `${ADMIN}/dosyalar/`;
      } else {
        subject = `Belge silme isteği: ${p.name || p.email}`;
        rows = base + row('Dosya', r.file_name) + row('Neden', r.delete_reason);
        link = `${ADMIN}/dosyalar/?filter=delete`;
      }
    }
    const html = `<!doctype html><html><body style="font-family:Arial,Helvetica,sans-serif;color:#222;font-size:15px"><h2 style="margin:0 0 14px">${esc(subject)}</h2><table style="font-size:14px;border-collapse:collapse">${rows}</table><p style="margin-top:20px"><a href="${link}" style="color:#9A7B2C">Yönetim panelinde aç</a></p></body></html>`;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${Deno.env.get('RESEND_API_KEY')}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: Deno.env.get('MAIL_FROM'), to: emails, subject, html }),
    });
    if (!res.ok) {
      await sb.from(K.table).update({ [K.claim]: null }).eq('id', id);
      return json({ error: 'send_failed' }, 502);
    }
    return json({ ok: true });
  } catch {
    return json({ error: 'server_error' }, 500);
  }
});
