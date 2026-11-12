'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { Sun, Building2, MapPin, Utensils, TrainFront, Car, Plane, Umbrella, Eye, Waves, Landmark, Clock, TriangleAlert, GraduationCap, Bus, Users, TrendingUp, Compass, Euro, Home, Info, Moon, Leaf, ShoppingBag, Heart } from 'lucide-react';
import { AREAS, SCHOOLS, CITY_STATS, areaUi } from '@/lib/areaContent';
import { PLACES, CATS, PLACE_SOURCES } from '@/lib/placesContent';
import { guide } from '@/lib/guideContent';
import { PAGES, STR } from '@/lib/guideUi';
import GuideShell from '@/components/guide/GuideShell';
import GuideHubCards from '@/components/guide/GuideHubCards';
import { CostOfLiving, AreaDays, AreaCompare, Community, Roadmap, Sources } from '@/components/guide/LifeScreens';
import { Visas, Tax, SchoolSystem, Climate, Health, Events, Quiz, Cons, Sources2 } from '@/components/guide/LifeScreens2';

const t = (o, l) => (o && (o[l] || o.tr)) || '';
const Ic = { Sun, Building2, MapPin, Utensils, TrainFront, Car, Plane, Umbrella, Eye, Waves, Landmark };
const items = (g, id) => (g.sections.find((s) => s.id === id) || { items: [] }).items;

function IconCard({ Icon, title, text, tone = 'gold', img }) {
  const warn = tone === 'warn';
  return (
    <article className={`rounded-2xl overflow-hidden border ${warn ? 'bg-amber-50 border-amber-300' : 'dark-card border-white/10'}`}>
      {img && <img src={`/images/guide/${img}.jpg`} alt="" loading="lazy" className="w-full h-40 object-cover" />}
      <div className="p-5 flex gap-4">
        <span className={`shrink-0 flex h-11 w-11 items-center justify-center rounded-full ${warn ? 'bg-amber-400 text-dark' : 'bg-gold/15 text-gold'}`}><Icon size={22} /></span>
        <div>
          <h3 className="font-serif text-lg text-dark mb-1">{title}</h3>
          <p className="text-sm text-text-muted leading-relaxed">{text}</p>
        </div>
      </div>
    </article>
  );
}

