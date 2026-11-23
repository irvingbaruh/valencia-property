'use client';

import { useLocale } from 'next-intl';
import { ArrowRight, Heart, FileText, Briefcase, Bell } from 'lucide-react';
import { localePath } from '@/lib/routes';
import { HOW, hw } from '@/lib/howItWorks';
import ScrollReveal from '@/components/ui/ScrollReveal';

const ICONS = [Heart, FileText, Briefcase, Bell];

// Short band on the home page that leads to the "How it works" page.
export default function HowTeaser() {
  const l = useLocale();
  const T = HOW.teaser;
  return (
    <section className="bg-[#1D1D2A] text-white border-t border-gold/25 py-12 sm:py-16">
      <ScrollReveal className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-[1.2fr_1fr] gap-8 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-serif text-white mb-3">{hw(T.title, l)}</h2>
            <p className="text-white/90 leading-relaxed mb-6">{hw(T.text, l)}</p>
            <a href={localePath(l, 'nasil-calisir')} className="inline-flex items-center gap-2 rounded-xl bg-gold text-dark px-6 py-3.5 text-sm font-semibold hover:bg-white transition-colors">
              {hw(T.btn, l)}<ArrowRight size={16} />
            </a>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {T.chips.map((c, i) => {
              const Icon = ICONS[i];
              return (
                <div key={i} className="rounded-2xl bg-charcoal border border-white/10 p-4 flex flex-col items-center text-center gap-2">
                  <Icon size={22} className="text-gold" />
                  <span className="text-sm text-white">{hw(c, l)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
