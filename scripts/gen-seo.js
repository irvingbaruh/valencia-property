// Builds seo-meta.json (page titles/descriptions per language) from src/messages. Run before committing: node scripts/gen-seo.js
const fs = require('fs');
const path = require('path');
const LOCALES = ['tr', 'es', 'en', 'de'];
const PAGES = { iletisim: 'iletisimPage', hizmetler: 'hizmetlerPage', mulkler: 'mulklerPage', 'roi-hesaplama': 'roiPage', piyasa: 'market', blog: 'blog', gizlilik: 'privacy' };
const SERVICES = { search: 'mulk-arama', legal: 'hukuki-destek', decor: 'dekorasyon-mobilya', renovation: 'renovasyon', rental: 'kira-yonetimi', staging: 'home-staging' };
const clip = (s, n = 158) => (s.length > n ? s.slice(0, n).replace(/\s+\S*$/, '') + '…' : s);
const out = { home: {}, pages: {}, services: {} };
for (const l of LOCALES) {
  const m = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'messages', `${l}.json`), 'utf8'));
  out.home[l] = { t: m.meta.title, d: m.meta.description };
  for (const [key, ns] of Object.entries(PAGES)) {
    (out.pages[key] ||= {})[l] = { t: `${m[ns].title} | Lock & Loft`, d: clip(m[ns].subtitle) };
  }
  for (const [k, slug] of Object.entries(SERVICES)) {
    (out.services[slug] ||= {})[l] = { t: `${m.servicePages[k].title} | Lock & Loft`, d: clip(m.servicePages[k].intro) };
  }
}
fs.writeFileSync(path.join(__dirname, '..', 'seo-meta.json'), JSON.stringify(out, null, 1));
console.log('seo-meta.json written');
