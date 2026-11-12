'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, ArrowRight, MapPin, BedDouble, Bath, Maximize2, Trees, ChevronLeft, ChevronRight, X } from 'lucide-react';
import AppPromo from '@/components/app/AppPromo';
import FavoriteButton from '@/components/ui/FavoriteButton';
import { localePath } from '@/lib/routes';
import {
  fetchListing, listingTitle, listingDescription, listingImages, listingLocation, formatPrice, TYPE_KEYS,
} from '@/lib/listings';

function Lightbox({ images, index, onClose, onGo, alt }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft') onGo(-1);
      else if (e.key === 'ArrowRight') onGo(1);
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose, onGo]);

  const touchX = { current: null };
  const many = images.length > 1;
  const btn = 'absolute top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center backdrop-blur-sm transition-colors';
  return (
    <div
      className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        if (touchX.current == null || !many) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 50) onGo(dx < 0 ? 1 : -1);
        touchX.current = null;
      }}
    >
      <img
        src={images[index]}
        alt={alt}
        className="max-w-[94vw] max-h-[88vh] object-contain select-none"
        onClick={(e) => e.stopPropagation()}
      />
      <button type="button" onClick={(e) => { e.stopPropagation(); onClose(); }} aria-label="×" className="absolute top-4 right-4 w-11 h-11 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center backdrop-blur-sm transition-colors">
        <X size={22} />
      </button>
      {many && (
        <>
          <button type="button" onClick={(e) => { e.stopPropagation(); onGo(-1); }} aria-label="‹" className={`${btn} left-3 sm:left-6`}><ChevronLeft size={24} /></button>
          <button type="button" onClick={(e) => { e.stopPropagation(); onGo(1); }} aria-label="›" className={`${btn} right-3 sm:right-6`}><ChevronRight size={24} /></button>
          <span className="absolute bottom-5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-white/15 text-white text-sm backdrop-blur-sm">{index + 1} / {images.length}</span>
        </>
      )}
    </div>
  );
}

