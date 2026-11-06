import { createClient } from 'npm:@supabase/supabase-js@2';

const TYPES: Record<string, string> = {
  'email.delivered': 'delivered',
  'email.opened': 'opened',
  'email.clicked': 'clicked',
  'email.bounced': 'bounced',
  'email.complained': 'complained',
};

const b64ToBytes = (b64: string) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));

async function verify(req: Request, body: string, secret: string) {
  const id = req.headers.get('svix-id');
  const ts = req.headers.get('svix-timestamp');
  const sigHeader = req.headers.get('svix-signature');
  if (!id || !ts || !sigHeader) return false;
  if (Math.abs(Date.now() / 1000 - Number(ts)) > 300) return false;
  const key = await crypto.subtle.importKey('raw', b64ToBytes(secret.replace(/^whsec_/, '')), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${id}.${ts}.${body}`));
  const expected = btoa(String.fromCharCode(...new Uint8Array(mac)));
  return sigHeader.split(' ').some((s) => s.split(',')[1] === expected);
}

function tagValue(tags: unknown, name: string): string | null {
  if (!tags) return null;
  if (Array.isArray(tags)) return (tags.find((t: any) => t?.name === name) as any)?.value ?? null;
  if (typeof tags === 'object') return (tags as Record<string, string>)[name] ?? null;
  return null;
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('method not allowed', { status: 405 });
  const secret = Deno.env.get('RESEND_WEBHOOK_SECRET');
  if (!secret) return new Response('not configured', { status: 500 });
  const body = await req.text();
  if (!(await verify(req, body, secret))) return new Response('invalid signature', { status: 401 });

  try {
    const evt = JSON.parse(body);
    const type = TYPES[evt.type];
    const d = evt.data || {};
    const campaignId = tagValue(d.tags, 'campaign_id');
    if (!type || !campaignId || tagValue(d.tags, 'test') === '1') return new Response('ignored', { status: 200 });

    const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const recipient = Array.isArray(d.to) ? d.to[0] : d.to;
    const { error } = await sb.from('mailing_events').upsert(
      {
        campaign_id: campaignId,
        email_id: d.email_id ?? null,
        recipient: String(recipient || '').toLowerCase(),
        type,
        link: d.click?.link ?? null,
        svix_id: req.headers.get('svix-id'),
      },
      { onConflict: 'svix_id', ignoreDuplicates: true },
    );
    if (error) return new Response('db error', { status: 500 });
    return new Response('ok', { status: 200 });
  } catch {
    return new Response('bad request', { status: 400 });
  }
});
