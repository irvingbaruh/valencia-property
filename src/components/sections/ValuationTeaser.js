'use client';

import { useLocale } from 'next-intl';
import { ArrowRight } from 'lucide-react';
import { localePath } from '@/lib/routes';
import { VAL, vt } from '@/lib/valuation';
import ScrollReveal from '@/components/ui/ScrollReveal';

// Home page band that leads to the home valuation request page.
export default function ValuationTeaser() {
  const l = useLocale();
  const T = VAL.teaser;
  return (
    <section className="bg-soft py-14 sm:py-16">
      <ScrollReveal className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-gold/40 bg-white p-8 md:p-10 flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex-1">
            <h2 className="font-serif text-3xl text-dark mb-2">{vt(T.title, l)}</h2>
            <p className="text-text-muted max-w-xl">{vt(T.text, l)}</p>
          </div>
          <a href={localePath(l, 'ev-degerleme')} className="inline-flex items-center justify-center gap-2 rounded-xl bg-gold text-dark px-6 py-3.5 text-sm font-semibold hover:bg-gold-hover transition-colors whitespace-nowrap">
            {vt(T.cta, l)}<ArrowRight size={16} />
          </a>
        </div>
      </ScrollReveal>
    </section>
  );
}
