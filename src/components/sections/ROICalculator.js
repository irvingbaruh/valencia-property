'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Calculator, TrendingUp, Wallet, ArrowRight } from 'lucide-react';
import ScrollReveal from '@/components/ui/ScrollReveal';
import { useRoiData, computeROI } from '@/lib/roi';
import { roiText } from '@/lib/roiText';
import { localePath } from '@/lib/routes';

export default function ROICalculator() {
  const t = useTranslations('roi');
  const locale = useLocale();
  const [budget, setBudget] = useState(200000);
  const tx = roiText(locale);
  const { data } = useRoiData();

  // Same model as the detailed calculator: cash purchase, long-term rental, Valencia average, non-EU non-resident
  const r = computeROI(
    { price: budget, districtSlug: 'valencia-ortalama', taxStatus: 'noneu', strategy: 'long', financing: 'cash' },
    data
  );
  const annualReturn = r.netOperating;
  const monthlyIncome = r.netOperating / 12;

  const formatCurrency = (n) =>
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);

  return (
    <section id="calculator" className="section-padding bg-band">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Calculator */}
          <ScrollReveal from="left">
            <div className="accent-line mb-4" />
            <h2 className="text-3xl md:text-4xl font-serif text-dark mb-3">
              {t('title')}
            </h2>
            <p className="text-text-secondary mb-8">
              {t('subtitle')}
            </p>

            <div className="space-y-6">
              {/* Budget Slider */}
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

              <p className="text-xs text-text-muted leading-relaxed">{tx.simpleNote}</p>
            </div>
          </ScrollReveal>

          {/* Right: Results */}
          <ScrollReveal from="right" delay={0.05}>
            <div className="bg-dark rounded-2xl p-8 text-white">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-gold/20 flex items-center justify-center">
                  <Calculator size={20} className="text-gold" />
                </div>
                <h3 className="font-serif text-lg">{t('title')}</h3>
              </div>

              <div className="space-y-6">
                <div className="bg-charcoal rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp size={16} className="text-gold" />
                    <span className="text-sm text-white/60">{tx.annualNet}</span>
                  </div>
                  <p className="text-3xl font-serif text-gold">{formatCurrency(annualReturn)}</p>
                  <p className="text-xs text-white/40 mt-1">{(r.netYield * 100).toFixed(1)}% · {tx.grossYield}: {(r.grossYield * 100).toFixed(1)}%</p>
                </div>

                <div className="bg-charcoal rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Wallet size={16} className="text-gold" />
                    <span className="text-sm text-white/60">{tx.monthlyNet}</span>
                  </div>
                  <p className="text-3xl font-serif text-gold">{formatCurrency(monthlyIncome)}</p>
                </div>
              </div>

              <p className="text-xs text-white/30 mt-6 leading-relaxed">
                {tx.disclaimer}
              </p>

              <a
                href={localePath(locale, 'roi-hesaplama')}
                className="mt-6 w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-gold text-dark font-semibold rounded-xl hover:bg-gold-hover transition-colors duration-200 group"
              >
                {tx.simpleCta}
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-200" />
              </a>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
