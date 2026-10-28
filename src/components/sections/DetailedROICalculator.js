'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Calculator, TrendingUp, Wallet, CalendarRange } from 'lucide-react';

const BASE_RATES = { apartment: 0.065, house: 0.055, commercial: 0.075 };
const STRATEGY_MULTIPLIER = { longterm: 1, airbnb: 1.35 };

export default function DetailedROICalculator() {
  const t = useTranslations('roi');
  const locale = useLocale();
  const [budget, setBudget] = useState(200000);
  const [type, setType] = useState('apartment');
  const [strategy, setStrategy] = useState('longterm');

  const rate = BASE_RATES[type] * STRATEGY_MULTIPLIER[strategy];
  const annualReturn = budget * rate;
  const monthlyIncome = annualReturn / 12;
  const fiveYearIncome = annualReturn * 5;

  const formatCurrency = (n) =>
    new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);

  return (
    <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
      {/* Inputs */}
      <div className="bg-white rounded-2xl border border-border p-6 sm:p-8">
        <div className="space-y-7">
          <div>
            <label className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-text-primary">{t('budget')}</span>
              <span className="text-lg font-serif text-gold">{formatCurrency(budget)}</span>
            </label>
            <input
              type="range"
              min="50000"
              max="1000000"
              step="10000"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer accent-gold"
            />
            <div className="flex justify-between text-xs text-text-muted mt-1">
              <span>€50K</span>
              <span>€1M</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">{t('type')}</label>
            <div className="grid grid-cols-3 gap-3">
              {['apartment', 'house', 'commercial'].map((opt) => (
                <button
                  key={opt}
                  onClick={() => setType(opt)}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    type === opt ? 'bg-gold text-white shadow-gold' : 'bg-soft text-text-secondary hover:bg-border'
                  }`}
                >
                  {t(`type_${opt}`)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Kira Stratejisi</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'longterm', label: 'Uzun Dönem Kira' },
                { value: 'airbnb', label: 'Kısa Dönem (Airbnb)' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setStrategy(opt.value)}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    strategy === opt.value ? 'bg-gold text-white shadow-gold' : 'bg-soft text-text-secondary hover:bg-border'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="bg-dark rounded-2xl p-6 sm:p-8 text-white">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gold/20 flex items-center justify-center">
            <Calculator size={20} className="text-gold" />
          </div>
          <h3 className="font-serif text-lg">{t('title')}</h3>
        </div>

        <div className="space-y-5">
          <div className="bg-charcoal rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={16} className="text-gold" />
              <span className="text-sm text-white/60">{t('annual_return')}</span>
            </div>
            <p className="text-3xl font-serif text-gold">{formatCurrency(annualReturn)}</p>
            <p className="text-xs text-white/40 mt-1">{(rate * 100).toFixed(1)}% / yıl</p>
          </div>

          <div className="bg-charcoal rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <Wallet size={16} className="text-gold" />
              <span className="text-sm text-white/60">{t('monthly_income')}</span>
            </div>
            <p className="text-3xl font-serif text-gold">{formatCurrency(monthlyIncome)}</p>
          </div>

          <div className="bg-charcoal rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <CalendarRange size={16} className="text-gold" />
              <span className="text-sm text-white/60">5 Yıllık Tahmini Getiri</span>
            </div>
            <p className="text-3xl font-serif text-gold">{formatCurrency(fiveYearIncome)}</p>
          </div>
        </div>

        <p className="text-xs text-white/30 mt-6 leading-relaxed">{t('disclaimer')}</p>
      </div>
    </div>
  );
}