function Gallery({ images, alt, noPhoto }) {
  const [i, setI] = useState(0);
  const [open, setOpen] = useState(false);
  if (!images.length) {
    return <div className="aspect-[16/10] rounded-2xl bg-soft border border-white/10 flex items-center justify-center text-text-muted">{noPhoto}</div>;
  }
  const go = useCallback((d) => setI((v) => (v + d + images.length) % images.length), [images.length]);
  const close = useCallback(() => setOpen(false), []);
  return (
    <div>
      {open && <Lightbox images={images} index={i} onClose={close} onGo={go} alt={alt} />}
      <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-soft">
        <button type="button" onClick={() => setOpen(true)} aria-label={alt} className="block w-full h-full cursor-zoom-in">
          <img src={images[i]} alt={alt} className="w-full h-full object-cover" />
        </button>
        {images.length > 1 && (
          <>
            <button type="button" onClick={() => go(-1)} aria-label="‹" className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow flex items-center justify-center">
              <ChevronLeft size={18} />
            </button>
            <button type="button" onClick={() => go(1)} aria-label="›" className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow flex items-center justify-center">
              <ChevronRight size={18} />
            </button>
            <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-dark/70 text-white text-xs">{i + 1} / {images.length}</span>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div className="mt-3 grid grid-cols-5 sm:grid-cols-6 gap-2">
          {images.map((src, n) => (
            <button key={src + n} type="button" onClick={() => setI(n)} className={`aspect-[4/3] rounded-lg overflow-hidden border-2 ${n === i ? 'border-gold' : 'border-transparent opacity-80 hover:opacity-100'}`}>
              <img src={src} alt="" loading="lazy" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Detail() {
  const locale = useLocale();
  const t = useTranslations('listing');
  const tType = useTranslations('propertyType');
  const id = useSearchParams().get('id');
  const [p, setP] = useState(null);
  const [state, setState] = useState('loading');

  useEffect(() => {
    let off = false;
    if (!id) { setState('missing'); return; }
    fetchListing(id).then((row) => {
      if (off) return;
      if (row) { setP(row); setState('ok'); } else setState('missing');
    });
    return () => { off = true; };
  }, [id]);

  const back = localePath(locale, 'mulkler');
  if (state === 'loading') {
    return <div className="bg-soft min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" /></div>;
  }
  if (state === 'missing') {
    return (
      <div className="bg-soft min-h-[60vh] flex flex-col items-center justify-center gap-5 px-4 text-center">
        <p className="text-lg text-text-muted">{t('notFound')}</p>
        <a href={back} className="inline-flex items-center gap-2 text-gold font-medium hover:underline"><ArrowLeft size={16} />{t('back')}</a>
      </div>
    );
  }

  const title = listingTitle(p, locale);
  const desc = listingDescription(p, locale);
  const imgs = listingImages(p);
  const typeLabel = TYPE_KEYS[p.property_type] ? tType(TYPE_KEYS[p.property_type]) : '';
  const facts = [
    p.bedrooms ? { icon: BedDouble, label: t('bedrooms'), value: p.bedrooms } : null,
    p.bathrooms ? { icon: Bath, label: t('bathrooms'), value: p.bathrooms } : null,
    p.area_sqm ? { icon: Maximize2, label: t('area'), value: `${p.area_sqm} m²` } : null,
    p.land_sqm ? { icon: Trees, label: t('plot'), value: `${p.land_sqm} m²` } : null,
  ].filter(Boolean);

  return (
    <div className="bg-soft">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-40 pb-10 lg:pb-14">
        <a href={back} className="inline-flex items-center gap-2 text-gold font-medium hover:underline mb-6"><ArrowLeft size={16} />{t('back')}</a>
        <div className="grid lg:grid-cols-[1fr_380px] gap-8 lg:gap-12 items-start">
          <div>
            <Gallery images={imgs} alt={title} noPhoto={t('photo')} />
            <h1 className="font-serif text-3xl sm:text-4xl text-dark mt-8 mb-3">{title}</h1>
            <div className="flex items-center gap-1.5 text-text-muted mb-8">
              <MapPin size={16} className="text-gold" />
              <span>{listingLocation(p)}</span>
              {typeLabel ? <span className="ml-3 px-2.5 py-0.5 rounded-full bg-gold-light text-dark text-xs">{typeLabel}</span> : null}
            </div>
            {desc ? (
              <div>
                <h2 className="font-serif text-xl text-dark mb-3">{t('description')}</h2>
                <p className="text-text-muted leading-relaxed whitespace-pre-line max-w-prose">{desc}</p>
              </div>
            ) : null}
          </div>

          <aside className="lg:sticky lg:top-28 dark-card rounded-2xl border border-white/10 p-6 shadow-card">
            <div className="text-sm text-text-muted mb-1">{t('price')}</div>
            <div className="flex items-start justify-between gap-3 mb-1">
              <div className="text-3xl font-serif text-dark">{formatPrice(p.price, p.currency, locale)}</div>
              <FavoriteButton propertyId={p.id} className="shadow-sm" />
            </div>
            {p.price && p.area_sqm ? (
              <div className="text-xs text-text-muted mb-5">{t('perSqm')}: {formatPrice(Math.round(p.price / p.area_sqm), p.currency, locale)}</div>
            ) : <div className="mb-5" />}
            {facts.length ? (
              <dl className="grid grid-cols-2 gap-4 py-5 border-t border-b border-white/10 mb-5">
                {facts.map((f) => (
                  <div key={f.label}>
                    <dt className="flex items-center gap-1.5 text-xs text-text-muted"><f.icon size={14} className="text-gold" />{f.label}</dt>
                    <dd className="text-dark font-medium mt-0.5">{f.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
            <h3 className="font-serif text-lg text-dark mb-1">{t('contactTitle')}</h3>
            <p className="text-sm text-text-muted mb-4">{t('contactText')}</p>
            <a href={localePath(locale, 'iletisim')} className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gold text-dark font-semibold rounded-xl hover:bg-gold-hover transition-all duration-200 shadow-gold group">
              {t('contactButton')}
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-200" />
            </a>
            <AppPromo variant="listing" />
            <p className="text-xs text-text-muted mt-4">{t('partner')}</p>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default function ListingDetailPage() {
  return (
    <Suspense fallback={<div className="bg-soft min-h-screen" />}>
      <Detail />
    </Suspense>
  );
}
