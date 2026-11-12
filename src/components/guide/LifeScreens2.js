'use client';

import { useEffect, useMemo, useState } from 'react';
import { useLocale } from 'next-intl';
import { Palmtree, Laptop, Briefcase, GraduationCap, Info, Building2, ShieldCheck, Siren, Clock, Thermometer, Wallet, DoorOpen, Languages, CloudRain, Ban, Volume2, MapPin, ArrowRight, RotateCcw, CalendarDays, Hospital } from 'lucide-react';
import { localePath } from '@/lib/routes';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/providers/AuthProvider';
import { trackFunnel } from '@/lib/funnel';
import { VISAS, VISA_NOTES, TAX, SCHOOL_TYPES, SCHOOL_FACTS, SCHOOL_TR, CLIMATE, CLIMATE_NOTES, HEALTH_BLOCKS, HOSPITALS, EVENTS, QUIZ, QUIZ_FLIGHT_TR, CONS, LIFE2_SOURCES, months, life2Ui } from '@/lib/lifeContent2';

const t = (o, l) => (o && (o[l] || o.tr)) || '';
const ICONS = { Palmtree, Laptop, Briefcase, GraduationCap, Building2, ShieldCheck, Siren, Clock, Thermometer, Wallet, DoorOpen, Languages, CloudRain, Ban, Volume2 };

function H2({ children }) {
  return <h2 className="font-serif text-2xl sm:text-3xl text-dark mb-4">{children}</h2>;
}
function Bullet({ children }) {
  return <li className="flex gap-3"><span className="mt-2 h-1.5 w-1.5 rounded-full bg-gold shrink-0" /><span className="text-dark leading-relaxed">{children}</span></li>;
}

export function Sources2({ locale }) {
  const u = life2Ui(locale);
  return (
    <p className="text-xs text-text-muted">
      <strong>{u.sourcesTitle}:</strong>{' '}
      {LIFE2_SOURCES.filter((x) => !x[2] || locale === 'tr').map(([n, href], i) => (<span key={href}>{i > 0 && ', '}<a href={href} target="_blank" rel="noopener noreferrer" className="underline">{n}</a></span>))}
    </p>
  );
}

// ---------- Visas ----------
export function Visas() {
  const locale = useLocale();
  const u = life2Ui(locale).visa;
  return (
    <>
      <section>
        <H2>{u.title}</H2>
        <div className="grid md:grid-cols-2 gap-4">
          {VISAS.map((v) => {
            const Icon = ICONS[v.icon] || Info;
            return (
              <article key={v.id} className="rounded-2xl bg-white border border-border p-5 sm:p-6">
                <h3 className="font-serif text-xl text-dark flex items-center gap-3 mb-3"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/15 text-gold"><Icon size={19} /></span>{t(v.title, locale)}</h3>
                <dl className="space-y-3 text-sm">
                  <div><dt className="text-xs text-text-muted">{u.who}</dt><dd className="text-dark">{t(v.who, locale)}</dd></div>
                  <div className="rounded-xl bg-dark text-white p-3"><dt className="text-xs text-gold">{u.money}</dt><dd>{t(v.money, locale)}</dd></div>
                  <div><dt className="text-xs text-text-muted">{u.rules}</dt><dd className="text-dark">{t(v.rules, locale)}</dd></div>
                </dl>
              </article>
            );
          })}
        </div>
      </section>
      <section className="rounded-2xl border border-gold/40 bg-white p-5 sm:p-6">
        <h3 className="font-serif text-xl text-dark mb-3">{u.notes}</h3>
        <ul className="space-y-2">{VISA_NOTES.map((n, i) => <Bullet key={i}>{t(n, locale)}</Bullet>)}</ul>
      </section>
    </>
  );
}

