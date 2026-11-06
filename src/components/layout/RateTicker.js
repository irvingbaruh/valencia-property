'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { TrendingUp, TrendingDown } from 'lucide-react';

// Currencies: ECB reference rates via Frankfurter (daily). Gold: gold-api.com (spot, USD/oz). Bitcoin: CoinGecko (USD, 24h change).
// All free, key-less and browser-friendly. Each source is optional: if one fails its items are simply left out.
const FX = 'https://api.frankfurter.dev/v1';
const CACHE_KEY = 'll_rates_v2';
const CACHE_MS = 30 * 60 * 1000;

const pad = (n) => String(n).padStart(2, '0');
const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const safe = async (fn) => { try { return await fn(); } catch (_) { return null; } };

async function loadFx() {
  const from = new Date(Date.now() - 9 * 86400000);
  const res = await fetch(`${FX}/${iso(from)}..?base=EUR&symbols=TRY,USD,GBP,JPY,CNY`);
  if (!res.ok) throw new Error('fx');
  const j = await res.json();
  const days = Object.keys(j.rates).sort();
  const last = days[days.length - 1];
  const prev = days[days.length - 2];
  return { date: last, now: j.rates[last], prev: prev ? j.rates[prev] : null };
}
async function loadGold() {
  const r = await fetch('https://api.gold-api.com/price/XAU');
  if (!r.ok) throw new Error('gold');
  return (await r.json()).price;
}
async function loadBtc() {
  const r = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true');
  if (!r.ok) throw new Error('btc');
  const j = (await r.json()).bitcoin;
  return { price: j.usd, change: j.usd_24h_change };
}

async function loadAll() {
  try {
    const c = JSON.parse(sessionStorage.getItem(CACHE_KEY) || 'null');
    if (c && Date.now() - c.t < CACHE_MS) return c.data;
  } catch (_) { /* storage unavailable */ }
  const [fx, gold, btc] = await Promise.all([safe(loadFx), safe(loadGold), safe(loadBtc)]);
  if (!fx && !gold && !btc) throw new Error('rates');
  const data = { fx, gold, btc };
  try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), data })); } catch (_) { /* ignore */ }
  return data;
}

function buildItems(data, showTry, t) {
  const items = [];
  if (data.fx) {
    const { now: r, prev: p } = data.fx;
    const pv = (f) => (p ? f(p) : null);
    if (showTry) {
      items.push({ id: 'EUR/TRY', v: r.TRY, p: pv((x) => x.TRY), d: 2 });
      items.push({ id: 'USD/TRY', v: r.TRY / r.USD, p: pv((x) => x.TRY / x.USD), d: 2 });
    }
    items.push({ id: 'EUR/USD', v: r.USD, p: pv((x) => x.USD), d: 4 });
    items.push({ id: 'EUR/GBP', v: r.GBP, p: pv((x) => x.GBP), d: 4 });
    items.push({ id: 'EUR/JPY', v: r.JPY, p: pv((x) => x.JPY), d: 2 });
    items.push({ id: 'EUR/CNY', v: r.CNY, p: pv((x) => x.CNY), d: 3 });
  }
  if (data.gold) items.push({ id: t('gold'), v: data.gold, p: null, d: 0, pre: '$' });
  if (data.btc) items.push({ id: 'Bitcoin', v: data.btc.price, p: null, change: data.btc.change, d: 0, pre: '$' });
  return items;
}

export default function RateTicker({ scrolled }) {
  const locale = useLocale();
  const t = useTranslations('rates');
  const [data, setData] = useState(null);

  useEffect(() => {
    let off = false;
    loadAll().then((d) => { if (!off) setData(d); }).catch(() => {});
    return () => { off = true; };
  }, []);

  if (!data) return null;
  const items = buildItems(data, locale === 'tr', t);
  if (!items.length) return null;
  const loc = { tr: 'tr-TR', es: 'es-ES', en: 'en-GB', de: 'de-DE' }[locale] || 'en-GB';

  const row = items.map((p) => {
    const up = p.change != null ? p.change >= 0 : p.p != null ? p.v >= p.p : null;
    return (
      <span key={p.id} className="inline-flex items-center gap-2 px-6">
        <span className="text-[#C9A84C] font-medium">{p.id}</span>
        <span className="text-white font-semibold tabular-nums">
          {p.pre || ''}{p.v.toLocaleString(loc, { minimumFractionDigits: p.d, maximumFractionDigits: p.d })}
        </span>
        {up === null ? null : up ? <TrendingUp size={14} className="text-emerald-400" /> : <TrendingDown size={14} className="text-red-400" />}
      </span>
    );
  });

  return (
    <div
      className={`overflow-hidden transition-all duration-300 bg-[#0B0B11] border-b border-[#C9A84C]/30 ${scrolled ? 'max-h-0 opacity-0' : 'max-h-11 opacity-100'}`}
      role="region"
      aria-label={t('label')}
      title={t('source')}
    >
      <div className="h-10 flex items-center text-[13px] sm:text-sm whitespace-nowrap">
        <div className="ll-marquee">
          <div className="flex items-center">{row}</div>
          <div className="flex items-center" aria-hidden="true">{row}</div>
        </div>
      </div>
    </div>
  );
}
