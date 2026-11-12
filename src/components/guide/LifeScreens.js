'use client';

import { useEffect, useMemo, useState } from 'react';
import { useLocale } from 'next-intl';
import { MapPin, Utensils, ShoppingBasket, Landmark, Plane, Stamp, IdCard, Home, BadgeCheck, HeartPulse, GraduationCap, Car, Truck, Receipt, Waves, TrainFront, Users, Sun, Info, ExternalLink, Building2 } from 'lucide-react';
import { useRoiData } from '@/lib/roi';
import { AREAS, SCHOOLS, areaUi } from '@/lib/areaContent';
import { PRICES, BASKET, BASKET_EXTRA, CHILD_SHARE, TRANSIT_PASS, HEALTH, CAR_KM, CAR_L100, HOUSEHOLDS, AREA_LIFE, COMMUNITY, FLIGHTS, STEPS, LIFE_SOURCES, lifeUi } from '@/lib/lifeContent';

const t = (o, l) => (o && (o[l] || o.tr)) || '';
const TAG = { tr: 'tr-TR', es: 'es-ES', en: 'en-GB', de: 'de-DE' };
const STEP_ICONS = { Stamp, IdCard, Landmark, Home, BadgeCheck, HeartPulse, GraduationCap, Car, Truck, Receipt };
const TYPE_ICONS = { food: Utensils, shop: ShoppingBasket, faith: Sun, official: Landmark };

function useTryRate(enabled) {
  const [rate, setRate] = useState(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (!enabled) return undefined;
    let off = false;
    fetch('https://api.frankfurter.dev/v1/latest?base=EUR&symbols=TRY')
      .then((r) => r.json())
      .then((j) => { if (!off) { if (j?.rates?.TRY) setRate(Number(j.rates.TRY)); else setFailed(true); } })
      .catch(() => { if (!off) setFailed(true); });
    return () => { off = true; };
  }, [enabled]);
  return { rate, failed };
}