// ---------- Tax ----------
export function Tax() {
  const locale = useLocale();
  const u = life2Ui(locale).tax;
  const block = (title, list) => (
    <section className="rounded-2xl bg-white border border-border p-5 sm:p-6">
      <h3 className="font-serif text-xl text-dark mb-3">{title}</h3>
      <ul className="space-y-3">{list.map((x, i) => <Bullet key={i}>{t(x, locale)}</Bullet>)}</ul>
    </section>
  );
  return (
    <>
      <H2>{u.title}</H2>
      {block(u.nonres, TAX.nonres)}
      {block(u.res, TAX.res)}
      {block(u.both, TAX.both)}
      {locale === 'tr' && (
        <section className="rounded-2xl bg-dark text-white p-5 sm:p-6">
          <h3 className="font-serif text-xl text-gold mb-2">{u.turkey}</h3>
          <p className="text-white/85 leading-relaxed">{TAX.turkey.tr}</p>
        </section>
      )}
      <p className="rounded-2xl border border-gold/40 bg-white p-5 text-dark">{u.ask}</p>
    </>
  );
}

// ---------- School system (added to the schools page) ----------
export function SchoolSystem() {
  const locale = useLocale();
  const u = life2Ui(locale).school;
  return (
    <section>
      <H2>{u.title}</H2>
      <div className="grid sm:grid-cols-2 gap-4">
        {SCHOOL_TYPES.map((s) => (
          <article key={s.id} className="rounded-2xl bg-white border border-border p-5">
            <h3 className="font-serif text-lg text-dark mb-2">{t(s.title, locale)}</h3>
            <p className="text-sm text-text-muted mb-3">{t(s.t, locale)}</p>
            <p className="text-sm text-dark"><span className="text-xs text-gold font-semibold mr-1">{u.cost}:</span>{t(s.cost, locale)}</p>
          </article>
        ))}
      </div>
      <ul className="mt-5 space-y-3 rounded-2xl bg-white border border-border p-5 sm:p-6">
        {SCHOOL_FACTS.map((f, i) => <Bullet key={i}>{t(f, locale)}</Bullet>)}
      </ul>
      {locale === 'tr' && <p className="mt-4 rounded-2xl border border-gold/40 bg-white p-5 text-dark">{SCHOOL_TR.tr}</p>}
    </section>
  );
}

// ---------- Climate ----------
function Range({ lo, hi, min, max }) {
  const span = max - min;
  return (
    <div className="relative h-2.5 rounded-full bg-gray-100">
      <div className="absolute h-full rounded-full bg-gradient-to-r from-sky-300 via-gold to-[#DC1C2E]" style={{ left: `${((lo - min) / span) * 100}%`, width: `${((hi - lo) / span) * 100}%` }} />
    </div>
  );
}

