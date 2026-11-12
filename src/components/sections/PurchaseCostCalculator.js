'use client';

import { useEffect, useMemo, useState } from 'react';
import { useLocale } from 'next-intl';
import { Receipt, ChevronDown } from 'lucide-react';
import { useRoiData } from '@/lib/roi';
import { gt } from '@/lib/growthText';

const TAG = { tr: 'tr-TR', es: 'es-ES', en: 'en-GB', de: 'de-DE' };

function Row({ label, value, strong, hint }) {
  return (
    <div className={`flex justify-between gap-4 text-sm text-white ${strong ? 'font-semibold' : ''}`}>
      <span>
        {label}
        {hint ? <span className="block text-xs text-white/70 font-normal">{hint}</span> : null}
      </span>
      <span className="tabular-nums whitespace-nowrap">{value}</span>
    </div>
  );
}

// What a home really costs: price plus taxes and fees (Comunitat Valenciana), and the fixed yearly costs afterwards.
// Rates come from the same admin-managed table as the ROI calculator. compact = fixed price, collapsible (listing page).
export default function PurchaseCostCalculator({ initialPrice, compact = false }) {
  const locale = useLocale();
  const c = gt(locale).cost;
  const { data } = useRoiData();
  const a = data.assumptions;
  const fixed = Number(initialPrice) > 0 ? Number(initialPrice) : null;
  const [price, setPrice] = useState(fixed || 250000);
  const [kind, setKind] = useState('resale');
  const [open, setOpen] = useState(!compact);
  const [tryRate, setTryRate] = useState(null);

  useEffect(() => { if (fixed) setPrice(fixed); }, [fixed]);
  useEffect(() => {
    if (compact && !open) return undefined;
    let off = false;
    fetch('https://api.frankfurter.dev/v1/latest?base=EUR&symbols=TRY')
      .then((r) => r.json())
      .then((j) => { if (!off && j?.rates?.TRY) setTryRate(Number(j.rates.TRY)); })
      .catch(() => {});
    return () => { off = true; };
  }, [compact, open]);

  const eur = (n) => new Intl.NumberFormat(TAG[locale] || 'en-GB', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
  const rate = (n) => new Intl.NumberFormat(TAG[locale] || 'en-GB', { maximumFractionDigits: 2 }).format(n);

  const r = useMemo(() => {
    const P = Number(price) || 0;
    const resale = kind === 'resale';
    const high = resale && P > a.itp_high_threshold;
    const itpRate = high ? a.itp_high_pct : a.itp_pct;
    const taxes = resale
      ? [{ label: c.itp(rate(itpRate)), amount: (P * itpRate) / 100 }]
      : [
          { label: c.vat(rate(a.vat_new_pct)), amount: (P * a.vat_new_pct) / 100 },
          { label: c.ajd(rate(a.ajd_pct)), amount: (P * a.ajd_pct) / 100 },
        ];
    const taxSum = taxes.reduce((t, x) => t + x.amount, 0);
    const legal = (P * a.legal_costs_pct) / 100;
    const costs = taxSum + legal;
    const yearly = { ibi: (P * a.ibi_pct) / 100, community: a.community_monthly * 12, insurance: a.insurance_annual };
    const yearlyTotal = yearly.ibi + yearly.community + yearly.insurance;
    return { P, high, taxes, legal, costs, total: P + costs, pctOfPrice: P ? (costs / P) * 100 : 0, yearly, yearlyTotal };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [price, kind, a, locale]);

  const updated = data.updatedAt
    ? new Date(data.updatedAt).toLocaleDateString(TAG[locale] || 'en-GB', { month: 'long', year: 'numeric' })
    : '';
  const tryText = tryRate ? new Intl.NumberFormat(TAG[locale] || 'en-GB', { maximumFractionDigits: 0 }).format(Math.round((r.total * tryRate) / 1000) * 1000) : null;

  const kindButtons = (
    <div className="grid grid-cols-2 gap-3">
      {[['resale', c.resale], ['new', c.newBuild]].map(([v, l]) => (
        <button
          key={v}
          type="button"
          onClick={() => setKind(v)}
          className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${kind === v ? 'bg-gold text-dark shadow-gold' : 'bg-soft text-text-secondary hover:bg-border'}`}
        >
          {l}
        </button>
      ))}
    </div>
  );

  const results = (
    <div className="space-y-5">
      <div className="space-y-2.5">
        <Row label={c.price} value={eur(r.P)} />
        <p className="text-xs text-white/70 pt-1">{c.taxes}</p>
        {r.taxes.map((x) => <Row key={x.label} label={x.label} value={eur(x.amount)} />)}
        <p className="text-xs text-white/70 pt-1">{c.extras}</p>
        <Row label={c.legal(rate(a.legal_costs_pct))} value={eur(r.legal)} />
        <div className="border-t border-white/15 pt-3">
          <Row label={c.costsTotal} value={eur(r.costs)} hint={c.ofPrice(rate(r.pctOfPrice))} strong />
        </div>
      </div>

      <div className="bg-charcoal rounded-xl p-5">
        <p className="text-sm text-white">{c.total}</p>
        <p className="text-3xl font-serif text-gold mt-1">{eur(r.total)}</p>
        <p className="text-xs text-white/70 mt-1">{c.totalHint}</p>
        {tryText && <p className="text-xs text-white mt-2">{c.tryApprox(tryText)}</p>}
      </div>
      {r.high && <p className="text-xs text-gold">{c.highItp}</p>}

      <div className="space-y-2.5">
        <p className="text-xs text-white/70">{c.yearly}</p>
        <Row label={c.ibi} value={eur(r.yearly.ibi)} />
        <Row label={c.community} value={eur(r.yearly.community)} />
        <Row label={c.insurance} value={eur(r.yearly.insurance)} />
        <div className="border-t border-white/15 pt-3">
          <Row label={c.yearlyTotal} value={eur(r.yearlyTotal)} hint={c.perMonth(eur(r.yearlyTotal / 12))} strong />
        </div>
      </div>

      <p className="text-xs text-white/80 leading-relaxed">{c.notIncluded}</p>
      <p className="text-xs text-white/80 leading-relaxed">{c.disclaimer(updated)}</p>
    </div>
  );

  if (compact) {
    return (
      <div className="bg-dark rounded-2xl text-white overflow-hidden">
        <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="w-full flex items-center gap-3 p-5 sm:p-6 text-left">
          <span className="w-10 h-10 rounded-xl bg-gold/20 flex items-center justify-center shrink-0"><Receipt size={20} className="text-gold" /></span>
          <span className="flex-1">
            <span className="block font-serif text-lg">{c.listingTitle}</span>
            <span className="block text-sm text-white/80">{open ? c.listingClose : `${c.listingOpen}: ${eur(r.total)}`}</span>
          </span>
          <ChevronDown size={20} className={`text-gold transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
        {open && (
          <div className="px-5 sm:px-6 pb-6 space-y-5">
            <div className="rounded-lg bg-white/5 p-3">{kindButtons}</div>
            {results}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
      <div className="dark-card rounded-2xl border border-white/10 p-6 sm:p-8 space-y-7">
        <div>
          <label htmlFor="cost-price" className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-text-primary">{c.price}</span>
            <span className="text-lg font-serif text-gold">{eur(r.P)}</span>
          </label>
          <input
            id="cost-price"
            type="range"
            min="50000"
            max="1500000"
            step="10000"
            value={Math.min(Math.max(Number(price) || 0, 50000), 1500000)}
            onChange={(e) => setPrice(Number(e.target.value))}
            className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer accent-gold"
          />
          <div className="flex justify-between text-xs text-text-muted mt-1"><span>€50K</span><span>€1,5M</span></div>
        </div>
        <div>
          <span className="block text-sm font-medium text-text-primary mb-2">{c.kind}</span>
          {kindButtons}
        </div>
      </div>
      <div className="bg-dark rounded-2xl p-6 sm:p-8 text-white">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gold/20 flex items-center justify-center"><Receipt size={20} className="text-gold" /></div>
          <h3 className="font-serif text-lg">{c.total}</h3>
        </div>
        {results}
      </div>
    </div>
  );
}
