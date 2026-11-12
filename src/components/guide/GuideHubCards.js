'use client';

import { useLocale } from 'next-intl';
import { Sun, Building2, Waves, PartyPopper, GraduationCap, ArrowRight } from 'lucide-react';
import { localePath } from '@/lib/routes';
import { PAGES, HUB } from '@/lib/guideUi';

const ICONS = { Sun, Building2, Waves, PartyPopper, GraduationCap };
const t = (o, l) => (o && (o[l] || o.tr)) || '';

// The five guide topics as photo cards. Used on the guide overview and in the member panel.
export default function GuideHubCards() {
  const locale = useLocale();
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Object.keys(HUB).map((k) => {
        const h = HUB[k];
        const Icon = ICONS[h.icon];
        return (
          <a key={k} href={localePath(locale, k)} className="group relative overflow-hidden rounded-2xl min-h-[11rem] flex items-end border border-gold/30 hover:border-gold transition-colors bg-gradient-to-br from-[#0B0B11] to-[#1d2340]">
            {h.img && <img src={`/images/guide/${h.img}.jpg`} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
            <span className="absolute top-3 left-3 flex h-10 w-10 items-center justify-center rounded-full bg-gold text-dark"><Icon size={20} /></span>
            <div className="relative p-4 text-white w-full">
              <p className="font-serif text-xl leading-tight">{t(PAGES[k].nav, locale)}</p>
              <p className="text-sm text-white/80 mt-0.5 flex items-center justify-between gap-2">{t(h.text, locale)}<ArrowRight size={16} className="text-gold shrink-0" /></p>
            </div>
          </a>
        );
      })}
    </div>
  );
}
