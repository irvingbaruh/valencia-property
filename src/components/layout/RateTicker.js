'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { TrendingUp, TrendingDown } from 'lucide-react';

// ECB reference rates through Frankfurter (free, no key, browser-friendly). Daily values, updated on bank days.
const API = 'https://api.frankfurter.dev/v1';
const CACHE_KEY = 'll_rates_v1';
const CACHE_MS = 60 * 60 * 1000;

const pad = (n) => String(n).padStart(2, '0');
const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

async function loadRates() {
  try {
    const c = JSON.parse(sessionStorage.getItem(CACHE_KEY) || 'null');
    if (c && Date.now() - c.t < CACHE_MS) return c.data;
  } catch (_) { /* storage unavailable */ }
  const from = new Date(Date.now() - 9 * 86400000);
  const res = await fetch(`${API}/${iso(from)}..?base=EUR&symbols=TRY,USD,GBP`);
  if (!res.ok) throw new Error('rates');
  const j = await res.json();
  const days = Object.keys(j.rates).sort();
  const last = days[days.length - 1];
  const prev = days[days.length - 2];
  const data = { date: last, now: j.rates[last], prev: prev ? j.rates[prev] : null };
  try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), data })); } catch (_) { /* ignore */ }
  return data;
}

// Pair value from EUR-based rates: EUR/XXX = r[XXX]; USD/TRY = r.TRY / r.USD
const pairs = (r, showTry) => {
  const list = [];
  if (showTry) {
    list.push({ id: 'EUR/TRY', v: r.TRY, d: 2 });
    list.push({ id: 'USD/TRY', v: r.TRY / r.USD, d: 2 });
  }
  list.push({ id: 'EUR/USD', v: r.USD, d: 4 });
  list.push({ id: 'EUR/GBP', v: r.GBP, d: 4 });
  return list;
};

export default function RateTicker({ scrolled }) {
  const locale = useLocale();
  const t = useTranslations('rates');
  const [data, setData] = useState(null);

  useEffect(() => {
    let off = false;
    loadRates().then((d) => { if (!off) setData(d); }).catch(() => {});
    return () => { off = true; };
  }, []);

  if (!data) return null;
  const showTry = locale === 'tr'; // the lira rates are shown on the Turkish site only
  const now = pairs(data.now, showTry);
  const prev = data.prev ? pairs(data.prev, showTry) : null;
  const loc = { tr: 'tr-TR', es: 'es-ES', en: 'en-GB', de: 'de-DE' }[locale] || 'en-GB';
  const dateLabel = new Date(data.date + 'T12:00:00').toLocaleDateString(loc, { day: 'numeric', month: 'short' });

  return (
    <div
      className={`overflow-hidden transition-all duration-300 border-b border-white/10 ${scrolled ? 'max-h-0 opacity-0' : 'max-h-10 opacity-100'}`}
      aria-label={t('label')}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-8 flex items-center gap-5 text-[11px] sm:text-xs text-white/75 whitespace-nowrap overflow-x-auto">
        {now.map((p, i) => {
          const up = prev ? p.v >= prev[i].v : null;
          return (
            <span key={p.id} className="inline-flex items-center gap-1.5">
              <span className="text-white/50">{p.id}</span>
              <span className="text-white font-medium tabular-nums">{p.v.toLocaleString(loc, { minimumFractionDigits: p.d, maximumFractionDigits: p.d })}</span>
              {up === null ? null : up ? <TrendingUp size={12} className="text-emerald-400" /> : <TrendingDown size={12} className="text-red-400" />}
            </span>
          );
        })}
        <span className="ml-auto text-white/40 hidden sm:inline">{t('source', { date: dateLabel })}</span>
      </div>
    </div>
  );
}
