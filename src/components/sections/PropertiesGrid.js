'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { MapPin, BedDouble, Maximize2, ArrowRight } from 'lucide-react';
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
  const [live, setLive] = useState(null);

  useEffect(() => {
    let off = false;
    fetchListings({ limit: 120 }).then((rows) => { if (!off) setLive(rows); });
    return () => { off = true; };
  }, []);

  if (live === null) {
    return <div className="py-24 text-center text-text-muted">{tl('loading')}</div>;
  }

  const items = live.length
    ? live.map((p) => ({
        id: p.id,
        title: listingTitle(p, locale),
        location: listingLocation(p),
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
        price: s.price,
        rooms: s.rooms,
        sqm: s.sqm,
        badge: s.badge,
        image: s.image,
        href: null,
      }));

  return (
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
  );
}