function Seg({ label, value, options, onChange }) {
  return (
    <fieldset>
      <legend className="text-sm font-medium text-dark mb-2">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map(([v, l]) => (
          <button key={v} type="button" onClick={() => onChange(v)} aria-pressed={value === v}
            className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${value === v ? 'bg-dark text-white border-dark' : 'bg-white text-dark border-border hover:border-gold'}`}>
            {l}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export function Sources({ locale }) {
  const u = lifeUi(locale);
  return (
    <p className="text-xs text-text-muted">
      <strong>{u.sourcesTitle}:</strong>{' '}
      {LIFE_SOURCES.filter((x) => !x[2] || locale === 'tr').map(([n, href], i) => (<span key={href}>{i > 0 && ', '}<a href={href} target="_blank" rel="noopener noreferrer" className="underline">{n}</a></span>))}
    </p>
  );
}

// ---------- Cost of living calculator ----------
export function CostOfLiving() {
  const locale = useLocale();
  const u = lifeUi(locale).cost;
  const { data } = useRoiData();
  const a = data.assumptions;
  const { rate, failed } = useTryRate(locale === 'tr');
  const [city, setCity] = useState('valencia');
  const [hh, setHh] = useState('family2');
  const [housing, setHousing] = useState('own');
  const [price, setPrice] = useState(300000);
  const [rentKind, setRentKind] = useState('o3');
  const [school, setSchool] = useState('public');
  const [health, setHealth] = useState('private');
  const [car, setCar] = useState(true);
  const [gym, setGym] = useState(false);
  const [dinners, setDinners] = useState(2);
  const [other, setOther] = useState(100);
  const [tryNow, setTryNow] = useState('');

  const nf = new Intl.NumberFormat(TAG[locale] || 'en-GB', { maximumFractionDigits: 0 });
  const eur = (n) => `${nf.format(Math.round(n))} €`;
  const tl = (n) => `${nf.format(Math.round(n / 100) * 100)} TL`;

  const r = useMemo(() => {
    const p = PRICES[city];
    const H = HOUSEHOLDS.find((h) => h.id === hh);
    const people = H.adults + H.kids * CHILD_SHARE;
    const basket = Object.entries(BASKET).reduce((s, [k, q]) => s + q * p[k], 0) * (1 + BASKET_EXTRA);
    const fees = SCHOOLS.filter((s) => s.city === city && s.fees).map((s) => (s.fees[0] + s.fees[1]) / 2);
    const intlYear = fees.length ? fees.reduce((x, y) => x + y, 0) / fees.length : p.intlSchool;
    const rows = [
      ['market', basket * people],
      ['dining', dinners * p.dinner2],
      ['utilities', p.utilities * H.util],
      ['telecom', p.internet + p.mobile * H.adults],
      ['transit', TRANSIT_PASS * H.adults],
    ];
    if (health === 'private') rows.push(['health', HEALTH.adult * H.adults + HEALTH.child * H.kids]);
    if (school === 'intl' && H.kids) rows.push(['school', (intlYear / 12) * H.kids]);
    if (housing === 'own') rows.push(['home', a.community_monthly + ((Number(price) || 0) * a.ibi_pct) / 100 / 12 + a.insurance_annual / 12]);
    else rows.push(['rent', p.rent[rentKind]]);
    if (car) rows.push(['car', (CAR_KM / 100) * CAR_L100 * p.petrol]);
    if (gym) rows.push(['gym', p.gym * H.adults]);
    if (other > 0) rows.push(['other', other * (H.adults + H.kids)]);
    const total = rows.reduce((s, [, v]) => s + v, 0);
    return { rows, total, hasKids: H.kids > 0, numbeo: p.numbeo };
  }, [city, hh, housing, price, rentKind, school, health, car, gym, dinners, other, a]);

  const nowTry = Number(String(tryNow).replace(/[^\d]/g, '')) || 0;
  const diffTry = rate && nowTry ? r.total * rate - nowTry : null;

  return (
    <section>
      <h2 className="font-serif text-2xl sm:text-3xl text-dark mb-2">{u.title}</h2>
      <p className="text-text-muted mb-6 max-w-2xl">{u.intro}</p>
      <div className="grid lg:grid-cols-[1fr_22rem] gap-6 items-start">
        <div className="rounded-2xl bg-white border border-border p-5 sm:p-6 space-y-5">
          <Seg label={u.city} value={city} onChange={setCity} options={[['valencia', 'Valencia'], ['alicante', 'Alicante']]} />
          <Seg label={u.household} value={hh} onChange={setHh} options={HOUSEHOLDS.map((h) => [h.id, u.households[h.id]])} />
          <Seg label={u.housing} value={housing} onChange={setHousing} options={[['own', u.housings.own], ['rent', u.housings.rent]]} />
          {housing === 'own' ? (
            <label className="block">
              <span className="text-sm font-medium text-dark">{u.price}</span>
              <input type="number" inputMode="numeric" min="0" step="5000" value={price} onChange={(e) => setPrice(e.target.value)}
                className="mt-2 w-full rounded-xl border border-border px-3 py-2.5 text-dark focus:outline-none focus:ring-2 focus:ring-gold" />
            </label>
          ) : (
            <Seg label={u.rentSize} value={rentKind} onChange={setRentKind} options={['c1', 'o1', 'c3', 'o3'].map((k) => [k, `${u.rents[k]} · ${eur(PRICES[city].rent[k])}`])} />
          )}
          {r.hasKids && <Seg label={u.school} value={school} onChange={setSchool} options={[['public', u.schools.public], ['intl', u.schools.intl]]} />}
          <Seg label={u.health} value={health} onChange={setHealth} options={[['public', u.healths.public], ['private', u.healths.private]]} />
          <label className="block">
            <span className="text-sm font-medium text-dark">{u.dinners}: <strong>{dinners}</strong></span>
            <input type="range" min="0" max="12" value={dinners} onChange={(e) => setDinners(Number(e.target.value))} className="mt-2 w-full accent-[#C9A84C]" />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-dark">{u.other}: <strong>{eur(other)}</strong></span>
            <input type="range" min="0" max="400" step="10" value={other} onChange={(e) => setOther(Number(e.target.value))} className="mt-2 w-full accent-[#C9A84C]" />
          </label>
          <div className="flex flex-wrap gap-5">
            <label className="inline-flex items-center gap-2 text-sm text-dark"><input type="checkbox" checked={car} onChange={(e) => setCar(e.target.checked)} className="h-4 w-4 accent-[#C9A84C]" />{u.car}</label>
            <label className="inline-flex items-center gap-2 text-sm text-dark"><input type="checkbox" checked={gym} onChange={(e) => setGym(e.target.checked)} className="h-4 w-4 accent-[#C9A84C]" />{u.gym}</label>
          </div>
        </div>

        <div className="rounded-2xl bg-dark text-white p-5 sm:p-6 lg:sticky lg:top-24">
          <ul className="space-y-2.5">
            {r.rows.map(([k, v]) => (
              <li key={k} className="flex justify-between gap-3 text-sm"><span className="text-white/80">{u.rows[k]}</span><span className="tabular-nums whitespace-nowrap">{eur(v)}</span></li>
            ))}
          </ul>
          <div className="border-t border-white/15 mt-4 pt-4">
            <p className="text-sm text-white/80">{u.total}</p>
            <p className="font-serif text-4xl text-gold leading-tight">{eur(r.total)}</p>
            <p className="text-xs text-white/70 mt-1">{u.perYear}: {eur(r.total * 12)}{rate && locale === 'tr' ? ` · ${u.approxTry}: ${tl(r.total * rate)}` : ''}</p>
          </div>
        </div>
      </div>

      {locale === 'tr' && <div className="mt-6 rounded-2xl border border-gold/40 bg-white p-5 sm:p-6">
        <h3 className="font-serif text-xl text-dark mb-3">{u.compareTitle}</h3>
        <label className="block max-w-md">
          <span className="text-sm text-dark">{u.compareLabel}</span>
          <input type="text" inputMode="numeric" placeholder="120.000" value={tryNow} onChange={(e) => setTryNow(e.target.value)}
            className="mt-2 w-full rounded-xl border border-border px-3 py-2.5 text-dark focus:outline-none focus:ring-2 focus:ring-gold" />
        </label>
        {nowTry > 0 && (
          <p className="mt-3 font-medium text-dark">
            {failed && !rate ? u.compareNoRate : diffTry != null && (diffTry >= 0 ? u.compareMore(tl(diffTry)) : u.compareLess(tl(-diffTry)))}
            {rate ? <span className="block text-sm text-text-muted font-normal">≈ {eur(nowTry / rate)}</span> : null}
          </p>
        )}
      </div>}

      <div className="mt-4 space-y-1 text-xs text-text-muted">
        <p className="flex gap-1.5"><Info size={13} className="text-gold shrink-0 mt-0.5" />{u.kidsFree}</p>
        <p>{u.notes}</p>
        <p>{u.numbeo(eur(r.numbeo.single), eur(r.numbeo.family))}</p>
      </div>
    </section>
  );
}

// ---------- A day in the neighbourhood + comparison (semtler page) ----------
const LIFE_AREAS = () => AREAS.filter((x) => AREA_LIFE[x.id]);

function Dots({ n, levels }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="inline-flex gap-1">{[1, 2, 3].map((i) => <span key={i} className={`h-2.5 w-2.5 rounded-full ${i <= n ? 'bg-gold' : 'bg-gray-200'}`} />)}</span>
      <span className="text-xs text-text-muted">{levels[n - 1]}</span>
    </span>
  );
}

export function AreaCompare() {
  const locale = useLocale();
  const u = lifeUi(locale).compare;
  const list = LIFE_AREAS();
  const au = areaUi(locale);
  const [left, setLeft] = useState('eixample');
  const [right, setRight] = useState('san-juan');
  const nf = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 });
  const pick = (v, set) => (
    <select value={v} onChange={(e) => set(e.target.value)} aria-label={u.pick}
      className="w-full rounded-xl border border-border bg-white px-3 py-2.5 text-dark font-medium focus:outline-none focus:ring-2 focus:ring-gold">
      {list.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
    </select>
  );
  const A = list.find((x) => x.id === left);
  const B = list.find((x) => x.id === right);
  const rows = [
    ['sale', (x) => (x.sale ? `${nf.format(x.sale)} €/m²` : u.none)],
    ['rent', (x) => (x.rent ? `${nf.format(x.rent)} €${au.areas.perMonth}` : u.none)],
    ['sea', (x) => t(AREA_LIFE[x.id].sea, locale)],
    ['transit', (x) => t(AREA_LIFE[x.id].transit, locale)],
    ['noise', (x) => <Dots n={AREA_LIFE[x.id].noise} levels={u.levels} />],
    ['family', (x) => <Dots n={AREA_LIFE[x.id].family} levels={u.levels} />],
    ['night', (x) => <Dots n={AREA_LIFE[x.id].night} levels={u.levels} />],
  ];
  return (
    <section>
      <h2 className="font-serif text-2xl sm:text-3xl text-dark mb-2">{u.title}</h2>
      <p className="text-text-muted mb-5">{u.intro}</p>
      <div className="rounded-2xl bg-white border border-border overflow-hidden">
        <div className="grid grid-cols-2 gap-3 p-4 bg-soft border-b border-border">{pick(left, setLeft)}{pick(right, setRight)}</div>
        <dl>
          {rows.map(([k, f]) => (
            <div key={k} className="border-b border-border last:border-0 px-4 py-3">
              <dt className="text-xs font-medium text-text-muted mb-1.5">{u.rows[k]}</dt>
              <dd className="grid grid-cols-2 gap-3 text-sm text-dark">{[A, B].map((x, i) => <div key={i}>{f(x)}</div>)}</dd>
            </div>
          ))}
        </dl>
      </div>
      <p className="text-xs text-text-muted mt-3">{u.note}</p>
    </section>
  );
}

export function AreaDays() {
  const locale = useLocale();
  const u = lifeUi(locale).day;
  const list = LIFE_AREAS();
  const [id, setId] = useState(list[0].id);
  const A = list.find((x) => x.id === id);
  const d = AREA_LIFE[id];
  const moments = [Sun, Building2, Waves];
  return (
    <section>
      <h2 className="font-serif text-2xl sm:text-3xl text-dark mb-2">{u.title}</h2>
      <p className="text-text-muted mb-5">{u.intro}</p>
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 [scrollbar-width:none]">
        {list.map((x) => (
          <button key={x.id} type="button" onClick={() => setId(x.id)} aria-pressed={x.id === id}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm transition-colors ${x.id === id ? 'bg-gold text-dark border-gold font-semibold' : 'bg-white border-border text-dark hover:border-gold'}`}>
            {x.name}
          </button>
        ))}
      </div>
      <article className="mt-4 rounded-2xl bg-white border border-border p-5 sm:p-7">
        <h3 className="font-serif text-2xl text-dark mb-5">{A.name}</h3>
        <ol className="relative border-l-2 border-gold/40 ml-3 space-y-6">
          {d.day.map((p, i) => {
            const Icon = moments[i] || Sun;
            return (
              <li key={i} className="pl-6 relative">
                <span className="absolute -left-[17px] top-0 flex h-8 w-8 items-center justify-center rounded-full bg-gold text-dark"><Icon size={16} /></span>
                <p className="text-dark leading-relaxed">{t(p, locale)}</p>
              </li>
            );
          })}
        </ol>
        <div className="mt-6 grid sm:grid-cols-3 gap-3 text-sm">
          <p className="rounded-xl bg-soft p-3"><span className="flex items-center gap-1.5 text-xs text-text-muted mb-1"><Waves size={13} className="text-gold" />{u.sea}</span>{t(d.sea, locale)}</p>
          <p className="rounded-xl bg-soft p-3"><span className="flex items-center gap-1.5 text-xs text-text-muted mb-1"><TrainFront size={13} className="text-gold" />{u.transit}</span>{t(d.transit, locale)}</p>
          <p className="rounded-xl bg-soft p-3"><span className="flex items-center gap-1.5 text-xs text-text-muted mb-1"><Users size={13} className="text-gold" />{u.fit}</span>{t(d.fit, locale)}</p>
        </div>
      </article>
    </section>
  );
}

