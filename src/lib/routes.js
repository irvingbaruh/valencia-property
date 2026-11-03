// Public page slugs per language. The folders in src/app/[locale] keep their
// Turkish names (static export needs real folders); server.js serves the
// localized URL from the matching folder and redirects the Turkish name to it.
export const ROUTES = {
  iletisim: { tr: 'iletisim', es: 'contacto', en: 'contact', de: 'kontakt' },
  hizmetler: { tr: 'hizmetler', es: 'servicios', en: 'services', de: 'leistungen' },
  mulkler: { tr: 'mulkler', es: 'propiedades', en: 'properties', de: 'immobilien' },
  'roi-hesaplama': { tr: 'roi-hesaplama', es: 'calculadora-roi', en: 'roi-calculator', de: 'rendite-rechner' },
  giris: { tr: 'giris', es: 'acceder', en: 'login', de: 'anmelden' },
  panel: { tr: 'panel', es: 'mi-cuenta', en: 'account', de: 'mein-konto' },
  'sifre-yenile': { tr: 'sifre-yenile', es: 'restablecer-contrasena', en: 'reset-password', de: 'passwort-zuruecksetzen' },
};

// localePath('es', 'iletisim') -> '/es/contacto/'
// localePath('es', 'hizmetler', 'renovacion/') -> '/es/servicios/renovacion/'
export function localePath(locale, key, rest = '') {
  const slug = (ROUTES[key] && ROUTES[key][locale]) || key;
  return `/${locale}/${slug}/${rest}`;
}

// Same page in another language: '/es/contacto/' -> '/de/kontakt/'
export function switchPathLocale(pathname, newLocale) {
  const segs = pathname.split('/');
  const current = segs[1];
  const key = Object.keys(ROUTES).find((k) => ROUTES[k][current] === segs[2]);
  segs[1] = newLocale;
  if (key) segs[2] = ROUTES[key][newLocale];
  return segs.join('/');
}
