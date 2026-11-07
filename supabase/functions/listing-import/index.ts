import { createClient } from 'npm:@supabase/supabase-js@2';

// Admin-only: reads a public RE/MAX listing page, copies its photos to our storage and drafts TR/ES/EN/DE texts.
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'content-type, authorization, apikey, x-client-info',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const out = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { 'Content-Type': 'application/json', ...CORS } });
const MAX_PHOTOS = 25;

function jsonld(html: string) {
  const nodes: any[] = [];
  for (const m of html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) {
    try { const x = JSON.parse(m[1]); (x['@graph'] || [x]).forEach((n: any) => nodes.push(n)); } catch (_) { /* ignore */ }
  }
  return nodes;
}
function mapType(t: string, sub: string, url: string) {
  const s = `${t} ${sub} ${url}`.toLowerCase();
  if (/land|lot/.test(sub.toLowerCase())) return 'land';
  if (/multi/.test(s)) return 'other';
  if (/condo|apartment|flat/.test(s)) return 'apartment';
  return 'house';
}
const TYPE_TR: Record<string, string> = { apartment: 'Daire', house: 'Müstakil ev', villa: 'Villa', land: 'Arsa', other: 'Çok birimli mülk', commercial: 'Ticari' };

async function draftTexts(f: any) {
  const key = Deno.env.get('DEEPSEEK_API_KEY');
  if (!key) return null;
  const facts = { type: f.type, subtype: f.sub, city: f.city, region: f.region, price_eur: f.price, bedrooms: f.beds, bathrooms: f.baths, built_m2: f.area, plot_m2: f.lot, year_built: f.yearBuilt, source_description: String(f.description || '').slice(0, 3500) };
  const sys = 'You write property listing texts for lockandloft.com, a Valencia property service for Turkish and international buyers. Use ONLY the facts given; never invent features, distances or numbers. No investment promises, no guarantees of returns, no superlatives like "best". Neutral, clear and warm. Do not mention the agency or any phone/email. Reply with JSON only: {"title":{"tr":"","es":"","en":"","de":""},"description":{"tr":"","es":"","en":"","de":""}}. Titles up to 70 characters, e.g. neighbourhood or city plus type and size. Descriptions 90-170 words, plain paragraphs separated by a blank line.';
  try {
    const r = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: Deno.env.get('DEEPSEEK_MODEL') || 'deepseek-chat', temperature: 0.3, max_tokens: 3000, response_format: { type: 'json_object' }, messages: [{ role: 'system', content: sys }, { role: 'user', content: JSON.stringify(facts) }] }),
      signal: AbortSignal.timeout(60000),
    });
    if (!r.ok) return null;
    const j = await r.json();
    const t = JSON.parse(j.choices?.[0]?.message?.content || '{}');
    return t?.title && t?.description ? t : null;
  } catch (_) { return null; }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
  try {
    const auth = req.headers.get('authorization') || '';
    const userClient = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: auth } } });
    const { data: isAdmin } = await userClient.rpc('is_admin');
    if (!isAdmin) return out({ error: 'forbidden' }, 403);

    const body = await req.json().catch(() => ({}));
    const id = String(body.id || '');
    let u: URL;
    try { u = new URL(String(body.url || '').trim()); } catch (_) { return out({ error: 'bad_url' }, 400); }
    if (!/^[0-9a-f-]{36}$/i.test(id)) return out({ error: 'bad_id' }, 400);
    if (u.protocol !== 'https:' || !/^(www\.)?remax\.com$/i.test(u.hostname) || !/\/residential\/property\//.test(u.pathname)) return out({ error: 'unsupported_url' }, 400);

    const r = await fetch(u.toString().split('?')[0], { headers: { 'user-agent': 'Mozilla/5.0 (compatible; LockLoftBot/1.0)' } });
    if (!r.ok) return out({ error: 'fetch_failed', status: r.status }, 502);
    const text = await r.text();
    const nodes = jsonld(text);
    const listing = nodes.find((n) => n['@type'] === 'RealEstateListing') || {};
    const prop = nodes.find((n) => n.address && n.geo && n['@type'] !== 'RealEstateListing') || {};
    const offer = nodes.find((n) => n['@type'] === 'Offer') || listing.offers || {};
    const ap: Record<string, string> = {};
    (prop.additionalProperty || []).forEach((a: any) => { ap[a.name] = String(a.value); });
    const main = typeof listing.image === 'string' ? listing.image : (listing.image?.[0] || '');
    const hash = (String(main).match(/cirrussystem\.net\/\d+\/([0-9a-f]+)\//) || [])[1];
    const srcImgs: string[] = [];
    if (hash) {
      for (const m of text.matchAll(/photos\.prod\.cirrussystem\.net\/(\d+)\/([0-9a-f]+)\/(\d+)\.(?:jpe?g|webp)/g)) {
        if (m[2] === hash) { const x = 'https://' + m[0]; if (!srcImgs.includes(x)) srcImgs.push(x); }
      }
    }
    const rid = String(listing.identifier?.value || listing.identifier || '') || (u.pathname.match(/\/address-private\/([^/?]+)/) || [])[1] || '';
    const addr = prop.address || {};
    const d: any = {
      id: rid, url: u.origin + u.pathname, description: listing.description || prop.description || '',
      price: Number(offer.price) || null, currency: offer.priceCurrency || 'EUR',
      available: !offer.availability || /InStock/i.test(String(offer.availability)),
      beds: prop.numberOfBedrooms ?? null, baths: prop.numberOfBathroomsTotal ?? null,
      area: Number(prop.floorSize?.value) || null, lot: Number(prop.lotSize?.value) || null,
      type: mapType(String(prop['@type'] || ''), ap['Property Sub Type'] || '', u.pathname),
      sub: ap['Property Sub Type'] || String(prop['@type'] || ''),
      city: addr.addressLocality || '', region: addr.addressRegion || '',
      lat: prop.geo?.latitude ?? null, lng: prop.geo?.longitude ?? null, yearBuilt: prop.yearBuilt ?? null,
    };
    if (!d.id || (!d.price && !srcImgs.length && !d.description)) return out({ error: 'parse_failed' }, 422);

    const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: dup } = await sb.from('properties').select('id,title_tr').eq('source', 'remax').eq('external_id', d.id).maybeSingle();

    // Copy photos (5 at a time) into our own storage so the site never hot-links RE/MAX.
    const images: string[] = [];
    const list = srcImgs.slice(0, MAX_PHOTOS);
    for (let i = 0; i < list.length; i += 5) {
      const res = await Promise.all(list.slice(i, i + 5).map(async (src, k) => {
        try {
          const pr = await fetch(src);
          if (!pr.ok) return null;
          const path = `${id}/${String(i + k + 1).padStart(2, '0')}.jpg`;
          const { error } = await sb.storage.from('properties').upload(path, new Uint8Array(await pr.arrayBuffer()), { contentType: 'image/jpeg', upsert: true, cacheControl: '31536000' });
          return error ? null : sb.storage.from('properties').getPublicUrl(path).data.publicUrl;
        } catch (_) { return null; }
      }));
      res.forEach((x) => x && images.push(x));
    }

    const ai = await draftTexts(d);
    const fallbackTitle = `${d.city || d.region} · ${TYPE_TR[d.type] || 'Mülk'}${d.beds ? ' · ' + d.beds + '+ oda' : ''}`;
    return out({
      ok: true, duplicate: dup || null, ai: !!ai, photos_found: srcImgs.length, available: d.available,
      fields: {
        external_id: d.id, external_url: d.url, property_type: d.type, price: d.price, currency: d.currency,
        bedrooms: d.beds, bathrooms: d.baths, area_sqm: d.area, land_sqm: d.lot, city: d.city, region: d.region,
        latitude: d.lat, longitude: d.lng, images,
        features: [d.sub, d.yearBuilt ? 'Yapım yılı ' + d.yearBuilt : ''].filter(Boolean),
        title_tr: ai?.title?.tr || fallbackTitle, title_es: ai?.title?.es || '', title_en: ai?.title?.en || '', title_de: ai?.title?.de || '',
        description_tr: ai?.description?.tr || '', description_es: ai?.description?.es || '', description_en: ai?.description?.en || d.description || '', description_de: ai?.description?.de || '',
      },
    });
  } catch (e) {
    return out({ error: 'server_error', detail: String(e).slice(0, 200) }, 500);
  }
});
