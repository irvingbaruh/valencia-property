'use client';
import { useTranslations, useLocale } from 'next-intl';
import { ExternalLink } from 'lucide-react';
import ScrollReveal from '@/components/ui/ScrollReveal';
import { noteTitle, noteSummary, noteDate, noteImage } from '@/lib/marketNotes';

// Scroll-driven entrance (rewinds when scrolling back up). `index` staggers neighbours.
export default function MarketNoteCard({ note, index = 0, large = false }) {
  const t = useTranslations('market');
  const locale = useLocale();
  return (
    <ScrollReveal delay={(index % 3) * 0.03} className={`h-full ${large ? 'md:col-span-2' : ''}`}>
      <article className={`group bg-white rounded-2xl border border-border shadow-card hover:shadow-card-hover transition-shadow duration-500 overflow-hidden h-full flex flex-col ${large ? 'md:flex-row' : ''}`}>
        <div className={`relative overflow-hidden shrink-0 ${large ? 'md:w-1/2 aspect-[16/10] md:aspect-auto md:min-h-[320px]' : 'aspect-[16/10]'}`}>
          <img src={noteImage(note)} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
          <div className="absolute inset-0 bg-gradient-to-t from-dark/50 via-transparent to-transparent" />
          <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-gold text-dark text-xs font-semibold shadow-lg">{t(`topics.${note.topic}`)}</span>
        </div>
        <div className="p-6 flex flex-col flex-1">
          <h3 className={`font-serif text-dark mb-3 leading-snug ${large ? 'text-2xl md:text-3xl' : 'text-xl'}`}>{noteTitle(note, locale)}</h3>
          <p className="text-text-muted text-[15px] leading-relaxed flex-1 whitespace-pre-line">{noteSummary(note, locale)}</p>
          <div className="mt-5 pt-4 border-t border-border text-xs text-text-muted flex flex-wrap items-center justify-between gap-2">
            <span>{note.data_date ? `${t('dataDate')}: ${noteDate(note.data_date, locale)}` : noteDate(note.published_at, locale)}</span>
            {note.source_url ? (
              <a href={note.source_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-gold transition-colors">
                {t('source')}: {note.source_name || new URL(note.source_url).hostname} <ExternalLink size={12} />
              </a>
            ) : note.source_name ? <span>{t('source')}: {note.source_name}</span> : null}
          </div>
        </div>
      </article>
    </ScrollReveal>
  );
}
