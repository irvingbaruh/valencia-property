'use client';

import FillImage from '@/components/ui/FillImage';
import { useEffect, useMemo, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { MapPin, BedDouble, Maximize2, ArrowRight, SlidersHorizontal, Search, Bell, Check, Lock } from 'lucide-react';
import { PROVINCES, ZONES, norm, matchPlace, placeSlug, provinceFromRegion } from '@/lib/areas';
import ScrollReveal from '@/components/ui/ScrollReveal';
import { useAuth } from '@/components/providers/AuthProvider';
import { gt } from '@/lib/growthText';
import { trackFunnel } from '@/lib/funnel';
import { createSavedSearch, describeFilters, stashSearch, takeStashedSearch, MAX_SEARCHES } from '@/lib/savedSearches';
import { localePath } from '@/lib/routes';
import FavoriteButton from '@/components/ui/FavoriteButton';
import { propertyTitle } from '@/lib/propertyText';
import {
  fetchListings, fetchGateSummary, listingTitle, listingCover, listingLocation, formatPrice, listingHref,
} from '@/lib/listings';

// Grid for /mulkler: live listings from Supabase; the sample cards stay only until the first listing is published.
// Visitors who are not signed in see this many listings; members see all of them.

const EMPTY = {
  q: '', province: '', area: '', type: '', beds: '', baths: '',
  priceMin: '', priceMax: '', sqmMin: '', sqmMax: '', plotMin: '', newBuild: false, sort: 'new',
};

// Counts one "gate shown" in the signup funnel each time the limit card appears.
function GateSeen({ n }) {
  useEffect(() => { trackFunnel('gate_view', String(n)); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

export default function PropertiesGrid({ samples }) {
  const tType = useTranslations('propertyType');
  const tl = useTranslations('listing');
  const locale = useLocale();
  const tf = useTranslations('listingFilters');
  const t = useTranslations('properties');
  const g = gt(locale);
  const { user, loading: authLoading } = useAuth();
  const [live, setLive] = useState(null);
  const [f, setF] = useState(EMPTY);
  const [saveState, setSaveState] = useState(null); // null | 'saving' | 'saved' | 'limit' | 'error'
  const [needsPush, setNeedsPush] = useState(false);
  const set = (k) => (e) => setF((o) => ({ ...o, [k]: e.target.value }));
  const setProvince = (e) => setF((o) => ({ ...o, province: e.target.value, area: '' }));

  // "Open search" in the member panel lands here with that search's filters
  useEffect(() => {
    const stashed = takeStashedSearch();
    if (stashed) setF({ ...EMPTY, ...stashed });
  }, []);

  const [gate, setGate] = useState(null);
  // The server decides what a visitor may see (members get every listing), so reload once we know who is signed in.
  useEffect(() => {
    if (authLoading) return;
    let off = false;
    fetchListings({ limit: 200 }).then((rows) => { if (!off) setLive(rows); });
    if (!user) fetchGateSummary().then((x) => { if (!off) setGate(x); }); else setGate(null);
    return () => { off = true; };
  }, [authLoading, user?.id]);

  const isLive = !!live && live.length > 0;

  const all = useMemo(() => {
    if (live === null) return [];
    const enrich = (x, city, hood, region) => {
      const hit = matchPlace(city, hood);
      const year = (x.features || []).map((v) => String(v).match(/(\d{4})/)).find(Boolean);
      return {
        ...x,
        placeSlug: hit ? hit.slug : '',
        province: hit ? hit.province : provinceFromRegion(region),
        year: year ? Number(year[1]) : null,
        searchText: norm([x.title, x.location, hood, city].join(' ')),
      };
    };
    if (live.length) {
      return live.map((p) => enrich({
        id: p.id,
        title: listingTitle(p, locale),
        location: listingLocation(p),
        type: p.property_type || '',
        priceNum: p.price == null ? null : Number(p.price),
        price: formatPrice(p.price, p.currency, locale),
        rooms: p.bedrooms,
        baths: p.bathrooms,
        sqm: p.area_sqm,
        plot: p.land_sqm,
        features: p.features,
        badge: p.is_featured ? 'premium' : 'new',
        image: listingCover(p),
        href: listingHref(locale, p.id),
        cityRaw: p.city,
      }, p.city, p.neighborhood, p.region));
    }
    return samples.map((s0) => enrich({
      id: s0.id,
      title: propertyTitle(s0, tType, locale),
      location: s0.location,
      type: s0.type || '',
      priceNum: Number(String(s0.price).replace(/[^0-9]/g, '')) || null,
      price: s0.price,
      rooms: s0.rooms,
      baths: null,
      sqm: s0.sqm,
      plot: null,
      features: [],
      badge: s0.badge,
      image: s0.image,
      href: null,
      cityRaw: String(s0.location || '').split(',').pop().trim(),
    }, String(s0.location || '').split(',').pop().trim(), s0.hood, ''));
  }, [live, samples, locale, tType]);

  if (live === null) {
    return <div className="py-24 text-center text-text-muted">{tl('loading')}</div>;
  }

  // Area list: every known place of the chosen province(s), plus any listing city we do not know yet.
  const counts = {};
  all.forEach((x) => { if (x.placeSlug) counts[x.placeSlug] = (counts[x.placeSlug] || 0) + 1; });
  const unknown = [...new Map(all.filter((x) => !x.placeSlug && x.cityRaw).map((x) => [norm(x.cityRaw), x])).values()];
  const zones = ZONES.filter((z) => !f.province || z.province === f.province);
  const provCount = (k) => all.filter((x) => x.province === k).length;

  const types = [...new Set(all.map((x) => x.type).filter(Boolean))];
  const num = (v) => (v === '' ? null : Number(v));
  const pMin = num(f.priceMin), pMax = num(f.priceMax), sMin = num(f.sqmMin), sMax = num(f.sqmMax), plMin = num(f.plotMin);
  const qn = norm(f.q);
  const items = all
    .filter((x) =>
      (!f.province || x.province === f.province) &&
      (!f.area || x.placeSlug === f.area || (f.area.startsWith('?') && norm(x.cityRaw) === f.area.slice(1))) &&
      (!f.type || x.type === f.type) &&
      (!f.beds || Number(x.rooms) >= Number(f.beds)) &&
      (!f.baths || Number(x.baths) >= Number(f.baths)) &&
      (pMin == null || (x.priceNum != null && x.priceNum >= pMin)) &&
      (pMax == null || (x.priceNum != null && x.priceNum <= pMax)) &&
      (sMin == null || (x.sqm != null && Number(x.sqm) >= sMin)) &&
      (sMax == null || (x.sqm != null && Number(x.sqm) <= sMax)) &&
      (plMin == null || (x.plot != null && Number(x.plot) >= plMin)) &&
      (!f.newBuild || (x.year != null && x.year >= 2024)) &&
      (!qn || x.searchText.includes(qn))
    )
    .sort((a, b) => {
      const sqmPrice = (x) => (x.priceNum && Number(x.sqm) ? x.priceNum / Number(x.sqm) : Infinity);
      if (f.sort === 'priceAsc') return (a.priceNum ?? Infinity) - (b.priceNum ?? Infinity);
      if (f.sort === 'priceDesc') return (b.priceNum ?? -1) - (a.priceNum ?? -1);
      if (f.sort === 'sqm') return (Number(b.sqm) || 0) - (Number(a.sqm) || 0);
      if (f.sort === 'sqmPrice') return sqmPrice(a) - sqmPrice(b);
      // default order: featured first, then newest (the list already arrives newest first)
      return (b.badge === 'premium') - (a.badge === 'premium');
    });
  const dirty = JSON.stringify({ ...f, sort: '' }) !== JSON.stringify({ ...EMPTY, sort: '' });

  // Listing limit for visitors. While we still do not know if someone is signed in, show the limited list without the gate card.
  const limited = isLive && !user && !!gate && gate.hidden > 0;
  const visible = items;
  const gateReady = limited && !authLoading;
  const hiddenCount = gate ? gate.hidden : 0;
  const hiddenPrices = gate ? gate.prices : [];
  const eur0 = (n) => new Intl.NumberFormat({ tr: 'tr-TR', es: 'es-ES', en: 'en-GB', de: 'de-DE' }[locale] || 'en-GB', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
  const hiddenPlaces = [...new Set((gate ? gate.cities : []).map((c) => String(c || '').split(/[\/,]/)[0].trim()).filter(Boolean))].slice(0, 4);

  const typeLabel = (k) => (tType.has(k) ? tType(k) : k);
  const joinHref = (from) => `${localePath(locale, 'giris')}?mode=register&from=${from}`;
  const onSaveSearch = async () => {
    if (!user) {
      trackFunnel('invite_click', 'save_search');
      stashSearch(f);
      window.location.href = joinHref('save_search');
      return;
    }
    setSaveState('saving');
    const { error } = await createSavedSearch(user.id, f, describeFilters(f, locale, typeLabel));
    if (error) {
      setSaveState(/row-level security|42501/i.test(`${error.code} ${error.message}`) ? 'limit' : 'error');
      return;
    }
    trackFunnel('search_saved');
    setNeedsPush(typeof Notification === 'undefined' || Notification.permission !== 'granted');
    setSaveState('saved');
  };
  const field = 'w-full px-3 py-2.5 rounded-lg border border-border bg-white text-sm text-dark focus:outline-none focus:border-gold';
  const label = 'block text-xs font-semibold text-white mb-1.5';
  const zoneName = (z) => z.name[locale] || z.name.en;

  return (
    <>
    <div className="dark-card rounded-2xl border border-white/10 p-5 sm:p-6 mb-10">
      <div className="flex items-center gap-2 mb-4 text-white">
        <SlidersHorizontal size={16} className="text-gold" />
        <h2 className="font-serif text-xl">{tf('title')}</h2>
      </div>

      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input type="search" value={f.q} onChange={set('q')} placeholder={tf('keyword')} className={field + ' !pl-9'} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div>
          <label className={label}>{tf('province')}</label>
          <select value={f.province} onChange={setProvince} className={field}>
            <option value="">{tf('allProvinces')}</option>
            {PROVINCES.map((p) => <option key={p.key} value={p.key}>{p.name[locale] || p.name.en}{provCount(p.key) ? ` (${provCount(p.key)})` : ''}</option>)}
          </select>
        </div>
        <div className="col-span-2 lg:col-span-1">
          <label className={label}>{tf('place')}</label>
          <select value={f.area} onChange={set('area')} className={field}>
            <option value="">{tf('allPlaces')}</option>
            {zones.map((z) => (
              <optgroup key={z.key} label={zoneName(z)}>
                {z.places.map((pl) => {
                  const sl = placeSlug(pl);
                  return <option key={sl} value={sl}>{pl.name}{counts[sl] ? ` (${counts[sl]})` : ''}</option>;
                })}
              </optgroup>
            ))}
            {unknown.filter((x) => !f.province || x.province === f.province || !x.province).length > 0 && (
              <optgroup label={tf('otherPlaces')}>
                {unknown.filter((x) => !f.province || x.province === f.province || !x.province).map((x) => (
                  <option key={norm(x.cityRaw)} value={'?' + norm(x.cityRaw)}>{x.cityRaw}</option>
                ))}
              </optgroup>
            )}
          </select>
        </div>
        <div>
          <label className={label}>{tf('type')}</label>
          <select value={f.type} onChange={set('type')} className={field}>
            <option value="">{tf('all')}</option>
            {types.map((k) => <option key={k} value={k}>{tType.has(k) ? tType(k) : k}</option>)}
          </select>
        </div>
        <div>
          <label className={label}>{tf('rooms')}</label>
          <select value={f.beds} onChange={set('beds')} className={field}>
            <option value="">{tf('any')}</option>
            {['1', '2', '3', '4', '5'].map((n) => <option key={n} value={n}>{n}+</option>)}
          </select>
        </div>
        <div>
          <label className={label}>{tf('baths')}</label>
          <select value={f.baths} onChange={set('baths')} className={field}>
            <option value="">{tf('any')}</option>
            {['1', '2', '3', '4'].map((n) => <option key={n} value={n}>{n}+</option>)}
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
        <div>
          <label className={label}>{tf('plotMin')}</label>
          <input type="number" min="0" step="100" inputMode="numeric" value={f.plotMin} onChange={set('plotMin')} className={field} />
        </div>
        <label className="col-span-2 flex items-center gap-2 text-sm text-white self-end pb-2.5 cursor-pointer">
          <input type="checkbox" checked={f.newBuild} onChange={(e) => setF((o) => ({ ...o, newBuild: e.target.checked }))} className="w-4 h-4 accent-[#C9A84C]" />
          {tf('newBuild')}
        </label>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-3 mt-4">
        <p className="text-sm text-white"><span className="font-semibold text-gold">{items.length}</span> {tf('results')}</p>
        <div className="flex items-end gap-3">
          <select value={f.sort} onChange={set('sort')} className={field + ' !w-auto'} aria-label={tf('sort')}>
            <option value="new">{tf('sortNew')}</option>
            <option value="priceAsc">{tf('sortPriceAsc')}</option>
            <option value="priceDesc">{tf('sortPriceDesc')}</option>
            <option value="sqm">{tf('sortSqm')}</option>
            <option value="sqmPrice">{tf('sortSqmPrice')}</option>
          </select>
          {dirty && (
            <button type="button" onClick={() => { setF({ ...EMPTY, sort: f.sort }); setSaveState(null); }} className="text-sm text-gold font-semibold hover:underline pb-2.5">
              {tf('reset')}
            </button>
          )}
        </div>
      </div>

      {dirty && isLive && (
        <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onSaveSearch}
            disabled={saveState === 'saving' || saveState === 'saved'}
            className="inline-flex items-center gap-2 rounded-lg border border-gold text-gold px-4 py-2 text-sm font-semibold hover:bg-gold hover:text-dark transition-colors disabled:opacity-60"
          >
            {saveState === 'saved' ? <Check size={15} /> : <Bell size={15} />}
            {saveState === 'saved' ? g.saved.saved : !authLoading && !user ? g.saved.guest : g.saved.save}
          </button>
          {saveState === 'saved' && (
            <p className="text-sm text-white">
              {g.saved.hint}{' '}
              {needsPush && <a href={`${localePath(locale, 'panel')}?tab=settings`} className="text-gold font-semibold underline">{g.saved.pushLink}</a>}
            </p>
          )}
          {saveState === 'limit' && <p className="text-sm text-white">{g.saved.limit.replace('10', String(MAX_SEARCHES))}</p>}
          {saveState === 'error' && <p className="text-sm text-white">{g.saved.error}</p>}
        </div>
      )}
    </div>

    {items.length === 0 && (
      <div className="dark-card rounded-2xl border border-white/10 p-10 text-center mb-20">
        <p className="text-white mb-2">{tf('none')}</p>
        <p className="text-white text-sm max-w-xl mx-auto">{tf('ctaNone')}</p>
      </div>
    )}

    <div className={`grid sm:grid-cols-2 gap-8 lg:gap-10 ${gateReady ? 'mb-10' : 'mb-20'}`}>
      {visible.map((property, i) => {
        const Wrap = property.href ? 'a' : 'div';
        return (
          <ScrollReveal key={property.id} delay={(i % 2) * 0.04}>
            <Wrap
              {...(property.href ? { href: property.href } : {})}
              className="group block dark-card rounded-2xl overflow-hidden border border-white/10 hover:border-gold/30 hover:shadow-card-hover transition-all duration-300 h-full flex flex-col"
            >
              <div className="relative h-72 sm:h-80 overflow-hidden bg-soft">
                {property.image ? (
                  <FillImage
                    src={property.image}
                    alt={property.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
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
    {gateReady && (
      <div className="rounded-2xl border border-gold/40 bg-white p-6 sm:p-8 mb-20">
        <GateSeen n={items.length} />
        <div className="flex items-start gap-4">
          <Lock className="text-gold shrink-0 mt-1" size={26} />
          <div className="flex-1">
            <h2 className="font-serif text-2xl text-dark mb-1">{g.gate.title(visible.length, gate.total)}</h2>
            <p className="text-text-muted">{g.gate.text(hiddenCount)}</p>
            {hiddenPrices.length > 0 && (
              <p className="text-sm text-text-muted mt-2">
                {g.gate.peek(hiddenPlaces.join(', '), `${eur0(Math.min(...hiddenPrices))} – ${eur0(Math.max(...hiddenPrices))}`)}
              </p>
            )}
            <ul className="mt-5 grid sm:grid-cols-2 gap-x-6 gap-y-2">
              {g.gate.bullets.map((b) => (
                <li key={b} className="flex gap-2 text-sm text-dark"><Check className="w-4 h-4 text-gold shrink-0 mt-0.5" />{b}</li>
              ))}
            </ul>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a
                href={joinHref('gate')}
                onClick={() => trackFunnel('gate_click', 'join')}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gold text-dark font-semibold px-6 py-3 text-sm hover:bg-gold-hover transition-colors"
              >
                {g.gate.join}<ArrowRight size={15} />
              </a>
              <a
                href={`${localePath(locale, 'giris')}?from=gate`}
                onClick={() => trackFunnel('gate_click', 'login')}
                className="text-sm font-semibold text-gold hover:underline"
              >
                {g.gate.login}
              </a>
              <span className="text-xs text-text-muted">{g.gate.note}</span>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
