'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { Check, Send, MapPin, Eye, Building2, Sparkles, Landmark, Scale, TrendingUp } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { localePath } from '@/lib/routes';
import { VAL, vt, AREA_OPTIONS, estimate } from '@/lib/valuation';

const FACTOR_ICONS = [MapPin, Eye, Building2, Sparkles, TrendingUp, Scale];
const inputCls = 'w-full px-4 py-3 bg-soft border border-border rounded-lg text-dark focus:outline-none focus:ring-2 focus:ring-gold/40';
const Label = ({ children, req }) => <label className="block text-sm font-medium text-dark mb-1.5">{children}{req ? ' *' : ''}</label>;

function Choice({ value, onChange, options, locale }) {
  return (
    <div className="flex flex-wrap gap-2">
      {Object.entries(options).map(([k, label]) => (
        <button type="button" key={k} onClick={() => onChange(k)} aria-pressed={value === k}
          className={`px-4 py-2.5 rounded-xl border text-sm transition-colors ${value === k ? 'bg-gold text-dark border-gold font-semibold' : 'bg-white text-dark border-border hover:border-gold'}`}>
          {vt(label, locale)}
        </button>
      ))}
    </div>
  );
}

export default function ValuationPage() {
  const locale = useLocale();
  const nf = new Intl.NumberFormat(locale);
  const [f, setF] = useState({ area: '', town: '', type: 'apartment', size: '', beds: '', cond: 'good', goal: 'sell', name: '', email: '', phone: '', note: '', consent: false });
  const [state, setState] = useState('idle'); // idle | sending | done | error | invalid
  const [result, setResult] = useState(null);
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e && e.target ? (e.target.type === 'checkbox' ? e.target.checked : e.target.value) : e }));

  const all = [...AREA_OPTIONS.valencia, ...AREA_OPTIONS.alicante, ...AREA_OPTIONS.costa];
  const picked = all.find((a) => a.id === f.area);
  const pickedName = picked ? (picked.name || vt(VAL[picked.key], locale)) : f.area === 'other' ? f.town : '';
  const needsTown = f.area === 'other';

  const submit = async (e) => {
    e.preventDefault();
    const okEmail = /^\S+@\S+\.\S+$/.test(f.email.trim());
    if (!f.area || (needsTown && !f.town.trim()) || !Number(f.size) || !f.name.trim() || !okEmail || !f.consent) { setState('invalid'); return; }
    setState('sending');
    const est = estimate(picked, f);
    const lines = [
      '[DEĞERLEME TALEBİ / VALUATION REQUEST]',
      `Bölge: ${pickedName}${picked && picked.sale ? '' : ''}`,
      `Tür: ${vt(VAL.types[f.type], 'tr')}`,
      `Büyüklük: ${Number(f.size)} m²`,
      est ? `Gösterilen tahmini aralık: ${est.low}-${est.high} € (${est.perM2} €/m² baz)` : 'Çevrimiçi aralık gösterilmedi (danışman değerlemesi)',
      f.beds ? `Yatak odası: ${f.beds}` : null,
      `Durum: ${vt(VAL.conds[f.cond], 'tr')}`,
      `Amaç: ${vt(VAL.goals[f.goal], 'tr')}`,
      f.note.trim() ? `Not: ${f.note.trim()}` : null,
    ].filter(Boolean);
    const { error } = await supabase.from('contact_messages').insert({
      name: f.name.trim(), email: f.email.trim(), phone: f.phone.trim() || null, message: lines.join('\n'), lang: locale,
    });
    if (!error) setResult(est ? { ...est, name: pickedName } : { none: true });
    setState(error ? 'error' : 'done');
  };

  const faqLd = JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: VAL.faq.map(([q, a]) => ({ '@type': 'Question', name: vt(q, locale), acceptedAnswer: { '@type': 'Answer', text: vt(a, locale) } })) });

  return (
    <div className="bg-soft min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: faqLd }} />
      <header className="bg-gradient-to-br from-[#0B0B11] to-[#1d2340] text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-44 pb-12 sm:pb-16">
          <h1 className="text-4xl sm:text-5xl font-serif mb-4 max-w-3xl">{vt(VAL.title, locale)}</h1>
          <p className="text-lg text-white/85 max-w-2xl">{vt(VAL.sub, locale)}</p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {state === 'done' ? (
          <div className="rounded-2xl bg-white border border-gold/40 p-8 sm:p-10 max-w-2xl mx-auto">
            {result && !result.none && (
              <div className="text-center mb-8 pb-8 border-b border-border">
                <p className="text-sm text-text-muted mb-2">{vt(VAL.resTitle, locale)}</p>
                <p className="font-serif text-4xl sm:text-5xl text-dark">{nf.format(result.low)} – {nf.format(result.high)} €</p>
                <p className="text-sm text-text-muted mt-4 max-w-lg mx-auto">{vt(VAL.resNote(result.name, nf.format(result.perM2)), locale)}</p>
              </div>
            )}
            {result && result.none && <p className="text-sm text-text-muted mb-8 pb-8 border-b border-border text-center">{vt(VAL.resNone, locale)}</p>}
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-gold flex items-center justify-center mx-auto mb-5"><Check size={24} className="text-dark" /></div>
              <h2 className="font-serif text-2xl text-dark mb-2">{vt(VAL.doneTitle, locale)}</h2>
              <p className="text-text-muted">{vt(VAL.doneText, locale)}</p>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="rounded-2xl bg-white border border-border p-6 sm:p-8 space-y-7 max-w-3xl mx-auto" noValidate>
            <h2 className="font-serif text-2xl text-dark">{vt(VAL.formTitle, locale)}</h2>

            <div>
              <Label req>{vt(VAL.where, locale)}</Label>
              <select value={f.area} onChange={set('area')} className={inputCls}>
                <option value="">{vt(VAL.pick, locale)}</option>
                {['valencia', 'alicante', 'costa'].map((g) => (
                  <optgroup key={g} label={vt(VAL.groups[g], locale)}>
                    {AREA_OPTIONS[g].map((a) => <option key={a.id} value={a.id}>{a.name || vt(VAL[a.key], locale)}</option>)}
                  </optgroup>
                ))}
                <optgroup label={vt(VAL.groups.other, locale)}><option value="other">{vt(VAL.otherRegion, locale)}</option></optgroup>
              </select>
              <p className="text-xs text-text-muted mt-1.5">{vt(VAL.whereHint, locale)}</p>
              {needsTown && (
                <div className="mt-3">
                  <Label req>{vt(VAL.town, locale)}</Label>
                  <input value={f.town} onChange={set('town')} placeholder={vt(VAL.townHint, locale)} className={inputCls} />
                </div>
              )}
            </div>

            <div><Label>{vt(VAL.type, locale)}</Label><Choice value={f.type} onChange={set('type')} options={VAL.types} locale={locale} /></div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div><Label req>{vt(VAL.size, locale)}</Label><input type="number" inputMode="numeric" min="10" max="2000" value={f.size} onChange={set('size')} className={inputCls} /></div>
              <div>
                <Label>{vt(VAL.beds, locale)}</Label>
                <select value={f.beds} onChange={set('beds')} className={inputCls}>
                  <option value="">–</option>
                  {['0', '1', '2', '3', '4', '5+'].map((b) => <option key={b} value={b}>{b === '0' ? 'Studio' : b}</option>)}
                </select>
              </div>
            </div>

            <div><Label>{vt(VAL.cond, locale)}</Label><Choice value={f.cond} onChange={set('cond')} options={VAL.conds} locale={locale} /></div>
            <div><Label>{vt(VAL.goal, locale)}</Label><Choice value={f.goal} onChange={set('goal')} options={VAL.goals} locale={locale} /></div>

            <div className="pt-2 border-t border-border space-y-5">
              <h3 className="font-serif text-xl text-dark pt-5">{vt(VAL.contact, locale)}</h3>
              <div><Label req>{vt(VAL.name, locale)}</Label><input value={f.name} onChange={set('name')} autoComplete="name" className={inputCls} /></div>
              <div className="grid sm:grid-cols-2 gap-5">
                <div><Label req>{vt(VAL.email, locale)}</Label><input type="email" value={f.email} onChange={set('email')} autoComplete="email" className={inputCls} /></div>
                <div><Label>{vt(VAL.phone, locale)}</Label><input type="tel" value={f.phone} onChange={set('phone')} autoComplete="tel" className={inputCls} /></div>
              </div>
              <div><Label>{vt(VAL.note, locale)}</Label><textarea rows={3} value={f.note} onChange={set('note')} className={`${inputCls} resize-none`} /></div>
              <label className="flex items-start gap-3 text-sm text-text-muted">
                <input type="checkbox" checked={f.consent} onChange={set('consent')} className="mt-1 h-4 w-4 accent-[#C9A84C]" />
                <span>{vt(VAL.consentA, locale)} <a href={localePath(locale, 'gizlilik')} className="text-gold underline">{vt(VAL.consentB, locale)}</a></span>
              </label>
            </div>

            {(state === 'invalid' || state === 'error') && <p className="text-sm text-red-500" role="alert">{vt(state === 'invalid' ? VAL.required : VAL.err, locale)}</p>}
            <button type="submit" disabled={state === 'sending'} className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gold text-dark font-semibold rounded-xl hover:bg-gold-hover transition-colors disabled:opacity-60">
              {vt(state === 'sending' ? VAL.sending : VAL.send, locale)}<Send size={16} />
            </button>
          </form>
        )}

        <section>
          <h2 className="font-serif text-3xl text-dark mb-6">{vt(VAL.stepsTitle, locale)}</h2>
          <ol className="grid md:grid-cols-3 gap-5">
            {VAL.steps.map(([h, tx], i) => (
              <li key={i} className="rounded-2xl bg-white border border-border p-6">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold text-dark font-semibold mb-3">{i + 1}</span>
                <h3 className="font-serif text-xl text-dark mb-1">{vt(h, locale)}</h3>
                <p className="text-text-muted text-sm">{vt(tx, locale)}</p>
              </li>
            ))}
          </ol>
        </section>

        <section>
          <h2 className="font-serif text-3xl text-dark mb-6">{vt(VAL.factorsTitle, locale)}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {VAL.factors.map(([h, tx], i) => { const Icon = FACTOR_ICONS[i] || Landmark; return (
              <div key={i} className="rounded-2xl bg-white border border-border p-5 flex gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold"><Icon size={20} /></span>
                <div><h3 className="font-semibold text-dark">{vt(h, locale)}</h3><p className="text-sm text-text-muted mt-0.5">{vt(tx, locale)}</p></div>
              </div>); })}
          </div>
        </section>

        <section className="max-w-3xl">
          <h2 className="font-serif text-3xl text-dark mb-6">{vt(VAL.faqTitle, locale)}</h2>
          <div className="space-y-3">
            {VAL.faq.map(([q, a], i) => (
              <details key={i} className="rounded-xl bg-white border border-border p-5 group">
                <summary className="cursor-pointer font-semibold text-dark list-none flex justify-between gap-4">{vt(q, locale)}<span className="text-gold group-open:rotate-45 transition-transform">+</span></summary>
                <p className="text-text-muted mt-3">{vt(a, locale)}</p>
              </details>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
