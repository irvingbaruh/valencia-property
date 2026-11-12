// Minimal static file server for the Next.js static export in out/.
// GoDaddy Node.js Hosting runs `npm start` -> this file.
const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PORT = process.env.PORT || 3000;
const STATIC_DIR = path.join(__dirname, 'out');

// GoDaddy PaaS may keep a stale out/ from a previous deploy.
// ALWAYS extract from the compressed archive to ensure the latest build is served.
const ARCHIVE = path.join(__dirname, 'static-site.tar.gz');
if (fs.existsSync(ARCHIVE)) {
  console.log('Found static-site.tar.gz — extracting (overwrites any existing out/)...');
  try {
    // Ensure out/ directory exists
    if (!fs.existsSync(STATIC_DIR)) {
      fs.mkdirSync(STATIC_DIR, { recursive: true });
    }
    execSync(`tar -xzf "${ARCHIVE}" -C "${STATIC_DIR}"`, { cwd: __dirname, stdio: 'inherit' });
    console.log('Extraction complete.');
  } catch (err) {
    console.error('Failed to extract static-site.tar.gz:', err.message);
    process.exit(1);
  }
} else if (!fs.existsSync(STATIC_DIR)) {
  console.error('FATAL: Neither out/ directory nor static-site.tar.gz found.');
  process.exit(1);
} else {
  console.log('No archive found, using existing out/ directory.');
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.webp': 'image/webp',
  '.webmanifest': 'application/manifest+json',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
};


// Pick the language for a visitor who opens the bare domain.
// 1) language they chose earlier (cookie), 2) country: DE -> de, ES -> es, TR -> tr, anywhere else -> en,
// 3) if the country is unknown, the browser language (tr/de/es), otherwise en.
const LOCALES = ['tr', 'es', 'en', 'de'];
const COUNTRY_LOCALE = { DE: 'de', ES: 'es', TR: 'tr' };

function pickLocale(req) {
  const cookie = /(?:^|;\s*)vp_lang=(tr|es|en|de)\b/.exec(req.headers.cookie || '');
  if (cookie) return cookie[1];

  const country = String(req.headers['cf-ipcountry'] || '').toUpperCase();
  if (/^[A-Z]{2}$/.test(country) && country !== 'XX' && country !== 'T1') {
    return COUNTRY_LOCALE[country] || 'en';
  }

  const accept = String(req.headers['accept-language'] || '').toLowerCase();
  for (const part of accept.split(',')) {
    const code = part.trim().split(/[-;]/)[0];
    if (LOCALES.includes(code) && code !== 'en') return code;
    if (code === 'en') return 'en';
  }
  return 'en';
}

// Localized page URLs (keep in sync with src/lib/routes.js). The export only has
// the Turkish folder names, so /es/contacto/ is served from /es/iletisim/.
const ROUTES = {
  iletisim: { es: 'contacto', en: 'contact', de: 'kontakt' },
  hizmetler: { es: 'servicios', en: 'services', de: 'leistungen' },
  mulkler: { es: 'propiedades', en: 'properties', de: 'immobilien' },
  piyasa: { es: 'mercado', en: 'market', de: 'markt' },
  'roi-hesaplama': { es: 'calculadora-roi', en: 'roi-calculator', de: 'rendite-rechner' },
  giris: { es: 'acceder', en: 'login', de: 'anmelden' },
  panel: { es: 'mi-cuenta', en: 'account', de: 'mein-konto' },
  gizlilik: { es: 'privacidad', en: 'privacy', de: 'datenschutz' },
  hakkimizda: { es: 'nosotros', en: 'about', de: 'ueber-uns' },
  sss: { es: 'preguntas-frecuentes', en: 'faq', de: 'haeufige-fragen' },
  sozluk: { es: 'glosario', en: 'glossary', de: 'glossar' },
  'sifre-yenile': { es: 'restablecer-contrasena', en: 'reset-password', de: 'passwort-zuruecksetzen' },
};
const SLUG_TO_CANONICAL = {};
for (const [canon, byLocale] of Object.entries(ROUTES)) {
  for (const [loc, slug] of Object.entries(byLocale)) SLUG_TO_CANONICAL[`${loc}/${slug}`] = canon;
}

