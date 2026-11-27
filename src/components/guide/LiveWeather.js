'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { Sun, CloudSun, Cloud, CloudFog, CloudDrizzle, CloudRain, CloudSnow, CloudLightning } from 'lucide-react';

// Current temperature in Valencia and Alicante from Open-Meteo (free, no key). Cached for 15 minutes per visitor.
const URL = 'https://api.open-meteo.com/v1/forecast?latitude=39.47,38.35&longitude=-0.38,-0.48&current=temperature_2m,weather_code&timezone=Europe%2FMadrid';
const KEY = 'll_wx';
const TTL = 15 * 60 * 1000;

const L = (tr, es, en, de) => ({ tr, es, en, de });
const TXT = {
  title: L('Şu an hava', 'El tiempo ahora', 'Weather right now', 'Wetter jetzt'),
  cities: [L('Valencia', 'Valencia', 'Valencia', 'Valencia'), L('Alicante', 'Alicante', 'Alicante', 'Alicante')],
};
const COND = (code) => {
  if (code === 0) return [Sun, L('Açık', 'Despejado', 'Clear', 'Klar')];
  if (code <= 2) return [CloudSun, L('Parçalı bulutlu', 'Parcialmente nublado', 'Partly cloudy', 'Teils bewölkt')];
  if (code === 3) return [Cloud, L('Bulutlu', 'Nublado', 'Cloudy', 'Bewölkt')];
  if (code <= 48) return [CloudFog, L('Sisli', 'Niebla', 'Fog', 'Nebel')];
  if (code <= 57) return [CloudDrizzle, L('Çiseleme', 'Llovizna', 'Drizzle', 'Nieselregen')];
  if (code <= 67 || (code >= 80 && code <= 82)) return [CloudRain, L('Yağmurlu', 'Lluvia', 'Rain', 'Regen')];
  if (code <= 77 || (code >= 85 && code <= 86)) return [CloudSnow, L('Karlı', 'Nieve', 'Snow', 'Schnee')];
  return [CloudLightning, L('Fırtına', 'Tormenta', 'Storm', 'Gewitter')];
};

export default function LiveWeather() {
  const locale = useLocale();
  const [data, setData] = useState(null);
  useEffect(() => {
    let off = false;
    try {
      const c = JSON.parse(sessionStorage.getItem(KEY) || 'null');
      if (c && Date.now() - c.at < TTL) { setData(c.d); return undefined; }
    } catch {}
    fetch(URL).then((r) => r.json()).then((j) => {
      const list = Array.isArray(j) ? j : [];
      const d = list.map((x) => ({ t: x.current && x.current.temperature_2m, c: x.current && x.current.weather_code }));
      if (d.length === 2 && d.every((x) => typeof x.t === 'number')) {
        try { sessionStorage.setItem(KEY, JSON.stringify({ at: Date.now(), d })); } catch {}
        if (!off) setData(d);
      }
    }).catch(() => {});
    return () => { off = true; };
  }, []);
  if (!data) return null; // nothing to show until (or unless) the live numbers arrive
  return (
    <div className="rounded-2xl bg-white border border-border p-4 sm:p-5">
      <p className="text-sm text-text-muted mb-3">{TXT.title[locale] || TXT.title.tr}</p>
      <div className="grid grid-cols-2 gap-4">
        {data.map((x, i) => {
          const [Icon, label] = COND(x.c);
          return (
            <div key={i} className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gold/15 text-gold shrink-0"><Icon size={22} /></span>
              <div>
                <p className="font-serif text-2xl text-dark leading-none">{Math.round(x.t)}°C</p>
                <p className="text-sm text-text-muted mt-1">{TXT.cities[i][locale] || TXT.cities[i].tr} · {label[locale] || label.tr}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
