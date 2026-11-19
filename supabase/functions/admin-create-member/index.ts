import { createClient } from 'npm:@supabase/supabase-js@2';

// Admin creates a member account (e.g. an existing client) with an automatic temporary password.
// The member is asked to choose their own password at first sign-in (user_metadata.must_change_password).
//  { email, full_name, phone?, lang?, stage? }  ->  { ok, id, email, password }   (the password is shown once, never stored)
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'content-type, authorization, apikey, x-client-info',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...CORS, 'Content-Type': 'application/json' } });
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const STAGES = ['new', 'contacted', 'qualified', 'viewing', 'offer', 'won', 'lost'];
// no look-alike characters (0/O, 1/l/I) so it can be read out or typed from a phone
const ALPHA = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const tempPassword = () => {
  const r = crypto.getRandomValues(new Uint8Array(10));
  const s = [...r].map((x) => ALPHA[x % ALPHA.length]).join('');
  return `${s.slice(0, 5)}-${s.slice(5)}`;
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
  try {
    const auth = req.headers.get('authorization') || '';
    const jwt = auth.replace(/^Bearer\s+/i, '');
    const userClient = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: auth } } });
    const { data: isAdmin } = await userClient.rpc('is_admin');
    if (!jwt || !isAdmin) return json({ error: 'forbidden' }, 403);

    const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: me } = await sb.auth.getUser(jwt);
    const adminId = me?.user?.id;
    if (!adminId) return json({ error: 'forbidden' }, 403);

    const b = await req.json().catch(() => ({}));
    const email = String(b.email || '').trim().toLowerCase().slice(0, 200);
    const name = String(b.full_name || '').replace(/\s+/g, ' ').trim().slice(0, 200);
    const phone = String(b.phone || '').replace(/[^\d+]/g, '').slice(0, 20);
    const lang = ['tr', 'es', 'en', 'de'].includes(b.lang) ? b.lang : 'tr';
    const stage = STAGES.includes(b.stage) ? b.stage : 'won';
    if (!EMAIL.test(email)) return json({ error: 'bad_email' }, 400);
    if (!name) return json({ error: 'missing_name' }, 400);

    const password = tempPassword();
    // created unconfirmed first: the welcome mail fires when the address becomes confirmed, and must not go out
    // to a client who has not been given their login yet
    const { data: created, error: cErr } = await sb.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
      user_metadata: { full_name: name, phone, preferred_language: lang, lang, must_change_password: true },
    });
    if (cErr || !created?.user) {
      const msg = String(cErr?.message || '').toLowerCase();
      if (/already|registered|exists/.test(msg)) return json({ error: 'email_exists' }, 409);
      return json({ error: 'create_failed' }, 500);
    }
    const id = created.user.id;

    // profile row comes from the sign-up trigger; mark it as admin-created and silence the automatic welcome/new-member mails
    const now = new Date().toISOString();
    const { error: pErr } = await sb.from('profiles').update({ source: 'admin_created', channel: 'admin', welcome_sent_at: now, admin_notified_at: now }).eq('id', id);
    if (pErr) {
      await sb.auth.admin.deleteUser(id);
      return json({ error: 'profile_failed' }, 500);
    }
    await sb.auth.admin.updateUserById(id, { email_confirm: true });
    await sb.from('lead_state').upsert({ user_id: id, stage, updated_by: adminId, updated_at: now }, { onConflict: 'user_id' });

    return json({ ok: true, id, email, password });
  } catch {
    return json({ error: 'bad_request' }, 400);
  }
});