function SectionTitle({ children, Icon }) {
  return (
    <h2 className="font-serif text-2xl sm:text-3xl text-dark mb-5 flex items-center gap-3">
      {Icon && <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold text-dark"><Icon size={18} /></span>}{children}
    </h2>
  );
}

function Stat({ Icon, value, unit, label }) {
  return (
    <div className="rounded-2xl bg-dark text-white p-5 border border-gold/30">
      <Icon className="text-gold mb-3" size={22} />
      <p className="font-serif text-4xl leading-none">{value}<span className="text-lg text-gold ml-1">{unit}</span></p>
      <p className="text-sm text-white/70 mt-2">{label}</p>
    </div>
  );
}

function Bars({ title, rows, locale, unit = '' }) {
  const nf = new Intl.NumberFormat(locale);
  const max = Math.max(...rows.map((r) => r.max ?? r.value));
  return (
    <div className="rounded-2xl bg-white border border-border p-5 sm:p-6">
      <h3 className="font-serif text-xl text-dark mb-4">{title}</h3>
      <ul className="space-y-3">
        {rows.map((r) => (
          <li key={r.name}>
            <div className="flex justify-between text-sm mb-1 gap-3"><span className="text-dark">{r.name}</span><span className="font-semibold text-dark shrink-0">{r.label}</span></div>
            <div className="h-3 rounded-full bg-gray-100 overflow-hidden relative">
              <div className="absolute h-full rounded-full bg-gradient-to-r from-gold to-[#e3c56d]" style={{ left: `${((r.min ?? 0) / max) * 100}%`, width: `${((r.max ?? r.value) - (r.min ?? 0)) / max * 100}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function AreaCard({ a, locale, ui }) {
  const nf = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 });
  const imgs = a.img || [];
  return (
    <article className="rounded-2xl overflow-hidden dark-card border border-white/10">
      {imgs.length > 0 ? (
        <div className={`grid gap-0.5 ${imgs.length > 1 ? 'grid-cols-3' : ''}`}>
          <img src={`/images/guide/${imgs[0]}.jpg`} alt={a.name} loading="lazy" className={`w-full object-cover ${imgs.length > 1 ? 'col-span-2 h-48 row-span-1' : 'h-48'}`} />
          {imgs.length > 1 && (
            <div className="grid gap-0.5">
              {imgs.slice(1, 3).map((i) => <img key={i} src={`/images/guide/${i}.jpg`} alt="" loading="lazy" className={`w-full object-cover ${imgs.length > 2 ? 'h-[calc(6rem-1px)]' : 'h-48'}`} />)}
            </div>
          )}
        </div>
      ) : (
        <div className="h-20 bg-gradient-to-br from-[#0B0B11] to-[#1d2340] flex items-center px-5"><Waves className="text-gold" size={26} /></div>
      )}
      <div className="p-5">
        <h3 className="font-serif text-xl text-dark mb-3">{a.name}</h3>
        <div className="flex flex-wrap gap-2 mb-3 text-sm">
          {a.sale && <span className="inline-flex items-center gap-1 rounded-full bg-dark text-white px-3 py-1"><Euro size={13} className="text-gold" />{nf.format(a.sale)} €/m²</span>}
          {a.rent && <span className="inline-flex items-center gap-1 rounded-full border border-gold/50 text-dark px-3 py-1"><Home size={13} className="text-gold" />{nf.format(a.rent)} €{ui.areas.perMonth}</span>}
          {a.yoy != null && <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 px-3 py-1"><TrendingUp size={13} />+{nf.format(a.yoy)}% · {ui.areas.yoy}</span>}
        </div>
        <p className="text-sm text-text-muted leading-relaxed">{t(a.t, locale)}</p>
      </div>
    </article>
  );
}

const barRows = (list, nf) => list.filter((a) => a.sale).sort((x, y) => y.sale - x.sale).map((a) => ({ name: a.name, value: a.sale, label: `${nf.format(a.sale)} €` }));

function Hub({ locale, g }) {
  const ui = areaUi(locale);
  const nf = new Intl.NumberFormat(locale);
  return (
    <>
      <div className="grid sm:grid-cols-2 gap-4">
        <Stat Icon={Building2} value={nf.format(CITY_STATS.valencia)} unit="€/m²" label={t(STR.stats.vcity, locale)} />
        <Stat Icon={Umbrella} value={nf.format(CITY_STATS.alicante)} unit="€/m²" label={t(STR.stats.acity, locale)} />
      </div>
      <GuideHubCards />
    </>
  );
}

function Life({ locale, g }) {
  const C = STR.compare;
  const u = STR.units;
  return (
    <>
      <div className="grid sm:grid-cols-3 gap-4">
        <Stat Icon={Plane} value="25" unit={t(u.min, locale)} label={t(STR.stats.air, locale)} />
        <Stat Icon={TrainFront} value="15" unit={t(u.min, locale)} label={t(STR.stats.tram, locale)} />
        <Stat Icon={Car} value="2" unit={t(u.hours, locale)} label={t(STR.stats.between, locale)} />
      </div>
      <section>
        <SectionTitle Icon={Compass}>{t(C.title, locale)}</SectionTitle>
        <div className="space-y-3">
          {C.rows.map(([icon, label, v, a]) => {
            const I = Ic[icon];
            return (
              <div key={icon} className="rounded-2xl bg-white border border-border p-4 sm:p-5">
                <p className="flex items-center gap-2 font-medium text-dark mb-3"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-gold/15 text-gold"><I size={16} /></span>{t(label, locale)}</p>
                <div className="grid sm:grid-cols-2 gap-3 text-sm">
                  <p className="rounded-xl bg-soft p-3"><span className="block text-xs font-semibold text-gold mb-0.5">Valencia</span>{t(v, locale)}</p>
                  <p className="rounded-xl bg-soft p-3"><span className="block text-xs font-semibold text-gold mb-0.5">Alicante</span>{t(a, locale)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
      <section>
        <SectionTitle Icon={Sun}>{t(STR.sections.life, locale)}</SectionTitle>
        <div className="grid sm:grid-cols-3 gap-4">
          {items(g, 'yasam').map(([h, tx], i) => <IconCard key={h} Icon={[Building2, Umbrella, Utensils][i]} title={h} text={tx} />)}
        </div>
      </section>
      <section>
        <SectionTitle Icon={TrainFront}>{t(STR.sections.transport, locale)}</SectionTitle>
        <div className="grid sm:grid-cols-3 gap-4">
          {items(g, 'ulasim').map(([h, tx], i) => <IconCard key={h} Icon={[TrainFront, TrainFront, Car][i]} title={h} text={tx} />)}
        </div>
      </section>
      <section>
        <SectionTitle Icon={Eye}>{t(STR.sections.safety, locale)}</SectionTitle>
        <div className="grid sm:grid-cols-3 gap-4">
          {items(g, 'guvenlik').map(([h, tx], i) => <IconCard key={h} Icon={[Eye, MapPin, TriangleAlert][i]} tone={i === 2 ? 'warn' : 'gold'} title={h} text={tx} />)}
        </div>
      </section>
    </>
  );
}

function Areas({ locale, cities, ui }) {
  const nf = new Intl.NumberFormat(locale);
  const list = AREAS.filter((a) => cities.includes(a.city));
  return (
    <>
      <Bars title={t(STR.sections.priceChart, locale)} rows={barRows(list, nf)} locale={locale} />
      {cities.map((c) => (
        <section key={c}>
          <SectionTitle Icon={c === 'costa' ? Waves : Building2}>{ui.cities[c]}</SectionTitle>
          {CITY_STATS[c] && <p className="text-sm text-text-muted -mt-3 mb-5 flex items-center gap-2"><Info size={14} className="text-gold" />{ui.cityAvg(ui.cities[c], nf.format(CITY_STATS[c]))}</p>}
          <div className="grid sm:grid-cols-2 gap-4">
            {list.filter((a) => a.city === c).map((a) => <AreaCard key={a.id} a={a} locale={locale} ui={ui} />)}
          </div>
        </section>
      ))}
    </>
  );
}

function Coast({ locale, g, ui }) {
  return (
    <>
      <Areas locale={locale} cities={['costa']} ui={ui} />
      <section>
        <SectionTitle Icon={Compass}>{t(STR.sections.tips, locale)}</SectionTitle>
        <div className="grid sm:grid-cols-2 gap-4">
          {items(g, 'pueblolar').map(([h, tx], i) => <IconCard key={h} Icon={[Car, Home, TrendingUp, Users][i] || Info} title={h} text={tx} />)}
        </div>
      </section>
    </>
  );
}

function Activities({ locale, g }) {
  const its = items(g, 'aktiviteler');
  return (
    <div className="grid sm:grid-cols-3 gap-4">
      {its.map(([h, tx], i) => <IconCard key={h} Icon={[Landmark, Umbrella, Sun][i]} img={['altea-arch', 'alicante', 'altea-street'][i]} title={h} text={tx} />)}
    </div>
  );
}

const CAT_ICON = { food: Utensils, nightlife: Moon, culture: Landmark, nature: Leaf, beach: Waves, family: Users, shopping: ShoppingBag };
const FILTERS = ['all', 'food', 'nightlife', 'culture', 'nature', 'beach', 'family', 'shopping'];
const ALL = { tr: 'Hepsi', es: 'Todo', en: 'All', de: 'Alle' };

function Places({ locale, ui }) {
  const [f, setF] = useState('all');
  const st = { tr: 'Kaynaklar', es: 'Fuentes', en: 'Sources', de: 'Quellen' };
  const note = { tr: 'Bilgiler herkese açık turizm ve basın kaynaklarından özetlendi; mekân saatleri ve fiyatları değişebilir.', es: 'Resumen de guías turísticas y prensa públicas; horarios y precios pueden cambiar.', en: 'Summarised from public tourism and press sources; opening hours and prices can change.', de: 'Zusammengefasst aus öffentlichen Tourismus- und Pressequellen; Öffnungszeiten und Preise können sich ändern.' };
  return (
    <>
      <div className="flex flex-wrap gap-2" role="group">
        {FILTERS.map((k) => {
          const Icn = CAT_ICON[k];
          return (
            <button key={k} onClick={() => setF(k)} aria-pressed={f === k}
              className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium border transition-colors ${f === k ? 'bg-gold text-dark border-gold' : 'border-white/15 text-text-muted hover:border-gold/60'}`}>
              {Icn && <Icn size={14} />}{k === 'all' ? t(ALL, locale) : t(CATS[k], locale)}
            </button>
          );
        })}
      </div>
      {['valencia', 'alicante'].map((c) => {
        const list = PLACES.filter((p) => p.city === c && (f === 'all' || p.cats.includes(f)));
        if (!list.length) return null;
        return (
          <section key={c}>
            <SectionTitle Icon={MapPin}>{ui.cities[c]}</SectionTitle>
            <div className="grid sm:grid-cols-2 gap-4">
              {list.map((p) => (
                <article key={p.id} className="rounded-2xl dark-card border border-white/10 overflow-hidden">
                  {p.img && <img src={`/images/guide/${p.img}.jpg`} alt="" loading="lazy" className="w-full h-48 object-cover" />}
                  <div className="p-5">
                  <h3 className="font-serif text-lg text-dark leading-tight mb-2">{p.name}</h3>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {p.cats.map((k) => { const Icn = CAT_ICON[k]; return <span key={k} className="inline-flex items-center gap-1 rounded-full bg-gold/15 text-gold px-2.5 py-0.5 text-xs"><Icn size={12} />{t(CATS[k], locale)}</span>; })}
                  </div>
                  <p className="text-sm text-text-muted leading-relaxed">{t(p.t, locale)}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        );
      })}
      <div className="text-xs text-text-muted space-y-1">
        <p><strong>{t(st, locale)}:</strong> {PLACE_SOURCES.map(([n, u], i) => (<span key={u}>{i > 0 && ', '}<a href={u} target="_blank" rel="noopener noreferrer" className="underline">{n}</a></span>))}</p>
        <p>{t(note, locale)}</p>
      </div>
    </>
  );
}

function Schools({ locale, g, ui }) {
  const nf = new Intl.NumberFormat(locale);
  const rows = SCHOOLS.filter((s) => s.fees).map((s) => ({ name: s.name, min: s.fees[0], max: s.fees[1], label: `${nf.format(s.fees[0])} - ${nf.format(s.fees[1])} €` }));
  return (
    <>
      <Bars title={t(STR.sections.feeChart, locale)} rows={rows} locale={locale} />
      {['valencia', 'alicante'].map((c) => (
        <section key={c}>
          <SectionTitle Icon={GraduationCap}>{ui.cities[c]}</SectionTitle>
          <div className="grid sm:grid-cols-2 gap-4">
            {SCHOOLS.filter((s) => s.city === c).map((s) => (
              <article key={s.id} className="rounded-2xl dark-card border border-white/10 p-5">
                <div className="flex items-start gap-3 mb-3">
                  <span className="shrink-0 flex h-11 w-11 items-center justify-center rounded-full bg-gold/15 text-gold"><GraduationCap size={22} /></span>
                  <div>
                    <h3 className="font-serif text-lg text-dark leading-tight">{s.name}</h3>
                    {s.town && <p className="text-xs text-text-muted flex items-center gap-1 mt-0.5"><MapPin size={12} />{s.town}</p>}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-3 text-sm">
                  {s.ages && <span className="inline-flex items-center gap-1 rounded-full bg-dark text-white px-3 py-1"><Users size={13} className="text-gold" />{s.ages}</span>}
                  <span className="inline-flex items-center gap-1 rounded-full border border-gold/50 text-dark px-3 py-1">{t(s.curr, locale)}</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 px-3 py-1"><Euro size={13} />{s.fees ? `${nf.format(s.fees[0])} - ${nf.format(s.fees[1])}` : ui.schools.na}</span>
                </div>
                <p className="text-sm text-text-muted leading-relaxed">{t(s.t, locale)}</p>
              </article>
            ))}
          </div>
        </section>
      ))}
      <section>
        <SectionTitle Icon={Info}>{t(STR.sections.schoolTips, locale)}</SectionTitle>
        <div className="grid sm:grid-cols-2 gap-4">
          {items(g, 'okullar').map(([h, tx], i) => <IconCard key={h} Icon={[Euro, Building2, Waves, GraduationCap, Bus][i] || Info} title={h} text={tx} />)}
        </div>
      </section>
    </>
  );
}

const LIFE_PAGES = ['yasam-maliyeti', 'turk-toplulugu', 'tasinma'];
const LIFE2_PAGES = ['vize', 'vergi', 'iklim', 'saglik', 'takvim', 'valencia-mi-alicante-mi', 'dezavantajlar'];

export default function GuideScreens({ page }) {
  const locale = useLocale();
  const g = guide(locale);
  const ui = areaUi(locale);
  return (
    <GuideShell page={page} sources={page !== 'nerede' && page !== 'aktiviteler' && page !== 'yasam' && page !== 'rehber' && !LIFE_PAGES.includes(page) && !LIFE2_PAGES.includes(page)}>
      {page === 'rehber' && <Hub locale={locale} g={g} />}
      {page === 'yasam' && <Life locale={locale} g={g} />}
      {page === 'semtler' && <><AreaCompare /><AreaDays /><Areas locale={locale} cities={['valencia', 'alicante']} ui={ui} /></>}
      {page === 'yasam-maliyeti' && <CostOfLiving />}
      {page === 'turk-toplulugu' && <Community />}
      {page === 'tasinma' && <Roadmap />}
      {LIFE_PAGES.includes(page) && <Sources locale={locale} />}
      {page === 'vize' && <Visas />}
      {page === 'vergi' && <Tax />}
      {page === 'iklim' && <Climate />}
      {page === 'saglik' && <Health />}
      {page === 'takvim' && <Events />}
      {page === 'valencia-mi-alicante-mi' && <Quiz />}
      {page === 'dezavantajlar' && <Cons />}
      {LIFE2_PAGES.includes(page) && <Sources2 locale={locale} />}
      {page === 'nerede' && <Places locale={locale} ui={ui} />}
      {page === 'bolgeler' && <Coast locale={locale} g={g} ui={ui} />}
      {page === 'aktiviteler' && <Activities locale={locale} g={g} />}
      {page === 'okullar' && <><SchoolSystem /><Schools locale={locale} g={g} ui={ui} /></>}
    </GuideShell>
  );
}
