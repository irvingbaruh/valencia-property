'use client';

import { useLocale } from 'next-intl';
import { Lock, ArrowRight } from 'lucide-react';
import { localePath } from '@/lib/routes';
import { useAuth } from '@/components/providers/AuthProvider';
import { AREAS, SCHOOLS, CITY_STATS, SOURCES, areaUi } from '@/lib/areaContent';
import GuideCta from '@/components/sections/GuideCta';

// Members-only directory (neighbourhoods or schools). Visitors see the names and a join prompt;
// the details show once signed in. Note: the page is statically exported, so this is a membership
// nudge, not a security boundary.
export default function MemberDirectory({ kind }) {
  const locale = useLocale();
  const ui = areaUi(locale);
  const p = ui[kind];
  const { user, loading } = useAuth();
  const nf = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 });
  const items = kind === 'areas' ? AREAS : SCHOOLS;
  const groups = kind === 'areas' ? ['valencia', 'alicante', 'costa'] : ['valencia', 'alicante'];
  const isMember = !!user;
  const otherHref = localePath(locale, kind === 'areas' ? 'okullar' : 'semtler');

  return (
    <div className="bg-soft">
      <div className="bg-band border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-48 pb-14">
          <a href={localePath(locale, 'rehber')} className="text-sm text-gold hover:underline">{ui.back}</a>
          <h1 className="text-4xl sm:text-5xl font-serif text-dark mt-3 mb-4">{p.title}</h1>
          <p className="text-lg text-text-muted max-w-2xl">{p.subtitle}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-14">
        {!loading && !isMember && (
          <div className="rounded-2xl border border-gold/40 bg-white p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center gap-4">
            <Lock className="text-gold shrink-0" size={28} />
            <div className="flex-1">
              <h2 className="font-serif text-2xl text-dark mb-1">{ui.lockTitle}</h2>
              <p className="text-text-muted">{ui.lockText}</p>
            </div>
            <a href={`${localePath(locale, 'giris')}?app=1`} className="inline-flex items-center gap-2 rounded-xl bg-gold text-dark font-semibold px-5 py-3 text-sm hover:bg-gold-hover transition-colors">
              {ui.join}<ArrowRight size={15} />
            </a>
          </div>
        )}

        {groups.map((g) => {
          const list = items.filter((x) => x.city === g);
          const city = ui.cities[g];
          return (
            <section key={g}>
              <h2 className="font-serif text-3xl text-dark mb-1">{city}</h2>
              {kind === 'areas' && CITY_STATS[g] && (
                <p className="text-sm text-text-muted mb-5">{ui.cityAvg(city, nf.format(CITY_STATS[g]))}</p>
              )}
              <div className="grid sm:grid-cols-2 gap-4 mt-4">
                {list.map((x) => (
                  <article key={x.id} className="dark-card border border-white/10 rounded-xl p-5">
                    <h3 className="font-serif text-lg text-dark mb-2">{x.name}</h3>
                    {isMember ? (
                      <>
                        {kind === 'areas' ? (
                          <p className="text-sm text-dark mb-2">
                            {x.sale && <span className="mr-3">{ui.areas.sale}: <strong>{nf.format(x.sale)} €/m²</strong></span>}
                            {x.rent && <span className="mr-3">{ui.areas.rent}: <strong>{nf.format(x.rent)} €{ui.areas.perMonth}</strong></span>}
                            {x.yoy != null && <span className="text-text-muted">+{nf.format(x.yoy)}% ({ui.areas.yoy})</span>}
                          </p>
                        ) : (
                          <dl className="text-sm text-dark mb-2 space-y-0.5">
                            {x.town && <div>{x.town}</div>}
                            {x.ages && <div>{ui.schools.ages}: {x.ages}</div>}
                            <div>{ui.schools.curr}: {x.curr[locale] || x.curr.tr}</div>
                            <div>{ui.schools.fees}: <strong>{x.fees ? `${nf.format(x.fees[0])} - ${nf.format(x.fees[1])} €` : ui.schools.na}</strong></div>
                          </dl>
                        )}
                        <p className="text-sm text-text-muted leading-relaxed">{x.t[locale] || x.t.tr}</p>
                      </>
                    ) : (
                      <p className="text-sm text-text-muted flex items-center gap-2"><Lock size={14} className="text-gold" />{ui.lockTitle}</p>
                    )}
                  </article>
                ))}
              </div>
            </section>
          );
        })}

        <a href={otherHref} className="inline-flex items-center gap-2 text-gold hover:underline">{ui.other[kind]}<ArrowRight size={15} /></a>

        <GuideCta title={ui.ctaTitle} text={ui.ctaText} whatsapp={ui.wa} form={ui.form} members={ui.join} />

        <div className="text-xs text-text-muted space-y-2">
          <p><strong>{ui.sourcesTitle}:</strong> {SOURCES.map(([n, u], i) => (<span key={u}>{i > 0 && ', '}<a href={u} target="_blank" rel="noopener noreferrer" className="underline">{n}</a></span>))}</p>
          <p>{ui.sourcesNote}</p>
        </div>
      </div>
    </div>
  );
}
