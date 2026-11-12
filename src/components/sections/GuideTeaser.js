'use client';

import { useLocale } from 'next-intl';
import { ArrowRight, MapPin } from 'lucide-react';
import { localePath } from '@/lib/routes';
import { guide } from '@/lib/guideContent';
import { benefits } from '@/lib/memberBenefits';
import { useAuth } from '@/components/providers/AuthProvider';

// Short invitation to the Valencia & Alicante living guide. variant: 'home' (full-width band) | 'panel' (compact card).
export default function GuideTeaser({ variant = 'home' }) {
  const locale = useLocale();
  const { user } = useAuth();
  const teaser = user ? guide(locale).teaser : benefits(locale).teaser;
  const href = user ? localePath(locale, 'rehber') : `${localePath(locale, 'giris')}?app=1`;
  if (variant === 'panel') {
    return (
      <a href={href} className="mt-10 dark-card rounded-2xl shadow-sm p-6 flex items-center gap-4 border border-[var(--color-gold)]/30 hover:border-[var(--color-gold)] transition-colors">
        <MapPin className="w-6 h-6 text-[var(--color-gold)] shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="font-serif text-lg text-[var(--color-dark)]">{teaser.title}</p>
          <p className="text-sm text-[var(--color-charcoal)] mt-0.5">{teaser.text}</p>
        </div>
        <ArrowRight className="w-5 h-5 text-[var(--color-gold)] shrink-0" />
      </a>
    );
  }
  return (
    <section className="bg-soft py-16 sm:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center gap-6 md:gap-10">
        <div className="flex-1">
          <h2 className="text-3xl md:text-4xl font-serif text-dark mb-3">{teaser.title}</h2>
          <p className="text-text-muted leading-relaxed">{teaser.text}</p>
        </div>
        <a href={href} className="shrink-0 inline-flex items-center justify-center gap-2 rounded-xl bg-dark text-white px-6 py-3.5 text-sm font-medium hover:bg-gold hover:text-dark transition-colors">
          {teaser.btn}<ArrowRight size={16} />
        </a>
      </div>
    </section>
  );
}
