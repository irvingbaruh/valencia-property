'use client';

import { useEffect, useRef, useState } from 'react';
import { useLocale } from 'next-intl';
import { Lock, ArrowRight, ChevronRight, Check } from 'lucide-react';
import { localePath } from '@/lib/routes';
import { useAuth } from '@/components/providers/AuthProvider';
import { areaUi, SOURCES } from '@/lib/areaContent';
import { benefits } from '@/lib/memberBenefits';
import { PAGES, PAGE_ORDER, STR } from '@/lib/guideUi';
import GuideCta from '@/components/sections/GuideCta';

const t = (o, l) => (o && (o[l] || o.tr)) || '';

// Horizontal pill menu with a fade and arrow on the right edge so it is clear there is more to swipe to.
function SubNav({ page, locale }) {
  const ref = useRef(null);
  const [more, setMore] = useState(false);
  const check = () => {
    const el = ref.current;
    if (el) setMore(el.scrollWidth - el.scrollLeft - el.clientWidth > 8);
  };
  useEffect(() => {
    check();
    const el = ref.current;
    const active = el && el.querySelector('[aria-current="page"]');
    if (active && el) el.scrollLeft = Math.max(0, active.offsetLeft - 16);
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return (
    <nav aria-label="Guide" className="relative bg-soft border-b border-border">
      <div ref={ref} onScroll={check} className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {PAGE_ORDER.map((k) => (
          <a key={k} href={localePath(locale, k)} aria-current={k === page ? 'page' : undefined}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm transition-colors ${k === page ? 'bg-gold text-dark border-gold font-semibold' : 'border-border text-dark hover:border-gold hover:text-gold'}`}>
            {t(PAGES[k].nav, locale)}
          </a>
        ))}
      </div>
      {more && (
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[var(--color-soft,#f5f5f5)] to-transparent flex items-center justify-end pr-2 sm:hidden">
          <ChevronRight className="text-gold" size={20} />
        </div>
      )}
    </nav>
  );
}

export default function GuideShell({ page, children, sources = true }) {
  const locale = useLocale();
  const { user, loading } = useAuth();
  const ui = areaUi(locale);
  const b = benefits(locale);
  const P = PAGES[page];
  const isMember = !!user;

  return (
    <div className="bg-soft min-h-screen">
      <header className={`relative overflow-hidden ${P.hero ? 'bg-dark' : 'bg-gradient-to-br from-[#0B0B11] to-[#1d2340]'}`}>
        {P.hero && <img src={`/images/guide/${P.hero}.jpg`} alt="" className="absolute inset-0 w-full h-full object-cover opacity-70" />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/30" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-44 pb-10 sm:pb-14 text-white">
          {page !== 'rehber' && <a href={localePath(locale, 'rehber')} className="text-sm text-gold hover:underline">{ui.back}</a>}
          <h1 className="text-4xl sm:text-5xl font-serif mt-2 mb-3 drop-shadow">{t(P.title, locale)}</h1>
          <p className="text-lg text-white/85 max-w-2xl">{t(P.sub, locale)}</p>
        </div>
      </header>

      {loading && <div className="min-h-[40vh]" />}

      {!loading && !isMember && (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="rounded-2xl border border-gold/40 bg-white p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center gap-4">
            <Lock className="text-gold shrink-0" size={28} />
            <div className="flex-1">
              <h2 className="font-serif text-2xl text-dark mb-1">{b.locked}</h2>
              <p className="text-text-muted">{b.lockedText}</p>
            </div>
            <a href={`${localePath(locale, 'giris')}?app=1`} className="inline-flex items-center justify-center gap-2 rounded-xl bg-gold text-dark font-semibold px-5 py-3 text-sm hover:bg-gold-hover transition-colors">
              {b.join}<ArrowRight size={15} />
            </a>
          </div>
          <h2 className="font-serif text-2xl text-dark mt-12 mb-4">{b.title}</h2>
          <ul className="space-y-3">
            {b.items.map(([h, tx]) => (
              <li key={h} className="flex gap-3"><Check className="w-5 h-5 text-gold shrink-0 mt-0.5" /><div><p className="font-medium text-dark">{h}</p><p className="text-sm text-text-muted">{tx}</p></div></li>
            ))}
          </ul>
        </div>
      )}

      {!loading && isMember && (
        <>
          <SubNav page={page} locale={locale} />
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-14">
            {children}
            <GuideCta title={ui.ctaTitle} text={ui.ctaText} whatsapp={ui.wa} form={ui.form} members={ui.join} />
            {sources && (
              <div className="text-xs text-text-muted space-y-2">
                <p><strong>{ui.sourcesTitle}:</strong> {SOURCES.map(([n, u], i) => (<span key={u}>{i > 0 && ', '}<a href={u} target="_blank" rel="noopener noreferrer" className="underline">{n}</a></span>))}</p>
                <p>{ui.sourcesNote}</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