export function Climate() {
  const locale = useLocale();
  const u = life2Ui(locale).climate;
  const m = months(locale);
  const cities = Object.entries(CLIMATE).filter(([, c]) => !c.tr || locale === 'tr');
  const [sel, setSel] = useState(cities.map(([k]) => k));
  const shown = cities.filter(([k]) => sel.includes(k));
  const all = shown.flatMap(([, c]) => [...c.tmin, ...c.tmax]);
  const min = Math.floor(Math.min(...all, 0)), max = Math.ceil(Math.max(...all, 32));
  const nf = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 });
  const toggle = (k) => setSel((s) => (s.includes(k) ? (s.length > 1 ? s.filter((x) => x !== k) : s) : [...s, k]));
  return (
    <>
      <section>
        <H2>{u.title}</H2>
        <p className="text-text-muted mb-4">{u.intro}</p>
        <div className="flex flex-wrap gap-2 mb-5">
          {cities.map(([k, c]) => (
            <button key={k} type="button" onClick={() => toggle(k)} aria-pressed={sel.includes(k)}
              className={`rounded-full border px-4 py-1.5 text-sm ${sel.includes(k) ? 'bg-dark text-white border-dark' : 'bg-white text-dark border-border'}`}>{c.name}</button>
          ))}
        </div>
        <div className="rounded-2xl bg-white border border-border divide-y divide-border">
          {m.map((name, i) => (
            <div key={name} className="p-3 sm:p-4 grid sm:grid-cols-[6rem_1fr] gap-2 items-start">
              <p className="font-medium text-dark">{name}</p>
              <div className="space-y-2">
                {shown.map(([k, c]) => (
                  <div key={k} className="grid grid-cols-[5.5rem_1fr_6.5rem] gap-2 items-center text-xs">
                    <span className="text-text-muted truncate">{c.name}</span>
                    <Range lo={c.tmin[i]} hi={c.tmax[i]} min={min} max={max} />
                    <span className="tabular-nums text-dark text-right">{nf.format(c.tmin[i])}° / <strong>{nf.format(c.tmax[i])}°</strong></span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="overflow-x-auto mt-5">
          <table className="min-w-full text-sm bg-white rounded-2xl border border-border">
            <thead><tr className="text-left text-xs text-text-muted"><th className="p-3"></th>{shown.map(([k, c]) => <th key={k} className="p-3">{c.name}</th>)}</tr></thead>
            <tbody className="divide-y divide-border">
              <tr><td className="p-3 text-text-muted">{u.hum} · {m[6]}</td>{shown.map(([k, c]) => <td key={k} className="p-3">{c.hum ? `%${c.hum[6]}` : '—'}</td>)}</tr>
              <tr><td className="p-3 text-text-muted">{u.sun} · {m[0]}</td>{shown.map(([k, c]) => <td key={k} className="p-3">{c.sun ? nf.format(c.sun[0] / 31) : '—'}</td>)}</tr>
              <tr><td className="p-3 text-text-muted">{u.sun} · {m[6]}</td>{shown.map(([k, c]) => <td key={k} className="p-3">{c.sun ? nf.format(c.sun[6] / 31) : '—'}</td>)}</tr>
              <tr><td className="p-3 text-text-muted">{u.rain}</td>{shown.map(([k, c]) => <td key={k} className="p-3">{Math.round(c.rainDays.reduce((x, y) => x + y, 0))}</td>)}</tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs text-text-muted mt-3">{u.note}</p>
      </section>
      <section className="grid sm:grid-cols-2 gap-4">
        {CLIMATE_NOTES.map((n, i) => (
          <p key={i} className={`rounded-2xl p-5 leading-relaxed ${i === 1 ? 'bg-amber-50 border border-amber-300 text-dark' : 'bg-white border border-border text-dark'}`}>{t(n, locale)}</p>
        ))}
      </section>
    </>
  );
}

// ---------- Health ----------
export function Health() {
  const locale = useLocale();
  const u = life2Ui(locale).health;
  return (
    <>
      <section>
        <H2>{u.title}</H2>
        <div className="grid md:grid-cols-3 gap-4">
          {HEALTH_BLOCKS.map((b) => {
            const Icon = ICONS[b.icon] || Info;
            return (
              <article key={b.icon} className="rounded-2xl bg-white border border-border p-5">
                <h3 className="font-serif text-lg text-dark flex items-center gap-2 mb-2"><Icon size={18} className="text-gold" />{t(b.title, locale)}</h3>
                <p className="text-sm text-text-muted leading-relaxed">{t(b.t, locale)}</p>
              </article>
            );
          })}
        </div>
      </section>
      <section>
        <h3 className="font-serif text-xl text-dark mb-3 flex items-center gap-2"><Hospital size={20} className="text-gold" />{u.hospitals}</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {['valencia', 'alicante'].map((c) => (
            <ul key={c} className="rounded-2xl bg-white border border-border p-5 space-y-2">
              <li className="font-serif text-lg text-dark capitalize">{c === 'valencia' ? 'Valencia' : 'Alicante'}</li>
              {HOSPITALS.filter((h) => h.city === c).map((h) => (
                <li key={h.name} className="flex justify-between gap-3 text-sm">
                  <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(h.name)}`} target="_blank" rel="noopener noreferrer" className="text-dark hover:text-gold flex gap-1.5"><MapPin size={13} className="text-gold shrink-0 mt-1" />{h.name}</a>
                  <span className={`shrink-0 text-xs rounded-full px-2 py-0.5 h-fit ${h.type === 'public' ? 'bg-emerald-100 text-emerald-800' : 'bg-gold/15 text-dark'}`}>{h.type === 'public' ? u.public : u.private}</span>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </section>
      <p className="rounded-2xl border border-gold/40 bg-white p-5 text-dark">{u.ask}</p>
    </>
  );
}

// ---------- Events ----------
export function Events() {
  const locale = useLocale();
  const u = life2Ui(locale).events;
  const m = months(locale);
  const now = new Date().getMonth();
  const [only, setOnly] = useState(false);
  // Admin-edited events (city_events table); the static list stays as the fallback.
  const [rows, setRows] = useState(null);
  useEffect(() => {
    let live = true;
    supabase.from('city_events').select('*').eq('status', 'published').then(({ data, error }) => {
      if (live && !error && data?.length) setRows(data);
    }, () => {});
    return () => { live = false; };
  }, []);
  const all = useMemo(() => {
    if (!rows) return EVENTS;
    const pickL = (r, base) => ({ tr: r[`${base}_tr`], es: r[`${base}_es`], en: r[`${base}_en`], de: r[`${base}_de`] });
    return rows.map((r) => ({
      m: r.recurring_month ? r.recurring_month - 1 : new Date(`${r.start_date}T12:00:00`).getMonth(),
      sort: r.start_date || '',
      city: r.city, name: pickL(r, 'title'), date: pickL(r, 'date_label'), t: pickL(r, 'summary'),
    })).sort((a, b) => a.m - b.m || a.sort.localeCompare(b.sort));
  }, [rows]);
  const list = all.filter((e) => !only || e.m === now);
  const cityName = (c) => (c === 'both' ? 'Valencia · Alicante' : c === 'valencia' ? 'Valencia' : 'Alicante');
  return (
    <section>
      <H2>{u.title}</H2>
      <div className="flex gap-2 mb-5">
        {[[false, u.all], [true, `${u.now}: ${m[now]}`]].map(([v, l]) => (
          <button key={String(v)} type="button" onClick={() => setOnly(v)} aria-pressed={only === v}
            className={`rounded-full border px-4 py-1.5 text-sm ${only === v ? 'bg-dark text-white border-dark' : 'bg-white text-dark border-border'}`}>{l}</button>
        ))}
      </div>
      {list.length === 0 && <p className="text-text-muted">—</p>}
      <ol className="space-y-3">
        {list.map((e, i) => (
          <li key={i} className={`rounded-2xl border p-5 grid sm:grid-cols-[8rem_1fr] gap-3 ${e.m === now ? 'bg-dark text-white border-gold' : 'bg-white border-border'}`}>
            <p className={`font-serif text-lg flex items-center gap-2 ${e.m === now ? 'text-gold' : 'text-dark'}`}><CalendarDays size={17} />{m[e.m]}</p>
            <div>
              <h3 className="font-serif text-lg">{t(e.name, locale)}</h3>
              <p className={`text-xs mb-1.5 ${e.m === now ? 'text-white/70' : 'text-text-muted'}`}>{cityName(e.city)} · {t(e.date, locale)}</p>
              <p className={`text-sm leading-relaxed ${e.m === now ? 'text-white/85' : 'text-text-muted'}`}>{t(e.t, locale)}</p>
            </div>
          </li>
        ))}
      </ol>
      <p className="text-xs text-text-muted mt-3">{u.note}</p>
    </section>
  );
}

// ---------- Quiz (open to guests; ends with an invite) ----------
export function Quiz() {
  const locale = useLocale();
  const u = life2Ui(locale).quiz;
  const { user } = useAuth();
  const qs = useMemo(() => {
    const base = QUIZ.map((q) => ({ q: t(q.q, locale), a: q.a.map(([l, k]) => [t(l, locale), k]) }));
    return locale === 'tr' ? [...base, QUIZ_FLIGHT_TR] : base;
  }, [locale]);
  const [i, setI] = useState(0);
  const [score, setScore] = useState({ v: 0, a: 0 });
  const done = i >= qs.length;
  const pick = (k) => {
    setScore((s) => ({ ...s, [k]: s[k] + 1 }));
    if (i === 0) trackFunnel('invite_view', 'quiz_start');
    setI(i + 1);
  };
  const res = score.v > score.a ? 'v' : score.a > score.v ? 'a' : 'tie';
  return (
    <section className="max-w-2xl">
      <H2>{u.title}</H2>
      <p className="text-text-muted mb-5">{u.intro}</p>
      {!done ? (
        <div className="rounded-2xl bg-white border border-border p-5 sm:p-7">
          <div className="h-1.5 rounded-full bg-gray-100 mb-5"><div className="h-full rounded-full bg-gold transition-all" style={{ width: `${(i / qs.length) * 100}%` }} /></div>
          <p className="text-xs text-text-muted mb-1">{u.of(i + 1, qs.length)}</p>
          <h3 className="font-serif text-2xl text-dark mb-5">{qs[i].q}</h3>
          <div className="grid gap-3">
            {qs[i].a.map(([label, k]) => (
              <button key={label} type="button" onClick={() => pick(k)}
                className="text-left rounded-xl border border-border px-4 py-3.5 text-dark hover:border-gold hover:bg-gold/5 transition-colors">{label}</button>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl bg-dark text-white p-6 sm:p-8">
          <p className="text-sm text-gold mb-1">{u.result}</p>
          <h3 className="font-serif text-3xl mb-3">{u[res]}</h3>
          <p className="text-white/85 mb-4">{u[`${res}Text`]}</p>
          <p className="text-xs text-white/60 mb-5">Valencia {score.v} · Alicante {score.a}</p>
          <div className="flex flex-wrap gap-3">
            {!user && (
              <a href={`${localePath(locale, 'giris')}?mode=register&from=quiz`} onClick={() => trackFunnel('invite_click', 'quiz')}
                className="inline-flex items-center gap-2 rounded-xl bg-gold text-dark font-semibold px-5 py-3 text-sm hover:bg-gold-hover">{u.join}<ArrowRight size={15} /></a>
            )}
            <a href={localePath(locale, 'semtler')} className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-5 py-3 text-sm hover:border-gold">{u.areas}</a>
            <button type="button" onClick={() => { setI(0); setScore({ v: 0, a: 0 }); }} className="inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm text-white/80 hover:text-gold"><RotateCcw size={14} />{u.again}</button>
          </div>
        </div>
      )}
    </section>
  );
}

// ---------- Downsides ----------
export function Cons() {
  const locale = useLocale();
  const u = life2Ui(locale).cons;
  return (
    <section>
      <H2>{u.title}</H2>
      <p className="text-text-muted mb-6 max-w-3xl">{u.intro}</p>
      <div className="grid md:grid-cols-2 gap-4">
        {CONS.map((c) => {
          const Icon = ICONS[c.icon] || Info;
          return (
            <article key={c.icon} className="rounded-2xl bg-white border border-border p-5 sm:p-6 flex gap-4">
              <span className="shrink-0 flex h-11 w-11 items-center justify-center rounded-full bg-gold-light text-gold"><Icon size={20} /></span>
              <div>
                <h3 className="font-serif text-lg text-dark mb-1">{t(c.title, locale)}</h3>
                <p className="text-sm text-text-muted leading-relaxed">{t(c.t, locale)}</p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