const SERVICE_SLUGS = {
  'mulk-arama': { es: 'busqueda-propiedades', en: 'property-search', de: 'immobiliensuche' },
  'hukuki-destek': { es: 'asesoria-legal', en: 'legal-support', de: 'rechtsberatung' },
  'dekorasyon-mobilya': { es: 'decoracion-mobiliario', en: 'decor-furniture', de: 'einrichtung-moebel' },
  renovasyon: { es: 'reformas', en: 'renovation', de: 'renovierung' },
  'kira-yonetimi': { es: 'gestion-alquileres', en: 'rental-management', de: 'vermietungsverwaltung' },
};
const SERVICE_TO_CANONICAL = {};
for (const [canon, byLocale] of Object.entries(SERVICE_SLUGS)) {
  for (const [loc, slug] of Object.entries(byLocale)) SERVICE_TO_CANONICAL[`${loc}/${slug}`] = canon;
}

function getMime(filePath) {
  return MIME_TYPES[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
}

function tryFile(filePath) {
  try {
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      return filePath;
    }
  } catch {}
  return null;
}


// ---------------------------------------------------------------------------------------------
// SEO: canonical + hreflang, per-page titles, listing/blog meta, sitemap.xml and robots.txt.
// The site is a static export, so these are added to the HTML as it is served.
// ---------------------------------------------------------------------------------------------
const SITE = 'https://lockandloft.com';
const SB_URL = 'https://jkpnlwtiyqmfnmvjjqxn.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprcG5sd3RpeXFtZm5tdmpqcXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMzNjc3OTEsImV4cCI6MjEwODk0Mzc5MX0.Qzg8VGiH_IozznQCwFRxnlIMo0Q2D83AK8qhHN1Bz2s'; // public anon key (same one the browser uses)
let SEO = { home: {}, pages: {}, services: {} };
try { SEO = JSON.parse(fs.readFileSync(path.join(__dirname, 'seo-meta.json'), 'utf8')); } catch (e) { console.error('seo-meta.json missing'); }

const PAGE_KEYS = ['iletisim', 'hizmetler', 'mulkler', 'roi-hesaplama', 'piyasa', 'blog', 'gizlilik', 'hakkimizda', 'remax', 'sss', 'sozluk'];
const SERVICE_KEYS = ['mulk-arama', 'hukuki-destek', 'dekorasyon-mobilya', 'renovasyon', 'kira-yonetimi', 'home-staging'];
const NOINDEX_KEYS = ['giris', 'panel', 'sifre-yenile'];

const pageSlug = (loc, key) => (loc === 'tr' ? key : (ROUTES[key] && ROUTES[key][loc]) || key);
const svcSlug = (loc, svc) => (loc === 'tr' ? svc : (SERVICE_SLUGS[svc] && SERVICE_SLUGS[svc][loc]) || svc);
// key '' = home; sub = remaining canonical segments (service folder, 'ilan', 'yazi')
function pageUrl(loc, key, sub = [], qs = '') {
  let u = `${SITE}/${loc}/`;
  if (key) {
    u += `${pageSlug(loc, key)}/`;
    sub.forEach((seg, i) => { u += `${key === 'hizmetler' && i === 0 ? svcSlug(loc, seg) : seg}/`; });
  }
  return u + qs;
}
const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const clip = (s, n = 158) => { s = String(s || '').replace(/\s+/g, ' ').trim(); return s.length > n ? s.slice(0, n).replace(/\s+\S*$/, '') + '…' : s; };
const pickLang = (o, base, loc) => { for (const l of [loc, 'tr', 'en', 'es', 'de']) { const v = o[`${base}_${l}`]; if (v && String(v).trim()) return String(v); } return ''; };
const ldJson = (o) => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`;

const cache = new Map();
async function sb(pathAndQuery, ttl = 10 * 60 * 1000) {
  const hit = cache.get(pathAndQuery);
  if (hit && Date.now() - hit.t < ttl) return hit.v;
  const r = await fetch(`${SB_URL}/rest/v1/${pathAndQuery}`, { headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` }, signal: AbortSignal.timeout(4000) });
  if (!r.ok) throw new Error(`sb ${r.status}`);
  const v = await r.json();
  cache.set(pathAndQuery, { t: Date.now(), v });
  return v;
}

