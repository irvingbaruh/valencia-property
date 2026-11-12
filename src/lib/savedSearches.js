import { supabase } from './supabase';
import { ZONES, PROVINCES, norm, placeSlug } from './areas';
import { gt } from './growthText';

export const MAX_SEARCHES = 10;
const KEYS = ['q', 'province', 'area', 'type', 'beds', 'baths', 'priceMin', 'priceMax', 'sqmMin', 'sqmMax', 'plotMin', 'newBuild'];
const TAG = { tr: 'tr-TR', es: 'es-ES', en: 'en-GB', de: 'de-DE' };

// Only the filters the member actually filled in.
export function cleanFilters(f) {
  const out = {};
  for (const k of KEYS) {
    const v = f?.[k];
    if (v === '' || v === false || v == null) continue;
    out[k] = v;
  }
  return out;
}

// What the push function needs to test a new listing: the filters plus the place names (aliases) of the chosen area/province.
export function buildMatch(f) {
  const m = cleanFilters(f);
  let terms = [];
  if (m.area) {
    if (m.area.startsWith('?')) terms = [m.area.slice(1)];
    else {
      for (const z of ZONES) for (const pl of z.places) if (placeSlug(pl) === m.area) terms = pl.aliases.map(norm);
    }
  } else if (m.province) {
    for (const z of ZONES) if (z.province === m.province) for (const pl of z.places) terms.push(...pl.aliases.map(norm));
  }
  if (terms.length) m.terms = [...new Set(terms.filter(Boolean))];
  return m;
}

// Short readable name, e.g. "Alicante · Altea · 2+ rooms · €150.000–€300.000".
export function describeFilters(f, locale, typeLabel = (k) => k) {
  const s = gt(locale).saved;
  const c = cleanFilters(f);
  const eur = (n) => new Intl.NumberFormat(TAG[locale] || 'en-GB', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(Number(n));
  const parts = [];
  if (c.q) parts.push(`“${c.q}”`);
  if (c.area) {
    let name = c.area.startsWith('?') ? c.area.slice(1) : '';
    for (const z of ZONES) for (const pl of z.places) if (placeSlug(pl) === c.area) name = pl.name;
    if (name) parts.push(name);
  } else if (c.province) {
    const p = PROVINCES.find((x) => x.key === c.province);
    if (p) parts.push(p.name[locale] || p.name.en);
  }
  if (c.type) parts.push(typeLabel(c.type));
  if (c.beds) parts.push(s.beds(c.beds));
  if (c.baths) parts.push(s.baths(c.baths));
  if (c.priceMin || c.priceMax) parts.push(`${c.priceMin ? eur(c.priceMin) : ''}–${c.priceMax ? eur(c.priceMax) : ''}`);
  if (c.sqmMin) parts.push(s.sqm(c.sqmMin));
  if (c.plotMin) parts.push(s.plot(c.plotMin));
  if (c.newBuild) parts.push(s.newBuild);
  return (parts.join(' · ') || s.any).slice(0, 120);
}

export async function listSavedSearches(userId) {
  const { data } = await supabase
    .from('saved_searches')
    .select('id,name,filters,notify,created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return data || [];
}

export async function createSavedSearch(userId, filters, name) {
  const { data, error } = await supabase
    .from('saved_searches')
    .insert({ user_id: userId, name, filters: cleanFilters(filters), match: buildMatch(filters), notify: true })
    .select('id,name,filters,notify,created_at')
    .single();
  return { data, error };
}

export const setSearchNotify = (id, notify) => supabase.from('saved_searches').update({ notify }).eq('id', id);
export const deleteSavedSearch = (id) => supabase.from('saved_searches').delete().eq('id', id);

// The listings page reads this once on load, so "open search" in the panel lands on the same filters.
const APPLY_KEY = 'll_apply_search';
export function stashSearch(filters) {
  try { localStorage.setItem(APPLY_KEY, JSON.stringify({ t: Date.now(), f: cleanFilters(filters) })); } catch {}
}
export function takeStashedSearch() {
  try {
    const raw = localStorage.getItem(APPLY_KEY);
    if (!raw) return null;
    localStorage.removeItem(APPLY_KEY);
    const o = JSON.parse(raw);
    // a search stashed more than two days ago is stale
    return o && o.f && Date.now() - Number(o.t) < 2 * 864e5 ? cleanFilters(o.f) : null;
  } catch {
    return null;
  }
}
