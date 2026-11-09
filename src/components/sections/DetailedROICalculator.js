'use client';

import { useState, useMemo, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { Calculator, TrendingUp, Wallet, CalendarRange, AlertTriangle } from 'lucide-react';
import { useRoiData, computeROI } from '@/lib/roi';
import { roiText } from '@/lib/roiText';

const LOCALE_TAG = { tr: 'tr-TR', en: 'en-GB', es: 'es-ES', de: 'de-DE' };

function Choice({ options, value, onChange }) {
  return (
    <div className={`grid gap-3 ${options.length === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
            value === opt.value ? 'bg-gold text-dark shadow-gold' : 'bg-soft text-text-secondary hover:bg-border'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function Row({ label, value, strong, muted }) {
  return (
    <div className={`flex justify-between gap-4 text-sm ${strong ? 'text-white font-medium' : muted ? 'text-white' : 'text-white'}`}>
      <span>{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}

export default function DetailedROICalculator() {
  const locale = useLocale();
  const tx = roiText(locale);
  const { data, ready } = useRoiData();

  const [price, setPrice] = useState(200000);
  const [districtSlug, setDistrictSlug] = useState('valencia-ortalama');
  const [taxStatus, setTaxStatus] = useState('noneu');
  const [strategy, setStrategy] = useState('long');
  const [financing, setFinancing] = useState('cash');
  const [mortgageId, setMortgageId] = useState('');
  const [ltvPct, setLtvPct] = useState(60);
  const [termYears, setTermYears] = useState(25);

  // pick the first loan offer once the list is loaded
  useEffect(() => {
    if (!mortgageId && data.mortgages.length) setMortgageId(data.mortgages[0].id);
  }, [data.mortgages, mortgageId]);

  const prod = data.mortgages.find((m) => m.id === mortgageId);
  const canFinance = data.mortgages.length > 0;

  const eur = (n) =>
    new Intl.NumberFormat(LOCALE_TAG[locale] || 'en-GB', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
  const pct = (n) =>
    new Intl.NumberFormat(LOCALE_TAG[locale] || 'en-GB', { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(n);

  const r = useMemo(
    () =>
      computeROI(
        { price, districtSlug, taxStatus, strategy, financing: canFinance ? financing : 'cash', mortgageId, ltvPct, termYears },
        data
      ),
    [price, districtSlug, taxStatus, strategy, financing, mortgageId, ltvPct, termYears, data, canFinance]
  );

  const district = r.district;
  const showRange = r.priceVsTypical < 0.6 || r.priceVsTypical > 1.6;
  const negativeLeverage = r.mortgage && r.mortgage.rate_pct / 100 > r.grossYield;
  const updated = data.updatedAt
    ? new Date(data.updatedAt).toLocaleDateString(LOCALE_TAG[locale] || 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  const maxLtv = prod?.max_ltv_pct || 70;
  const maxTerm = prod?.max_term_years || 25;

  const label = 'block text-sm font-medium text-text-primary mb-2';

  return (
    <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
      {/* Inputs */}
      <div className="dark-card rounded-2xl border border-white/10 p-6 sm:p-8">
        <div className="space-y-7">
          <div>
            <label htmlFor="roi-price" className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-text-primary">{tx.price}</span>
              <span className="text-lg font-serif text-gold">{eur(price)}</span>
            </label>
            <input
              id="roi-price"
              type="range"
              min="50000"
              max="1000000"
              step="10000"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer accent-gold"
            />
            <div className="flex justify-between text-xs text-text-muted mt-1">
              <span>€50K</span>
              <span>€1M</span>
            </div>
          </div>

          <div>
            <label htmlFor="roi-district" className={label}>{tx.district}</label>
            <select
              id="roi-district"
              value={districtSlug}
              onChange={(e) => setDistrictSlug(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-white/10 bg-white text-sm text-text-primary"
            >
              {data.districts.map((d) => (
                <option key={d.slug} value={d.slug}>
                  {d.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-text-muted mt-2">{tx.typical(eur(district.ref_price), eur(district.ref_rent))}</p>
            {showRange && <p className="text-xs text-text-muted mt-1">{tx.outOfRange(`${Math.round(r.priceVsTypical * 100)}%`)}</p>}
          </div>

          <div>
            <span className={label}>{tx.taxStatus}</span>
            <Choice
              value={taxStatus}
              onChange={setTaxStatus}
              options={[
                { value: 'noneu', label: tx.taxNonEu },
                { value: 'eu', label: tx.taxEu },
              ]}
            />
          </div>

          <div>
            <span className={label}>{tx.strategy}</span>
            <Choice
              value={strategy}
              onChange={setStrategy}
              options={[
                { value: 'long', label: tx.long },
                { value: 'short', label: tx.short },
              ]}
            />
            {strategy === 'short' && (
              <p className="flex gap-2 text-xs text-text-muted mt-2 leading-relaxed">
                <AlertTriangle size={14} className="text-gold shrink-0 mt-0.5" />
                {tx.shortWarn}
              </p>
            )}
          </div>

          {canFinance && (
            <div>
              <span className={label}>{tx.financing}</span>
              <Choice
                value={financing}
                onChange={setFinancing}
                options={[
                  { value: 'cash', label: tx.cash },
                  { value: 'mortgage', label: tx.mortgage },
                ]}
              />
              {financing === 'mortgage' && (
                <div className="mt-4 space-y-4">
                  <select
                    aria-label={tx.loanProduct}
                    value={mortgageId}
                    onChange={(e) => {
                      setMortgageId(e.target.value);
                      const next = data.mortgages.find((m) => m.id === e.target.value);
                      if (next) {
                        setLtvPct((v) => Math.min(v, next.max_ltv_pct));
                        setTermYears((v) => Math.min(v, next.max_term_years));
                      }
                    }}
                    className="w-full px-4 py-2.5 rounded-lg border border-white/10 bg-white text-sm text-text-primary"
                  >
                    {data.mortgages.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} · {m.rate_pct.toFixed(2)}%
                      </option>
                    ))}
                  </select>
                  <div>
                    <label htmlFor="roi-ltv" className="flex justify-between text-sm text-text-primary mb-1">
                      <span>{tx.ltv}</span>
                      <span className="text-gold font-serif">
                        {Math.min(ltvPct, maxLtv)}% <span className="text-xs text-text-muted">({tx.maxLtv} {maxLtv}%)</span>
                      </span>
                    </label>
                    <input
                      id="roi-ltv"
                      type="range"
                      min="20"
                      max={maxLtv}
                      step="5"
                      value={Math.min(ltvPct, maxLtv)}
                      onChange={(e) => setLtvPct(Number(e.target.value))}
                      className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer accent-gold"
                    />
                  </div>
                  <div>
                    <label htmlFor="roi-term" className="flex justify-between text-sm text-text-primary mb-1">
                      <span>{tx.term}</span>
                      <span className="text-gold font-serif">
                        {Math.min(termYears, maxTerm)} {tx.years}
                      </span>
                    </label>
                    <input
                      id="roi-term"
                      type="range"
                      min="5"
                      max={maxTerm}
                      step="1"
                      value={Math.min(termYears, maxTerm)}
                      onChange={(e) => setTermYears(Number(e.target.value))}
                      className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer accent-gold"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="bg-dark rounded-2xl p-6 sm:p-8 text-white">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gold/20 flex items-center justify-center">
            <Calculator size={20} className="text-gold" />
          </div>
          <h3 className="font-serif text-lg">{tx.results}</h3>
        </div>

        <div className="space-y-4">
          <div className="bg-charcoal rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={16} className="text-gold" />
              <span className="text-sm text-white">{tx.netYield}</span>
            </div>
            <p className="text-3xl font-serif text-gold">{pct(r.netYield)}</p>
            <p className="text-xs text-white mt-1">
              {tx.grossYield}: {pct(r.grossYield)} · {tx.netYieldHint}
            </p>
          </div>

          <div className="bg-charcoal rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <Wallet size={16} className="text-gold" />
              <span className="text-sm text-white">{tx.monthlyCash}</span>
            </div>
            <p className="text-3xl font-serif text-gold">{eur(r.monthlyCashFlow)}</p>
            <p className="text-xs text-white mt-1">
              {tx.yearlyCash}: {eur(r.cashFlow)}
              {r.mortgage ? ` · ${tx.payment}: ${eur(r.monthlyPayment)}` : ''}
            </p>
            {negativeLeverage && <p className="text-xs text-gold mt-2">{tx.negative}</p>}
          </div>

          <div className="bg-charcoal rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <CalendarRange size={16} className="text-gold" />
              <span className="text-sm text-white">{tx.equity}</span>
            </div>
            <p className="text-3xl font-serif text-gold">{eur(r.equity)}</p>
            <p className="text-xs text-white mt-1">
              {tx.equityHint} · {tx.cashOnCash}: {pct(r.cashOnCash)}
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-2">
          <p className="text-xs uppercase tracking-wider text-white mb-2">{tx.breakdown}</p>
          <Row label={`${tx.rent} (${strategy === 'long' ? tx.vacancyNote : tx.short})`} value={eur(r.gross)} strong />
          {r.breakdown.mgmt > 0 && <Row label={tx.mgmt} value={`− ${eur(r.breakdown.mgmt)}`} />}
          {r.breakdown.strCost > 0 && <Row label={tx.strCost} value={`− ${eur(r.breakdown.strCost)}`} />}
          <Row label={tx.ibi} value={`− ${eur(r.breakdown.ibi)}`} />
          <Row label={tx.community} value={`− ${eur(r.breakdown.community)}`} />
          <Row label={tx.insurance} value={`− ${eur(r.breakdown.insurance)}`} />
          <Row label={tx.maintenance} value={`− ${eur(r.breakdown.maintenance)}`} />
          <Row label={tx.tax} value={`− ${eur(r.tax)}`} />
          <Row label={tx.net} value={eur(r.netOperating)} strong />
          {r.mortgage && <Row label={tx.loan} value={`− ${eur(r.monthlyPayment * 12)}`} />}
          <Row label={tx.buyCosts} value={eur(r.purchaseCosts)} muted />
        </div>

        <div className="mt-6 space-y-2">
          <p className="text-xs uppercase tracking-wider text-white mb-2">{tx.fiveYear}</p>
          <Row label={tx.fiveCash} value={eur(r.fiveYear.cumulativeCashFlow)} />
          {r.mortgage && <Row label={tx.fivePrincipal} value={eur(r.fiveYear.principal)} />}
          <Row label={tx.fiveGain} value={eur(r.fiveYear.valueGain)} />
          <Row label={tx.fiveCosts} value={`− ${eur(r.purchaseCosts + r.loanFee)}`} />
          <Row label={tx.fiveTotal} value={`${eur(r.fiveYear.total)} (${pct(r.fiveYear.onEquity)} ${tx.fiveEquity})`} strong />
        </div>

        <p className="text-xs text-white mt-6 leading-relaxed">
          {tx.dataSource}
          {updated ? ` ${tx.dataDate}: ${updated}.` : ''}
          {ready && data.fromFallback ? ` ${tx.fallback}` : ''}
        </p>
        <p className="text-xs text-white mt-2 leading-relaxed">{tx.disclaimer}</p>
      </div>
    </div>
  );
}