function setMeta(html, m) {
  html = html
    .replace(/<title>[\s\S]*?<\/title>/i, '')
    .replace(/<meta name="description"[^>]*>/gi, '')
    .replace(/<meta property="og:(title|description|url|type)"[^>]*>/gi, '')
    .replace(/<meta name="twitter:(title|description)"[^>]*>/gi, '');
  if (m.image) html = html.replace(/<meta property="og:image[^"]*"[^>]*>/gi, '').replace(/<meta name="twitter:image[^"]*"[^>]*>/gi, '');
  let add = `<title>${esc(m.title)}</title><meta name="description" content="${esc(m.desc)}"/>`
    + `<meta property="og:title" content="${esc(m.title)}"/><meta property="og:description" content="${esc(m.desc)}"/>`
    + `<meta property="og:type" content="${m.type || 'website'}"/><meta name="twitter:card" content="${m.image ? 'summary_large_image' : 'summary'}"/>`
    + `<meta name="twitter:title" content="${esc(m.title)}"/><meta name="twitter:description" content="${esc(m.desc)}"/>`;
  if (m.url) add += `<meta property="og:url" content="${esc(m.url)}"/>`;
  if (m.image) add += `<meta property="og:image" content="${esc(m.image)}"/><meta name="twitter:image" content="${esc(m.image)}"/>`;
  return html.replace('</head>', `${add}</head>`);
}

