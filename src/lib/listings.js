import { supabase } from './supabase';
import { localePath } from './routes';

const COLS =
  'id,title_tr,title_es,title_en,title_de,description_tr,description_es,description_en,description_de,property_type,price,currency,bedrooms,bathrooms,area_sqm,land_sqm,region,city,neighborhood,latitude,longitude,images,cover_image,is_featured,published_at,created_at,features';

// Active listings, newest activation first. Featured ones can be requested alone.
export async function fetchListings({ featured = false, limit = 60 } = {}) {
  let q = supabase.from('properties').select(COLS).eq('is_active', true);
  if (featured) q = q.eq('is_featured', true);
  const { data, error } = await q
    .order('published_at', { ascending: false, nullsFirst: false })
    .limit(limit);
  if (error) return [];
  return data || [];
}

// What a visitor without an account cannot see: count, price spread and places of the locked listings (server-side summary).
export async function fetchGateSummary() {
  const { data, error } = await supabase.rpc('guest_gate_summary');
  if (error || !data) return null;
  return { hidden: Number(data.hidden) || 0, total: Number(data.total) || 0, prices: (data.prices || []).map(Number).filter((n) => n > 0), cities: data.cities || [] };
}

export async function fetchListing(id) {
  const { data } = await supabase.from('properties').select(COLS).eq('id', id).eq('is_active', true).maybeSingle();
  return data || null;
}

// Missing translations fall back: requested -> tr -> en -> es -> de.
function pick(p, base, locale) {
  const order = [locale, 'tr', 'en', 'es', 'de'];
  for (const l of order) {
    const v = p[`${base}_${l}`];
    if (v && String(v).trim()) return v;
  }
  return '';
}
export const listingTitle = (p, locale) => pick(p, 'title', locale);
export const listingDescription = (p, locale) => pick(p, 'description', locale);

export function listingImages(p) {
  const imgs = Array.isArray(p.images) ? p.images.filter(Boolean) : [];
  if (imgs.length) return imgs;
  return p.cover_image ? [p.cover_image] : [];
}
export const listingCover = (p) => p.cover_image || listingImages(p)[0] || '';

export function listingLocation(p) {
  return [p.neighborhood, p.city, p.region].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i).join(', ');
}

export function formatPrice(price, currency = 'EUR', locale = 'tr') {
  if (price == null || price === '') return '';
  const loc = { tr: 'tr-TR', es: 'es-ES', en: 'en-GB', de: 'de-DE' }[locale] || 'en-GB';
  try {
    return new Intl.NumberFormat(loc, { style: 'currency', currency: currency || 'EUR', maximumFractionDigits: 0 }).format(price);
  } catch (_) {
    return `${price} ${currency}`;
  }
}

export const listingHref = (locale, id) => localePath(locale, 'mulkler', `ilan/?id=${id}`);

export const TYPE_KEYS = {
  apartment: 'apartment',
  house: 'house',
  villa: 'villa',
  land: 'land',
  commercial: 'commercial',
  other: 'other',
};
