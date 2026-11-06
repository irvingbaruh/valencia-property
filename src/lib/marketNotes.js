import { supabase } from './supabase';

export const TOPICS = ['realestate', 'economy', 'rates', 'legal'];

export async function fetchNotes({ limit = 50 } = {}) {
  const { data, error } = await supabase
    .from('market_notes')
    .select('id,image_url,title_tr,title_es,title_en,title_de,summary_tr,summary_es,summary_en,summary_de,topic,source_name,source_url,data_date,published_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(limit);
  if (error) return [];
  return data || [];
}

function pick(n, base, locale) {
  for (const l of [locale, 'tr', 'en', 'es', 'de']) {
    const v = n[`${base}_${l}`];
    if (v && String(v).trim()) return v;
  }
  return '';
}
export const noteTitle = (n, l) => pick(n, 'title', l);
export const noteSummary = (n, l) => pick(n, 'summary', l);

export function noteDate(d, locale) {
  if (!d) return '';
  const loc = { tr: 'tr-TR', es: 'es-ES', en: 'en-GB', de: 'de-DE' }[locale] || 'en-GB';
  try { return new Intl.DateTimeFormat(loc, { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(d)); } catch (_) { return d; }
}

const U = (id) => `https://images.unsplash.com/${id}?w=1000&q=80&auto=format`;
const FALLBACK = {
  realestate: ['photo-1564013799919-ab600027ffc6', 'photo-1560518883-ce09059eeffa', 'photo-1486406146926-c627a92ad1ab'],
  economy: ['photo-1526304640581-d334cdbbf45e', 'photo-1521791136064-7986c2920216', 'photo-1507525428034-b723cf961d3e'],
  rates: ['photo-1554224155-6726b3ff858f', 'photo-1526304640581-d334cdbbf45e'],
  legal: ['photo-1450101499163-c8848c66ca85', 'photo-1521791136064-7986c2920216'],
};
// Own photo if uploaded, otherwise a topic photo picked stably from the note id.
export function noteImage(n) {
  if (n.image_url) return n.image_url;
  const list = FALLBACK[n.topic] || FALLBACK.realestate;
  let h = 0;
  for (const ch of String(n.id)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return U(list[h % list.length]);
}