// ---------- Turkish community ----------
export function Community() {
  const locale = useLocale();
  const u = lifeUi(locale).community;
  const [city, setCity] = useState('all');
  const list = COMMUNITY.filter((c) => city === 'all' || c.city === city || c.city === 'both');
  const allLabel = { tr: 'Hepsi', es: 'Todos', en: 'All', de: 'Alle' }[locale] || 'Hepsi';
  return (
    <>
      <section>
        <h2 className="font-serif text-2xl sm:text-3xl text-dark mb-2">{u.title}</h2>
        <p className="text-text-muted mb-5 max-w-3xl">{u.intro}</p>
        <Seg label="" value={city} onChange={setCity} options={[['all', allLabel], ['valencia', u.cities.valencia], ['alicante', u.cities.alicante]]} />
        <div className="grid sm:grid-cols-2 gap-4 mt-5">
          {list.map((c) => {
            const Icon = TYPE_ICONS[c.type] || MapPin;
            const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${c.name}, ${c.addr}`)}`;
            return (
              <article key={c.name} className="rounded-2xl bg-white border border-border p-5 flex flex-col">
                <div className="flex items-start gap-3">
                  <span className="shrink-0 flex h-10 w-10 items-center justify-center rounded-full bg-gold/15 text-gold"><Icon size={19} /></span>
                  <div>
                    <p className="text-xs text-text-muted">{u.types[c.type]} · {u.cities[c.city]}</p>
                    <h3 className="font-serif text-lg text-dark leading-snug">{c.name}</h3>
                  </div>
                </div>
                <p className="text-sm text-text-muted mt-3 flex-1">{t(c.t, locale)}</p>
                <p className="text-xs text-dark mt-3 flex gap-1.5"><MapPin size={13} className="text-gold shrink-0 mt-0.5" />{c.addr}</p>
                <a href={maps} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-sm text-gold font-semibold hover:underline">{u.map}<ExternalLink size={13} /></a>
              </article>
            );
          })}
        </div>
        <p className="text-xs text-text-muted mt-3">{u.note}</p>
      </section>
      <section>
        <h2 className="font-serif text-2xl text-dark mb-4 flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold text-dark"><Plane size={18} /></span>{u.flights}</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {FLIGHTS.map((f) => (
            <div key={f.route} className="rounded-2xl bg-dark text-white p-5">
              <p className="font-serif text-xl">{f.route}</p>
              <p className="text-sm text-gold mt-1">{f.airline} · {f.time}</p>
              <p className="text-sm text-white/80 mt-2">{t(f.t, locale)}</p>
            </div>
          ))}
        </div>
        <p className="mt-5 rounded-2xl border border-gold/40 bg-white p-5 text-dark">{u.ask}</p>
      </section>
    </>
  );
}

