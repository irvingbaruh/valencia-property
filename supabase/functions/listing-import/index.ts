import { createClient } from 'npm:@supabase/supabase-js@2';

// Admin-only: reads a public RE/MAX listing page, copies its photos to our storage and drafts TR/ES/EN/DE texts.
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'content-type, authorization, apikey, x-client-info',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const out = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { 'Content-Type': 'application/json', ...CORS } });
const MAX_PHOTOS = 25;

// Some sites (remax.es) put raw line breaks inside JSON strings; escape control characters that sit inside strings.
function lenientJson(src: string) {
  try { return JSON.parse(src); } catch (_) { /* repair below */ }
  let o = '', inStr = false, esc = false;
  for (const ch of src) {
    if (inStr) {
      if (esc) { o += ch; esc = false; continue; }
      if (ch === '\\') { o += ch; esc = true; continue; }
      if (ch === '"') { inStr = false; o += ch; continue; }
      if (ch === '\n') { o += '\\n'; continue; }
      if (ch === '\r') continue;
      if (ch === '\t') { o += ' '; continue; }
      o += ch;
    } else { if (ch === '"') inStr = true; o += ch; }
  }
  return JSON.parse(o);
}
function jsonld(html: string) {
  const nodes: any[] = [];
  for (const m of html.matchAll(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)) {
    try { const x = lenientJson(m[1]); (x['@graph'] || [x]).forEach((n: any) => nodes.push(n)); } catch (_) { /* ignore */ }
  }
  return nodes;
}
const num = (v: unknown) => { const m = String(v ?? '').replace(/\./g, '').replace(',', '.').match(/-?\d+(\.\d+)?/); return m ? Number(m[0]) : null; };
const strip = (h: string) => h.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
function mapTypeEs(slug: string) {
  const t = slug.toLowerCase();
  if (/piso|apartamento|atico|duplex|estudio|loft|planta/.test(t)) return 'apartment';
  if (/villa/.test(t)) return 'villa';
  if (/chalet|casa|adosado|pareado|finca|masia|cortijo|rustica/.test(t)) return 'house';
  if (/terreno|solar|parcela|suelo/.test(t)) return 'land';
  if (/local|oficina|nave|negocio|hotel|edificio/.test(t)) return 'commercial';
  return 'other';
}
// remax.com: listings with a private address are identified by ?RID=... — without it the site shows a generic search page.
const pageUrl = (u: URL) => {
  const rid = u.searchParams.get('RID');
  return u.origin + u.pathname + (rid && /^[\w-]{3,60}$/.test(rid) ? `?RID=${rid}` : '');
};
const BROWSER_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';
// Follows redirects by hand: keeps cookies and forces https on the same host (remax.es can bounce between http and https).
async function getPage(start: string) {
  let url = start; const jar: Record<string, string> = {};
  for (let hop = 0; hop < 6; hop++) {
    const cookie = Object.entries(jar).map(([k, v]) => `${k}=${v}`).join('; ');
    const r = await fetch(url, { redirect: 'manual', headers: { 'user-agent': BROWSER_UA, accept: 'text/html,application/xhtml+xml', 'accept-language': 'es-ES,es;q=0.9,en;q=0.5', ...(cookie ? { cookie } : {}) } });
    for (const c of (r.headers as any).getSetCookie?.() || []) { const kv = c.split(';')[0]; const i = kv.indexOf('='); if (i > 0) jar[kv.slice(0, i)] = kv.slice(i + 1); }
    if (r.status >= 300 && r.status < 400 && r.headers.get('location')) {
      const next = new URL(r.headers.get('location')!, url);
      if (next.hostname.replace(/^www\./, '') === new URL(url).hostname.replace(/^www\./, '')) next.protocol = 'https:';
      await r.body?.cancel();
      url = next.toString();
      continue;
    }
    return r;
  }
  throw new Error('redirect_loop');
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

async function finish(d: any, srcImgs: string[], id: string) {
    const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: dup } = await sb.from('properties').select('id,title_tr').eq('source', 'remax').eq('external_id', d.id).maybeSingle();

    // Copy photos (5 at a time) into our own storage so the site never hot-links RE/MAX.
    const images: string[] = [];
    const list = srcImgs.slice(0, MAX_PHOTOS);
    for (let i = 0; i < list.length; i += 5) {
      const res = await Promise.all(list.slice(i, i + 5).map(async (src, k) => {
        try {
          const pr = await fetch(src, { headers: d.referer ? { referer: d.referer, 'user-agent': BROWSER_UA } : {} });
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
}

function importEs(text: string, u: URL, id: string) {
  const nodes = jsonld(text);
  const prod = nodes.find((n) => n['@type'] === 'Product' || n.offers) || {};
  const offer = prod.offers || {};
  const place = offer.availableAtOrFrom?.address || {};
  // "Detalles" block: <div class="col-md-6 px-0 py-1">Superficie construida: 169 m2</div>
  const det: Record<string, string> = {};
  for (const m of text.matchAll(/class="col-md-6 px-0 py-1">\s*([^<:]{2,40}):\s*([\s\S]*?)<\/div>/g)) det[strip(m[1]).toLowerCase()] = strip(m[2]);
  const segs = u.pathname.split('/').filter(Boolean); // buscador-de-inmuebles / venta / local-comercial / provincia / municipio / zona / REF
  const slug = segs[2] || '';
  const ref = (det['ref'] || '').trim() || segs[segs.length - 1] || '';
  const main = typeof prod.image === 'string' ? prod.image : (prod.image?.[0] || '');
  const base = (String(main).match(/\/(\d+\/\d+)\//) || [])[1];
  const srcImgs: string[] = [];
  if (base) {
    const re = new RegExp('https?://[a-z0-9.-]*apinmo\\.com/' + base + '/[\\w.-]+\\.(?:jpe?g|png|webp)', 'gi');
    for (const m of text.matchAll(re)) { const x = m[0].replace(/^http:/, 'https:'); if (!srcImgs.includes(x)) srcImgs.push(x); }
    const order = (x: string) => { const n = (x.match(/\/(\d+)-(\d+)\.\w+$/) || []); return n[2] ? Number(n[2]) : 999; };
    srcImgs.sort((x, y) => order(x) - order(y));
  }
  const built = num(det['superficie construida']);
  const total = num(det['superficie total']);
  const geo = text.match(/(?:lat|latitude)["'\s:=]+(-?\d+\.\d+)[\s\S]{0,60}?(?:lng|lon|longitude)["'\s:=]+(-?\d+\.\d+)/i);
  const sub = slug.replace(/-/g, ' ').replace(/^./, (c) => c.toUpperCase());
  const d: any = {
    id: ref, url: u.origin + u.pathname, description: String(prod.description || '').trim(), referer: 'https://www.remax.es/',
    price: num(offer.price) ?? num(det['precio']), currency: offer.priceCurrency || 'EUR', available: true,
    beds: num(det['habitaciones']) || null, baths: num(det['baños']) || null,
    area: built || null, lot: total && (!built || total > built) ? total : null,
    type: mapTypeEs(slug), sub,
    city: place.addressLocality || '', region: place.addressRegion || '',
    lat: geo ? Number(geo[1]) : null, lng: geo ? Number(geo[2]) : null, yearBuilt: null,
  };
  if (!d.id || (!d.price && !srcImgs.length && !d.description)) return out({ error: 'parse_failed' }, 422);
  return finish(d, srcImgs, id);
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
    const isCom = /^(www\.)?remax\.com$/i.test(u.hostname) && /\/residential\/property\//.test(u.pathname);
    const isEs = /^(www\.)?remax\.es$/i.test(u.hostname) && /^\/buscador-de-inmuebles\/[^/]+\/[^/]+\/.+/.test(u.pathname);
    if (u.protocol !== 'https:' || !(isCom || isEs)) return out({ error: 'unsupported_url' }, 400);

    // The admin can paste the page source when the server cannot reach the site.
    let text = typeof body.html === 'string' && body.html.length > 2000 && body.html.length < 4_000_000 ? body.html : '';
    if (!text) {
      let r: Response;
      try { r = await getPage(isCom ? pageUrl(u) : u.toString().split('?')[0]); } catch (e) { return out({ error: 'fetch_failed', status: 0, detail: String(e).slice(0, 80) }, 502); }
      if (!r.ok) return out({ error: 'fetch_failed', status: r.status }, 502);
      text = await r.text();
    }
    if (isEs) return await importEs(text, u, id);
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
      id: rid, url: pageUrl(u), description: listing.description || prop.description || '',
      price: Number(offer.price) || null, currency: offer.priceCurrency || 'EUR',
      available: !offer.availability || /InStock/i.test(String(offer.availability)),
      beds: prop.numberOfBedrooms ?? null, baths: prop.numberOfBathroomsTotal ?? null,
      area: Number(prop.floorSize?.value) || null, lot: Number(prop.lotSize?.value) || null,
      type: mapType(String(prop['@type'] || ''), ap['Property Sub Type'] || '', u.pathname),
      sub: ap['Property Sub Type'] || String(prop['@type'] || ''),
      city: addr.addressLocality || '', region: addr.addressRegion || '',
      lat: prop.geo?.latitude ?? null, lng: prop.geo?.longitude ?? null, yearBuilt: prop.yearBuilt ?? null,
    };
    if (!d.id || (!d.price && !srcImgs.length && !d.description)) {
      // what the server actually received, so a blocked / different page can be told apart from a changed layout
      const title = (text.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || '';
      return out({ error: 'parse_failed', detail: { len: text.length, title: strip(title).slice(0, 80), ld: nodes.length, from: body.html ? 'paste' : 'fetch' } }, 422);
    }

    return await finish(d, srcImgs, id);
  } catch (e) {
    return out({ error: 'server_error', detail: String(e).slice(0, 200) }, 500);
  }
});
