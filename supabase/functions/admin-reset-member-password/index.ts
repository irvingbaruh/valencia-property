import { createClient } from 'npm:@supabase/supabase-js@2';

// Admin gives a member a new temporary password (member forgot it / never received the first one).
// The member must choose their own at the next sign-in. { id } -> { ok, email, password }  (shown once, never stored)
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'content-type, authorization, apikey, x-client-info',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...CORS, 'Content-Type': 'application/json' } });
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
    if (!me?.user?.id) return json({ error: 'forbidden' }, 403);

    const b = await req.json().catch(() => ({}));
    const id = String(b.id || '');
    if (!/^[0-9a-f-]{36}$/i.test(id)) return json({ error: 'bad_id' }, 400);
    if (id === me.user.id) return json({ error: 'cannot_reset_self' }, 400);

    const { data: prof } = await sb.from('profiles').select('role').eq('id', id).maybeSingle();
    if (!prof) return json({ error: 'not_found' }, 404);
    if (prof.role === 'admin') return json({ error: 'cannot_reset_admin' }, 400);

    const { data: target } = await sb.auth.admin.getUserById(id);
    if (!target?.user) return json({ error: 'not_found' }, 404);

    const password = tempPassword();
    const { error } = await sb.auth.admin.updateUserById(id, {
      password,
      user_metadata: { ...(target.user.user_metadata || {}), must_change_password: true },
    });
    if (error) return json({ error: 'reset_failed' }, 500);
    return json({ ok: true, email: target.user.email, password });
  } catch {
    return json({ error: 'bad_request' }, 400);
  }
});
