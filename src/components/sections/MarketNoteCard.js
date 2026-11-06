'use client';
import { useTranslations, useLocale } from 'next-intl';
import { ExternalLink } from 'lucide-react';
import { noteTitle, noteSummary, noteDate } from '@/lib/marketNotes';

export default function MarketNoteCard({ note }) {
  const t = useTranslations('market');
  const locale = useLocale();
  return (
    <article className="bg-white rounded-2xl border border-border shadow-card p-6 flex flex-col h-full">
      <span className="text-xs font-medium text-gold mb-3">{t(`topics.${note.topic}`)}</span>
      <h3 className="text-xl font-serif text-dark mb-3 leading-snug">{noteTitle(note, locale)}</h3>
      <p className="text-text-muted text-[15px] leading-relaxed flex-1 whitespace-pre-line">{noteSummary(note, locale)}</p>
      <div className="mt-5 pt-4 border-t border-border text-xs text-text-muted flex flex-wrap items-center justify-between gap-2">
        <span>{note.data_date ? `${t('dataDate')}: ${noteDate(note.data_date, locale)}` : noteDate(note.published_at, locale)}</span>
        {note.source_url ? (
          <a href={note.source_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-gold transition-colors">
            {t('source')}: {note.source_name || new URL(note.source_url).hostname} <ExternalLink size={12} />
          </a>
        ) : note.source_name ? <span>{t('source')}: {note.source_name}</span> : null}
      </div>
    </article>
  );
}
