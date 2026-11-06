// Blog categories are stored in Turkish (the admin picks from this list); readers see them in their language.
export const BLOG_CATEGORIES = [
  { tr: 'Yatırım Rehberi', es: 'Guía de inversión', en: 'Investment Guide', de: 'Investitionsratgeber' },
  { tr: 'Valencia Yaşam', es: 'Vida en Valencia', en: 'Life in Valencia', de: 'Leben in Valencia' },
  { tr: 'Emlak Piyasası', es: 'Mercado inmobiliario', en: 'Property Market', de: 'Immobilienmarkt' },
  { tr: 'Hukuki Süreçler', es: 'Trámites legales', en: 'Legal Process', de: 'Rechtliche Abläufe' },
  { tr: 'Renovasyon', es: 'Reformas', en: 'Renovation', de: 'Renovierung' },
  { tr: 'Oturma İzni', es: 'Residencia', en: 'Residency', de: 'Aufenthalt' },
  { tr: 'Vergi & Finans', es: 'Impuestos y finanzas', en: 'Tax & Finance', de: 'Steuern & Finanzen' },
  { tr: 'Mahalle Rehberi', es: 'Guía de barrios', en: 'Neighbourhood Guide', de: 'Stadtteilführer' },
];

export function categoryLabel(category, locale) {
  const c = BLOG_CATEGORIES.find((x) => x.tr === category);
  return c ? c[locale] || c.tr : category;
}