// ---------- Moving roadmap ----------
export function Roadmap() {
  const locale = useLocale();
  const u = lifeUi(locale).steps;
  return (
    <section>
      <h2 className="font-serif text-2xl sm:text-3xl text-dark mb-2">{u.title}</h2>
      <p className="text-text-muted mb-6">{u.intro}</p>
      <ol className="space-y-4">
        {STEPS.filter((s) => !s.trOnly || locale === 'tr').map((s, i) => {
          const Icon = STEP_ICONS[s.icon] || Info;
          return (
            <li key={s.id} className="rounded-2xl bg-white border border-border p-5 sm:p-6 flex gap-4">
              <div className="flex flex-col items-center">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-dark text-gold font-serif text-lg">{i + 1}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-serif text-xl text-dark flex items-center gap-2"><Icon size={18} className="text-gold" />{t(s.title, locale)}</h3>
                <p className="text-sm text-text-muted mt-2 leading-relaxed">{t(s.what, locale)}</p>
                <dl className="mt-4 grid sm:grid-cols-3 gap-3 text-sm">
                  <div className="rounded-xl bg-soft p-3"><dt className="text-xs text-text-muted">{u.where}</dt><dd className="text-dark mt-0.5">{t(s.where, locale)}</dd></div>
                  <div className="rounded-xl bg-soft p-3"><dt className="text-xs text-text-muted">{u.time}</dt><dd className="text-dark mt-0.5">{t(s.time, locale)}</dd></div>
                  {s.cost && <div className="rounded-xl bg-soft p-3"><dt className="text-xs text-text-muted">{u.cost}</dt><dd className="text-dark mt-0.5">{t(s.cost, locale)}</dd></div>}
                </dl>
                {s.tip && <p className="mt-3 text-sm text-dark border-l-2 border-gold pl-3"><strong>{u.tip}:</strong> {t(s.tip, locale)}</p>}
              </div>
            </li>
          );
        })}
      </ol>
      <p className="text-xs text-text-muted mt-4">{u.note}</p>
    </section>
  );
}
