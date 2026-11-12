'use client';

import { useLocale } from 'next-intl';
import { Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { benefits } from '@/lib/memberBenefits';
import { guide } from '@/lib/guideContent';
import GuideCta from '@/components/sections/GuideCta';
import { areaUi } from '@/lib/areaContent';
import { localePath } from '@/lib/routes';

export default function GuideView() {
  const locale = useLocale();
  const { user, loading } = useAuth();
  const b = benefits(locale);
  const g = guide(locale);
  const ui = areaUi(locale);
  const midAfter = g.sections.findIndex((s) => s.id === 'alicante-semtler');

  if (loading) return <div className="bg-soft min-h-screen" />;
  if (!user) return <LockedGuide b={b} locale={locale} title={g.title} />;

  return (
    <div className="bg-soft">
      <div className="bg-band border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-48 pb-14">
          <h1 className="text-4xl sm:text-5xl font-serif text-dark mb-4">{g.title}</h1>
          <p className="text-lg text-text-muted max-w-2xl">{g.subtitle}</p>
          <p className="text-xs text-text-muted mt-4">{g.updated}</p>
        </div>
      </div>

      <nav aria-label={g.navLabel} className="bg-soft border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex gap-2 overflow-x-auto">
          {g.sections.map((s, i) => (
            <a key={s.id} href={`#${s.id}`} className="shrink-0 rounded-full border border-border px-3.5 py-1.5 text-sm text-dark hover:border-gold hover:text-gold transition-colors">
              {g.chips[i]}
            </a>
          ))}
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-16">
        {g.sections.map((s, i) => (
          <div key={s.id}>
            <section id={s.id} className="scroll-mt-24">
              <h2 className="font-serif text-3xl text-dark mb-3">{s.title}</h2>
              <p className="text-text-muted leading-relaxed max-w-3xl mb-6">{s.lead}</p>
              <div className="grid sm:grid-cols-2 gap-4">
                {s.items.map(([h, t]) => (
                  <article key={h} className="dark-card border border-white/10 rounded-xl p-5">
                    <h3 className="font-serif text-lg text-dark mb-2">{h}</h3>
                    <p className="text-sm text-text-muted leading-relaxed">{t}</p>
                  </article>
                ))}
              </div>
            </section>
            {i === midAfter && (
              <div className="mt-16"><GuideCta compact {...g.midCta} whatsapp={g.cta.whatsapp} form={g.cta.form} members={g.cta.members} /></div>
            )}
          </div>
        ))}

        <div className="grid sm:grid-cols-2 gap-4">
          {[['semtler', ui.areas], ['okullar', ui.schools]].map(([key, p]) => (
            <a key={key} href={localePath(locale, key)} className="dark-card border border-gold/30 rounded-xl p-5 hover:border-gold transition-colors">
              <h3 className="font-serif text-xl text-dark mb-1">{p.title}</h3>
              <p className="text-sm text-text-muted">{p.subtitle}</p>
              <p className="text-sm text-gold mt-3">{ui.lockTitle}</p>
            </a>
          ))}
        </div>

        <GuideCta {...g.cta} />
        <p className="text-xs text-text-muted">{g.disclaimer}</p>
      </div>
    </div>
  );
}

function LockedGuide({ b, locale, title }) {
  return (
    <div className="bg-soft min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-48 pb-20">
        <Lock className="text-gold mb-4" size={32} />
        <h1 className="text-4xl font-serif text-dark mb-3">{title}</h1>
        <p className="text-lg text-text-muted mb-2">{b.locked}</p>
        <p className="text-text-muted mb-8">{b.lockedText}</p>
        <a href={`${localePath(locale, 'giris')}?app=1`} className="inline-flex items-center gap-2 rounded-xl bg-gold text-dark font-semibold px-6 py-3 text-sm hover:bg-gold-hover transition-colors">
          {b.join}<ArrowRight size={15} />
        </a>
        <div className="mt-12">
          <h2 className="font-serif text-2xl text-dark mb-2">{b.title}</h2>
          <p className="text-text-muted mb-5">{b.intro}</p>
          <ul className="grid sm:grid-cols-2 gap-3">
            {b.items.map(([h, t]) => (
              <li key={h} className="dark-card border border-white/10 rounded-xl p-4">
                <p className="font-serif text-dark">{h}</p>
                <p className="text-sm text-text-muted mt-1">{t}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
