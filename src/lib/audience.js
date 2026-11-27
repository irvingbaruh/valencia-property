'use client';
import { useEffect, useState } from 'react';

// "Turkish audience": Turkish-language site, Turkish browser language or time zone, or an IP address in Türkiye.
// The IP check is a last resort (a tiny first-party function that returns only the country code) and is cached per session.
const FN = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/geo`;
const KEY = 'll_cc';
let pending = null;

function quickTurkish() {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz === 'Europe/Istanbul' || tz === 'Asia/Istanbul') return true;
    return (navigator.languages || [navigator.language]).some((l) => /^tr(-|$)/i.test(l || ''));
  } catch { return false; }
}

function lookupCountry() {
  try { const c = sessionStorage.getItem(KEY); if (c) return Promise.resolve(c); } catch {}
  if (!pending) {
    pending = fetch(FN).then((r) => r.json()).then((d) => {
      const cc = String((d && d.country) || '').toUpperCase();
      if (cc) { try { sessionStorage.setItem(KEY, cc); } catch {} }
      return cc;
    }).catch(() => '').finally(() => { pending = null; });
  }
  return pending;
}

export function useTurkishAudience(locale) {
  const [turkish, setTurkish] = useState(locale === 'tr');
  useEffect(() => {
    if (locale === 'tr' || quickTurkish()) { setTurkish(true); return undefined; }
    let off = false;
    lookupCountry().then((cc) => { if (!off) setTurkish(cc === 'TR'); });
    return () => { off = true; };
  }, [locale]);
  return turkish;
}
