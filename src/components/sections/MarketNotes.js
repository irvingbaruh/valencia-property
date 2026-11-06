'use client';
import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { ArrowRight } from 'lucide-react';
import { localePath } from '@/lib/routes';
import { fetchNotes } from '@/lib/marketNotes';
import ScrollReveal from '@/components/ui/ScrollReveal';
import MarketNoteCard from './MarketNoteCard';

// Homepage teaser: hidden until at least one note is published.
export default function MarketNotes() {
  const t = useTranslations('market');
  const locale = useLocale();
  const [notes, setNotes] = useState([]);
  useEffect(() => {
    let off = false;
    fetchNotes({ limit: 3 }).then((r) => { if (!off) setNotes(r); });
    return () => { off = true; };
  }, []);
  if (!notes.length) return null;
  return (
    <section className="bg-soft py-20 sm:py-28">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="flex flex-wrap items-end justify-between gap-4 mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-serif text-dark mb-2">{t('title')}</h2>
            <p className="text-text-muted max-w-xl">{t('subtitle')}</p>
          </div>
          <a href={localePath(locale, 'piyasa')} className="inline-flex items-center gap-2 text-dark font-medium hover:text-gold transition-colors">
            {t('viewAll')} <ArrowRight size={16} />
          </a>
        </ScrollReveal>
        <div className="grid md:grid-cols-3 gap-6">
          {notes.map((n, i) => <MarketNoteCard key={n.id} note={n} index={i} />)}
        </div>
      </div>
    </section>
  );
}
