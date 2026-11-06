import { supabase } from './supabase';

export const TOPICS = ['realestate', 'economy', 'rates', 'legal'];

export async function fetchNotes({ limit = 50 } = {}) {
  const { data, error } = await supabase
    .from('market_notes')
    .select('id,title_tr,title_es,title_en,title_de,summary_tr,summary_es,summary_en,summary_de,topic,source_name,source_url,data_date,published_at')
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
