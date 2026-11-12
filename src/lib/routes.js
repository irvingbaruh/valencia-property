// Public page slugs per language. The folders in src/app/[locale] keep their
// Turkish names (static export needs real folders); server.js serves the
// localized URL from the matching folder and redirects the Turkish name to it.
export const ROUTES = {
  iletisim: { tr: 'iletisim', es: 'contacto', en: 'contact', de: 'kontakt' },
  hizmetler: { tr: 'hizmetler', es: 'servicios', en: 'services', de: 'leistungen' },
  mulkler: { tr: 'mulkler', es: 'propiedades', en: 'properties', de: 'immobilien' },
  piyasa: { tr: 'piyasa', es: 'mercado', en: 'market', de: 'markt' },
  'roi-hesaplama': { tr: 'roi-hesaplama', es: 'calculadora-roi', en: 'roi-calculator', de: 'rendite-rechner' },
  giris: { tr: 'giris', es: 'acceder', en: 'login', de: 'anmelden' },
  panel: { tr: 'panel', es: 'mi-cuenta', en: 'account', de: 'mein-konto' },
  gizlilik: { tr: 'gizlilik', es: 'privacidad', en: 'privacy', de: 'datenschutz' },
  hakkimizda: { tr: 'hakkimizda', es: 'nosotros', en: 'about', de: 'ueber-uns' },
  remax: { tr: 'remax', es: 'remax', en: 'remax', de: 'remax' },
  sss: { tr: 'sss', es: 'preguntas-frecuentes', en: 'faq', de: 'haeufige-fragen' },
  rehber: { tr: 'rehber', es: 'guia', en: 'guide', de: 'ratgeber' },
  semtler: { tr: 'semtler', es: 'barrios', en: 'neighbourhoods', de: 'stadtteile' },
  okullar: { tr: 'okullar', es: 'colegios-internacionales', en: 'international-schools', de: 'internationale-schulen' },
  yasam: { tr: 'yasam', es: 'vida-diaria', en: 'daily-life', de: 'alltag' },
  bolgeler: { tr: 'bolgeler', es: 'costa-blanca', en: 'costa-blanca', de: 'costa-blanca' },
  nerede: { tr: 'nerede', es: 'que-ver', en: 'whats-where', de: 'was-wo' },
  aktiviteler: { tr: 'aktiviteler', es: 'actividades', en: 'activities', de: 'aktivitaeten' },
  sozluk: { tr: 'sozluk', es: 'glosario', en: 'glossary', de: 'glossar' },
  'sifre-yenile': { tr: 'sifre-yenile', es: 'restablecer-contrasena', en: 'reset-password', de: 'passwort-zuruecksetzen' },
};

// Service detail pages: /hizmetler/<slug>
export const SERVICE_SLUGS = {
  'mulk-arama': { tr: 'mulk-arama', es: 'busqueda-propiedades', en: 'property-search', de: 'immobiliensuche' },
  'hukuki-destek': { tr: 'hukuki-destek', es: 'asesoria-legal', en: 'legal-support', de: 'rechtsberatung' },
  'dekorasyon-mobilya': { tr: 'dekorasyon-mobilya', es: 'decoracion-mobiliario', en: 'decor-furniture', de: 'einrichtung-moebel' },
  renovasyon: { tr: 'renovasyon', es: 'reformas', en: 'renovation', de: 'renovierung' },
  'kira-yonetimi': { tr: 'kira-yonetimi', es: 'gestion-alquileres', en: 'rental-management', de: 'vermietungsverwaltung' },
  'home-staging': { tr: 'home-staging', es: 'home-staging', en: 'home-staging', de: 'home-staging' },
};

// localePath('es', 'iletisim') -> '/es/contacto/'
// localePath('es', 'hizmetler', 'renovacion/') -> '/es/servicios/renovacion/'
export function localePath(locale, key, rest = '') {
  const slug = (ROUTES[key] && ROUTES[key][locale]) || key;
  if (key === 'hizmetler' && rest) {
    const m = /^([^/#?]+)(.*)$/.exec(rest);
    if (m && SERVICE_SLUGS[m[1]]) rest = SERVICE_SLUGS[m[1]][locale] + m[2];
  }
  return `/${locale}/${slug}/${rest}`;
}

// Same page in another language: '/es/contacto/' -> '/de/kontakt/'
export function switchPathLocale(pathname, newLocale) {
  const segs = pathname.split('/');
  const current = segs[1];
  const key = Object.keys(ROUTES).find((k) => ROUTES[k][current] === segs[2]);
  segs[1] = newLocale;
  if (key) segs[2] = ROUTES[key][newLocale];
  if (key === 'hizmetler' && segs[3]) {
    const svc = Object.keys(SERVICE_SLUGS).find((k) => SERVICE_SLUGS[k][current] === segs[3]);
    if (svc) segs[3] = SERVICE_SLUGS[svc][newLocale];
  }
  return segs.join('/');
}