async function decorate(html, urlPath, query) {
  const m = /^\/(tr|es|en|de)\/(.*)$/.exec(urlPath);
  const isSubscribe = urlPath.startsWith('/abonelik');
  if (!m) {
    if (isSubscribe) return html.replace('</head>', '<meta name="robots" content="noindex,nofollow"/></head>');
    return html;
  }
  const loc = m[1];
  const segs = m[2].split('/').filter((x) => x && x !== 'index.html');
  const key = segs[0] || '';
  const sub = segs.slice(1);
  html = html.replace(/<html(?![^>]*\slang=)/i, `<html lang="${loc}"`);

  if (NOINDEX_KEYS.includes(key)) return html.replace('</head>', '<meta name="robots" content="noindex,nofollow"/></head>');

  let qs = '';
  let meta = null;
  let ld = '';
  if (!key) meta = SEO.home[loc] && { title: SEO.home[loc].t, desc: SEO.home[loc].d };
  else if (key === 'hizmetler' && sub[0]) { const s = SEO.services[sub[0]]; meta = s && s[loc] && { title: s[loc].t, desc: s[loc].d }; }
  else if (PAGE_KEYS.includes(key) && !sub.length) { const p = SEO.pages[key]; meta = p && p[loc] && { title: p[loc].t, desc: p[loc].d }; }

  try {
    if (key === 'mulkler' && sub[0] === 'ilan') {
      const id = query.get('id');
      if (id && /^[0-9a-f-]{36}$/i.test(id)) {
        const rows = await sb(`properties?id=eq.${id}&is_active=eq.true&select=*`);
        const p = rows[0];
        if (p) {
          qs = `?id=${id}`;
          const title = pickLang(p, 'title', loc);
          const place = [p.neighborhood, p.city].filter(Boolean).join(', ');
          const desc = clip(pickLang(p, 'description', loc)) || [title, place].filter(Boolean).join(' — ');
          const image = p.cover_image || (Array.isArray(p.images) && p.images[0]) || '';
          const url = pageUrl(loc, key, sub, qs);
          meta = { title: `${title} | Lock & Loft`, desc, image, url, type: 'article' };
          ld = ldJson({ '@context': 'https://schema.org', '@type': 'RealEstateListing', name: title, description: desc, url, datePosted: p.published_at || p.created_at, image: image ? [image] : undefined,
            offers: p.price ? { '@type': 'Offer', price: p.price, priceCurrency: p.currency || 'EUR' } : undefined });
        }
      }
    } else if (key === 'blog' && sub[0] === 'yazi') {
      const slug = query.get('s');
      if (slug && slug.length < 200) {
        const rows = await sb(`blog_posts?slug=eq.${encodeURIComponent(slug)}&status=eq.published&select=*`);
        const p = rows[0];
        if (p) {
          qs = `?s=${encodeURIComponent(slug)}`;
          const title = pickLang(p, 'title', loc);
          const desc = clip(pickLang(p, 'excerpt', loc)) || clip(pickLang(p, 'content', loc).replace(/[#*_>`\[\]()]/g, ''));
          const url = pageUrl(loc, key, sub, qs);
          meta = { title: `${p[`seo_title_${loc}`] || p.seo_title || title} | Lock & Loft`, desc: p.seo_description || desc, image: p.cover_image || '', url, type: 'article' };
          ld = ldJson({ '@context': 'https://schema.org', '@type': 'Article', headline: title, description: meta.desc, image: p.cover_image ? [p.cover_image] : undefined,
            datePublished: p.published_at, dateModified: p.updated_at, inLanguage: loc, mainEntityOfPage: url,
            publisher: { '@type': 'Organization', name: 'Lock & Loft', logo: { '@type': 'ImageObject', url: `${SITE}/icon.svg` } } });
        }
      }
    }
  } catch (e) { /* data unavailable: fall back to the generic page meta */ }

  const canonical = pageUrl(loc, key, sub, qs);
  if (meta) html = setMeta(html, { url: canonical, ...meta });
  let links = `<link rel="canonical" href="${esc(canonical)}"/>`;
  for (const l of LOCALES) links += `<link rel="alternate" hreflang="${l}" href="${esc(pageUrl(l, key, sub, qs))}"/>`;
  links += `<link rel="alternate" hreflang="x-default" href="${esc(pageUrl('en', key, sub, qs))}"/>`;
  if (!key) ld += ldJson({ '@context': 'https://schema.org', '@type': 'RealEstateAgent', name: 'Lock & Loft', url: SITE, logo: `${SITE}/icon.svg`, areaServed: 'Valencia, Spain', knowsLanguage: ['tr', 'es', 'en', 'de'] });
  return html.replace('</head>', `${links}${ld}</head>`);
}

async function buildSitemap() {
  const urls = [];
  const alt = (key, sub, qs) => LOCALES.map((l) => `<xhtml:link rel="alternate" hreflang="${l}" href="${esc(pageUrl(l, key, sub, qs))}"/>`).join('')
    + `<xhtml:link rel="alternate" hreflang="x-default" href="${esc(pageUrl('en', key, sub, qs))}"/>`;
  const add = (key, sub = [], qs = '', lastmod) => {
    const a = alt(key, sub, qs);
    for (const l of LOCALES) urls.push(`<url><loc>${esc(pageUrl(l, key, sub, qs))}</loc>${lastmod ? `<lastmod>${String(lastmod).slice(0, 10)}</lastmod>` : ''}${a}</url>`);
  };
  add('');
  PAGE_KEYS.forEach((k) => add(k));
  SERVICE_KEYS.forEach((s) => add('hizmetler', [s]));
  try {
    const props = await sb('properties?is_active=eq.true&select=id,updated_at', 60 * 60 * 1000);
    props.forEach((p) => add('mulkler', ['ilan'], `?id=${p.id}`, p.updated_at));
  } catch (e) { /* listings omitted */ }
  try {
    const posts = await sb('blog_posts?status=eq.published&select=slug,updated_at', 60 * 60 * 1000);
    posts.forEach((p) => add('blog', ['yazi'], `?s=${encodeURIComponent(p.slug)}`, p.updated_at));
  } catch (e) { /* posts omitted */ }
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${urls.join('')}</urlset>`;
}

const ROBOTS = `User-agent: *\nAllow: /\nDisallow: /lockandloft/\nDisallow: /abonelik/\n\nSitemap: ${SITE}/sitemap.xml\n`;

async function serveHtml(req, res, filePath, urlPath) {
  let html = fs.readFileSync(filePath, 'utf8');
  try {
    html = await decorate(html, urlPath, new URL(req.url, SITE).searchParams);
  } catch (e) { console.error('decorate failed', e.message); }
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(html);
}

const server = http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split('?')[0]);

  if (urlPath === '/robots.txt') {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(ROBOTS);
    return;
  }
  if (urlPath === '/sitemap.xml') {
    buildSitemap().then((xml) => {
      res.writeHead(200, { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' });
      res.end(xml);
    }).catch(() => { res.writeHead(500); res.end('error'); });
    return;
  }

  // The admin panel used to live under /valenciaproperty/admin; keep old bookmarks working
  if (urlPath.startsWith('/valenciaproperty/admin')) {
    res.writeHead(302, { Location: urlPath.replace('/valenciaproperty/admin', '/lockandloft/admin') });
    res.end();
    return;
  }

  // Bare domain: send the visitor to the language that fits them
  if (urlPath === '/' || urlPath === '') {
    res.writeHead(302, {
      Location: `/${pickLocale(req)}/`,
      'Cache-Control': 'no-store',
      Vary: 'Cookie, Accept-Language, CF-IPCountry',
    });
    res.end();
    return;
  }

  // Localized slug -> real folder; the Turkish folder name in another language -> redirect to the localized URL
  {
    const m = /^\/(es|en|de)\/([^/]+)(\/.*)?$/.exec(urlPath);
    if (m) {
      const [, loc, seg, rest = ''] = m;
      const canon = SLUG_TO_CANONICAL[`${loc}/${seg}`];
      if (canon) {
        let r = rest;
        const sm = canon === 'hizmetler' && /^\/([^/]+)(\/.*)?$/.exec(rest);
        if (sm) {
          const svc = SERVICE_TO_CANONICAL[`${loc}/${sm[1]}`];
          if (svc) r = `/${svc}${sm[2] || ''}`;
          else if (SERVICE_SLUGS[sm[1]] && !path.extname(urlPath)) {
            const qs = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
            res.writeHead(301, { Location: `/${loc}/${seg}/${SERVICE_SLUGS[sm[1]][loc]}${sm[2] || '/'}${qs}` });
            res.end();
            return;
          }
        }
        urlPath = `/${loc}/${canon}${r}`;
      } else if (ROUTES[seg] && ROUTES[seg][loc] && !path.extname(urlPath)) {
        const qs = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
        res.writeHead(301, { Location: `/${loc}/${ROUTES[seg][loc]}${rest}${qs}` });
        res.end();
        return;
      }
    }
  }

  // Try exact file
  let filePath = tryFile(path.join(STATIC_DIR, urlPath));

  // Try with index.html (for directories with trailing slash)
  if (!filePath && urlPath.endsWith('/')) {
    filePath = tryFile(path.join(STATIC_DIR, urlPath, 'index.html'));
  }

  // Try adding trailing slash + index.html
  if (!filePath) {
    filePath = tryFile(path.join(STATIC_DIR, urlPath + '/index.html'));
  }

  // Try adding .html
  if (!filePath) {
    filePath = tryFile(path.join(STATIC_DIR, urlPath + '.html'));
  }

  if (filePath) {
    if (filePath.endsWith('.html') && urlPath !== '/404.html') {
      serveHtml(req, res, filePath, urlPath).catch(() => { res.writeHead(500); res.end('error'); });
      return;
    }
    // Video needs Range support (Safari/iOS refuse to play or seek without it).
    if (/\.(mp4|webm)$/i.test(filePath)) {
      const size = fs.statSync(filePath).size;
      const m = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || '');
      const base = { 'Content-Type': getMime(filePath), 'Accept-Ranges': 'bytes', 'Cache-Control': 'public, max-age=86400' };
      if (m && (m[1] || m[2])) {
        let start = m[1] ? parseInt(m[1], 10) : Math.max(0, size - parseInt(m[2], 10));
        let end = m[1] && m[2] ? Math.min(parseInt(m[2], 10), size - 1) : size - 1;
        if (start >= size || start > end) { res.writeHead(416, { 'Content-Range': `bytes */${size}` }); res.end(); return; }
        res.writeHead(206, { ...base, 'Content-Range': `bytes ${start}-${end}/${size}`, 'Content-Length': end - start + 1 });
        fs.createReadStream(filePath, { start, end }).pipe(res);
      } else {
        res.writeHead(200, { ...base, 'Content-Length': size });
        fs.createReadStream(filePath).pipe(res);
      }
      return;
    }
    const content = fs.readFileSync(filePath);
    const hdr = { 'Content-Type': getMime(filePath) };
    if (/\/sw\.js$/.test(filePath) || /\.webmanifest$/.test(filePath)) {
      hdr['Cache-Control'] = 'no-cache';
      if (/\/lockandloft\/admin\/sw\.js$/.test(filePath)) hdr['Service-Worker-Allowed'] = '/lockandloft/admin/';
      else if (/\/sw\.js$/.test(filePath)) hdr['Service-Worker-Allowed'] = '/';
    }
    res.writeHead(200, hdr);
    res.end(content);
  } else {
    // 404 - try to serve a custom 404 page
    const notFoundPage = tryFile(path.join(STATIC_DIR, '404.html'));
    if (notFoundPage) {
      const content = fs.readFileSync(notFoundPage);
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(content);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    }
  }
});

server.listen(PORT, () => {
  console.log(`Static server running on port ${PORT}`);
});
