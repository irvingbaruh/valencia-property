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
  'roi-hesaplama': { es: 'calculadora-roi', en: 'roi-calculator', de: 'rendite-rechner' },
  giris: { es: 'acceder', en: 'login', de: 'anmelden' },
  panel: { es: 'mi-cuenta', en: 'account', de: 'mein-konto' },
  'sifre-yenile': { es: 'restablecer-contrasena', en: 'reset-password', de: 'passwort-zuruecksetzen' },
};
const SLUG_TO_CANONICAL = {};
for (const [canon, byLocale] of Object.entries(ROUTES)) {
  for (const [loc, slug] of Object.entries(byLocale)) SLUG_TO_CANONICAL[`${loc}/${slug}`] = canon;
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

const server = http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split('?')[0]);

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
        urlPath = `/${loc}/${canon}${rest}`;
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
    const content = fs.readFileSync(filePath);
    res.writeHead(200, { 'Content-Type': getMime(filePath) });
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
