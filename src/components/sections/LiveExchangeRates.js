'use client';

/*
 * LiveExchangeRates — fetches EUR base rates client-side from a free,
 * keyless API (open.er-api.com) at page load. Runs in the visitor's
 * browser, not in any build step, so it reflects the actual current rate.
 */

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { RefreshCw } from 'lucide-react';

const PAIRS = [
  { code: 'TRY', label: 'EUR / TRY' },
  { code: 'USD', label: 'EUR / USD' },
  { code: 'GBP', label: 'EUR / GBP' },
];

export default function LiveExchangeRates() {
  const t = useTranslations('roiPage');
  const [rates, setRates] = useState(null);
  const [status, setStatus] = useState('loading'); // loading | ok | error

  useEffect(() => {
    let cancelled = false;
    fetch('https://open.er-api.com/v6/latest/EUR')
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data?.rates) {
          setRates(data.rates);
          setStatus('ok');
        } else {
          setStatus('error');
        }
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="bg-white rounded-2xl border border-border p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-serif text-lg text-dark">{t('exchangeRatesTitle')}</h3>
        {status === 'loading' && <RefreshCw size={16} className="text-gold animate-spin" />}
      </div>

      {status === 'loading' && (
        <p className="text-sm text-text-muted">{t('exchangeRatesLoading')}</p>
      )}

      {status === 'error' && (
        <p className="text-sm text-text-muted">{t('exchangeRatesError')}</p>
      )}

      {status === 'ok' && rates && (
        <div className="grid grid-cols-3 gap-4">
          {PAIRS.map((pair) => (
            <div key={pair.code} className="text-center">
              <p className="text-xs text-text-muted mb-1">{pair.label}</p>
              <p className="text-xl font-serif text-gold">
                {rates[pair.code] ? rates[pair.code].toFixed(2) : '—'}
              </p>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-text-muted/70 mt-5">{t('exchangeRatesNote')}</p>
    </div>
  );
}
