'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { MapPin, BedDouble, Maximize2, ArrowRight, SlidersHorizontal } from 'lucide-react';
import ScrollReveal from '@/components/ui/ScrollReveal';
import FavoriteButton from '@/components/ui/FavoriteButton';
import { propertyTitle } from '@/lib/propertyText';
import {
  fetchListings, listingTitle, listingCover, listingLocation, formatPrice, listingHref,
} from '@/lib/listings';

// Grid for /mulkler: live listings from Supabase; the sample cards stay only until the first listing is published.
export default function PropertiesGrid({ samples }) {
  const t = useTranslations('properties');
  const tType = useTranslations('propertyType');
  const tl = useTranslations('listing');
  const locale = useLocale();
  const tf = useTranslations('listingFilters');
  const [live, setLive] = useState(null);
  const [f, setF] = useState({ type: '', rooms: '', place: '', priceMin: '', priceMax: '', sqmMin: '', sqmMax: '', sort: 'new' });
  const set = (k) => (e) => setF((o) => ({ ...o, [k]: e.target.value }));

  useEffect(() => {
    let off = false;
    fetchListings({ limit: 120 }).then((rows) => { if (!off) setLive(rows); });
    return () => { off = true; };
  }, []);

  if (live === null) {
    return <div className="py-24 text-center text-text-muted">{tl('loading')}</div>;
  }

  const isLive = live.length > 0;
  const all = isLive
    ? live.map((p) => ({
        id: p.id,
        title: listingTitle(p, locale),
        location: listingLocation(p),
        place: p.neighborhood || p.city || '',
        type: p.property_type || '',
        priceNum: p.price == null ? null : Number(p.price),
        price: formatPrice(p.price, p.currency, locale),
        rooms: p.bedrooms,
        sqm: p.area_sqm,
        badge: p.is_featured ? 'premium' : 'new',
        image: listingCover(p),
        href: listingHref(locale, p.id),
      }))
    : samples.map((s) => ({
        id: s.id,
        title: propertyTitle(s, tType, locale),
        location: s.location,
        place: s.hood || '',
        type: s.type || '',
        priceNum: Number(String(s.price).replace(/[^0-9]/g, '')) || null,
        price: s.price,
        rooms: s.rooms,
        sqm: s.sqm,
        badge: s.badge,
        image: s.image,
        href: null,
      }));

  const types = [...new Set(all.map((x) => x.type).filter(Boolean))];
  const places = [...new Set(all.map((x) => x.place).filter(Boolean))].sort((a, b) => a.localeCompare(b, locale));
  const num = (v) => (v === '' ? null : Number(v));
  const pMin = num(f.priceMin), pMax = num(f.priceMax), sMin = num(f.sqmMin), sMax = num(f.sqmMax);
  const items = all
    .filter((x) =>
      (!f.type || x.type === f.type) &&
      (!f.place || x.place === f.place) &&
      (!f.rooms || (f.rooms === '4' ? Number(x.rooms) >= 4 : Number(x.rooms) === Number(f.rooms))) &&
      (pMin == null || (x.priceNum != null && x.priceNum >= pMin)) &&
      (pMax == null || (x.priceNum != null && x.priceNum <= pMax)) &&
      (sMin == null || (x.sqm != null && Number(x.sqm) >= sMin)) &&
      (sMax == null || (x.sqm != null && Number(x.sqm) <= sMax))
    )
    .sort((a, b) => {
      if (f.sort === 'priceAsc') return (a.priceNum ?? Infinity) - (b.priceNum ?? Infinity);
      if (f.sort === 'priceDesc') return (b.priceNum ?? -1) - (a.priceNum ?? -1);
      if (f.sort === 'sqm') return (Number(b.sqm) || 0) - (Number(a.sqm) || 0);
      return 0;
    });
  const dirty = Object.entries(f).some(([k, v]) => k !== 'sort' && v !== '');
  const field = 'w-full px-3 py-2.5 rounded-lg border border-border bg-white text-sm text-dark focus:outline-none focus:border-gold';
  const label = 'block text-xs font-semibold text-dark mb-1.5';

  return (
    <>
    <div className="dark-card rounded-2xl border border-white/10 p-5 sm:p-6 mb-10">
      <div className="flex items-center gap-2 mb-4 text-white">
        <SlidersHorizontal size={16} className="text-gold" />
        <h2 className="font-serif text-xl">{tf('title')}</h2>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div>
          <label className={label}>{tf('type')}</label>
          <select value={f.type} onChange={set('type')} className={field}>
            <option value="">{tf('all')}</option>
            {types.map((k) => <option key={k} value={k}>{tType.has(k) ? tType(k) : k}</option>)}
          </select>
        </div>
        <div>
          <label className={label}>{tf('rooms')}</label>
          <select value={f.rooms} onChange={set('rooms')} className={field}>
            <option value="">{tf('any')}</option>
            {['1', '2', '3', '4'].map((n) => <option key={n} value={n}>{n === '4' ? '4+' : n}</option>)}
          </select>
        </div>
        <div className="col-span-2">
          <label className={label}>{tf('place')}</label>
          <select value={f.place} onChange={set('place')} className={field}>
            <option value="">{tf('allPlaces')}</option>
            {places.map((k) => <option key={k} value={k}>{k}</option>)}
          </select>
        </div>
        <div>
          <label className={label}>{tf('priceMin')}</label>
          <input type="number" min="0" step="10000" inputMode="numeric" value={f.priceMin} onChange={set('priceMin')} className={field} />
        </div>
        <div>
          <label className={label}>{tf('priceMax')}</label>
          <input type="number" min="0" step="10000" inputMode="numeric" value={f.priceMax} onChange={set('priceMax')} className={field} />
        </div>
        <div>
          <label className={label}>{tf('sqmMin')}</label>
          <input type="number" min="0" step="10" inputMode="numeric" value={f.sqmMin} onChange={set('sqmMin')} className={field} />
        </div>
        <div>
          <label className={label}>{tf('sqmMax')}</label>
          <input type="number" min="0" step="10" inputMode="numeric" value={f.sqmMax} onChange={set('sqmMax')} className={field} />
        </div>
      </div>
      <div className="flex flex-wrap items-end justify-between gap-3 mt-4">
        <p className="text-sm text-white"><span className="font-semibold text-gold">{items.length}</span> {tf('results')}</p>
        <div className="flex items-end gap-3">
          <div>
            <label className="sr-only">{tf('sort')}</label>
            <select value={f.sort} onChange={set('sort')} className={field + ' !w-auto'} aria-label={tf('sort')}>
              <option value="new">{tf('sortNew')}</option>
              <option value="priceAsc">{tf('sortPriceAsc')}</option>
              <option value="priceDesc">{tf('sortPriceDesc')}</option>
              <option value="sqm">{tf('sortSqm')}</option>
            </select>
          </div>
          {dirty && (
            <button type="button" onClick={() => setF({ type: '', rooms: '', place: '', priceMin: '', priceMax: '', sqmMin: '', sqmMax: '', sort: f.sort })} className="text-sm text-gold font-semibold hover:underline pb-2.5">
              {tf('reset')}
            </button>
          )}
        </div>
      </div>
    </div>

    {items.length === 0 && (
      <div className="dark-card rounded-2xl border border-white/10 p-10 text-center mb-20">
        <p className="text-white mb-2">{tf('none')}</p>
        <p className="text-white text-sm max-w-xl mx-auto">{tf('ctaNone')}</p>
      </div>
    )}

    <div className="grid sm:grid-cols-2 gap-8 lg:gap-10 mb-20">
      {items.map((property, i) => {
        const Wrap = property.href ? 'a' : 'div';
        return (
          <ScrollReveal key={property.id} delay={(i % 2) * 0.04}>
            <Wrap
              {...(property.href ? { href: property.href } : {})}
              className="group block dark-card rounded-2xl overflow-hidden border border-white/10 hover:border-gold/30 hover:shadow-card-hover transition-all duration-300 h-full flex flex-col"
            >
              <div className="relative h-72 sm:h-80 overflow-hidden bg-soft">
                {property.image ? (
                  <img
                    src={property.image}
                    alt={property.title}
                    loading="lazy"
                    className="w-full h-full object-cover origin-bottom-right scale-[1.25] group-hover:scale-[1.3] transition-transform duration-700 ease-out"
                  />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-dark/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <span className="absolute top-4 left-4 px-3 py-1.5 bg-gold text-dark text-xs font-semibold tracking-wide uppercase rounded-md shadow-gold">
                  {t(`badge_${property.badge}`)}
                </span>
                <FavoriteButton propertyId={property.id} className="absolute top-4 right-4 shadow-sm" />
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <h2 className="font-serif text-xl text-dark mb-2 group-hover:text-gold transition-colors duration-300">
                  {property.title}
                </h2>
                <div className="flex items-center gap-1.5 text-text-muted text-sm mb-4">
                  <MapPin size={14} className="text-gold" />
                  <span>{property.location}</span>
                </div>
                <div className="flex items-center gap-6 text-sm text-text-muted mb-5">
                  {property.rooms ? (
                    <span className="flex items-center gap-1.5">
                      <BedDouble size={15} className="text-gold/70" />
                      {property.rooms} {t('rooms')}
                    </span>
                  ) : null}
                  {property.sqm ? (
                    <span className="flex items-center gap-1.5">
                      <Maximize2 size={15} className="text-gold/70" />
                      {property.sqm} {t('sqm')}
                    </span>
                  ) : null}
                </div>
                <div className="mt-auto pt-5 border-t border-white/10 flex items-center justify-between">
                  <span className="text-2xl font-serif text-dark">{property.price}</span>
                  <span className="w-10 h-10 rounded-full border border-gold/30 flex items-center justify-center group-hover:bg-gold group-hover:border-gold transition-all duration-300">
                    <ArrowRight size={16} className="text-gold group-hover:text-white transition-colors duration-300" />
                  </span>
                </div>
              </div>
            </Wrap>
          </ScrollReveal>
        );
      })}
    </div>
    </>
  );
}
