'use client';

import { useTranslations, useLocale } from 'next-intl';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { MapPin, BedDouble, Maximize2, ArrowRight } from 'lucide-react';

const listings = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=900&q=80&auto=format',
    location: 'El Carmen, Valencia',
    price: '€185.000',
    beds: 2,
    sqm: 78,
    tag: 'new',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=900&q=80&auto=format',
    location: 'Benimaclet, Valencia',
    price: '€145.000',
    beds: 3,
    sqm: 92,
    tag: 'new',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=900&q=80&auto=format',
    location: 'Ciutat Vella, Valencia',
    price: '€265.000',
    beds: 3,
    sqm: 110,
    tag: 'new',
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=900&q=80&auto=format',
    location: 'Poblats Marítims',
    price: '€198.000',
    beds: 2,
    sqm: 85,
    tag: 'new',
  },
  {
    id: 5,
    image: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=900&q=80&auto=format',
    location: 'Patraix, Valencia',
    price: '€155.000',
    beds: 2,
    sqm: 70,
    tag: 'new',
  },
  {
    id: 6,
    image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=900&q=80&auto=format',
    location: 'Extramurs, Valencia',
    price: '€220.000',
    beds: 4,
    sqm: 125,
    tag: 'new',
  },
];

function ListingCard({ listing, t }) {
  return (
    <motion.div
      className="flex-shrink-0 w-[340px] md:w-[420px] group cursor-pointer"
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-shadow duration-500 border border-border">
        {/* Image */}
        <div className="relative h-96 md:h-[432px] overflow-hidden">
          <img
            src={listing.image}
            alt={listing.location}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Badge */}
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gold text-white text-xs font-semibold rounded-full shadow-lg">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              {t('badge')}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-center gap-1.5 text-text-muted text-sm mb-2">
            <MapPin size={14} className="text-gold" />
            <span>{listing.location}</span>
          </div>

          <div className="flex items-baseline justify-between mb-3">
            <span className="text-xl font-serif text-dark">{listing.price}</span>
          </div>

          <div className="flex items-center gap-4 text-sm text-text-muted">
            <span className="flex items-center gap-1.5">
              <BedDouble size={14} />
              {listing.beds} {t('beds') || 'bed'}
            </span>
            <span className="flex items-center gap-1.5">
              <Maximize2 size={14} />
              {listing.sqm} m²
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function NewListings() {
  const t = useTranslations('newListings');
  const locale = useLocale();
  const outerRef = useRef(null);
  const trackRef = useRef(null);
  const [trackWidth, setTrackWidth] = useState(0);

  // Measure the total scrollable width of the cards track
  useEffect(() => {
    const measure = () => {
      if (trackRef.current) {
        const scrollW = trackRef.current.scrollWidth;
        const viewW = window.innerWidth;
        setTrackWidth(Math.max(0, scrollW - viewW));
      }
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  // useScroll on the tall outer container
  const { scrollYProgress } = useScroll({
    target: outerRef,
    offset: ['start start', 'end end'],
  });

  // Map vertical scroll progress → horizontal movement
  // Reserve first 10% for header visibility, last 5% for exit
  const x = useTransform(scrollYProgress, [0.1, 0.95], [0, -trackWidth]);

  const smoothX = useSpring(x, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.5,
  });

  // Header opacity — fade in during the first 10%
  const headerOpacity = useTransform(scrollYProgress, [0, 0.08], [0, 1]);
  const headerY = useTransform(scrollYProgress, [0, 0.08], [30, 0]);

  return (
    <section
      ref={outerRef}
      className="relative bg-soft"
      style={{ height: '300vh' }}
    >
      {/* Sticky inner container — stays on screen */}
      <div className="sticky top-0 h-screen flex flex-col justify-center overflow-hidden">
        {/* Section Header */}
        <motion.div
          style={{ opacity: headerOpacity, y: headerY }}
          className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 text-center"
        >
          <div className="inline-flex items-center gap-3 mb-6">
            <span className="h-px w-8 bg-gold/60" />
            <span className="text-gold text-xs font-sans tracking-[0.2em] uppercase">
              Portfolio
            </span>
            <span className="h-px w-8 bg-gold/60" />
          </div>
          <h2 className="text-3xl md:text-4xl font-serif text-dark mb-3">{t('title')}</h2>
          <p className="text-text-muted max-w-xl mx-auto">{t('subtitle')}</p>
        </motion.div>

        {/* Horizontal track driven by vertical scroll */}
        <motion.div
          ref={trackRef}
          style={{ x: smoothX }}
          className="flex gap-5 pl-4 sm:pl-8 lg:pl-[calc((100vw-72rem)/2+1rem)] pr-8"
        >
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} t={t} />
          ))}

          {/* View All Card */}
          <motion.div
            className="flex-shrink-0 w-[340px] md:w-[420px] flex items-center justify-center"
            whileHover={{ scale: 1.02 }}
          >
            <a
              href={`/${locale}/mulkler/`}
              className="bg-white/80 backdrop-blur rounded-2xl border-2 border-dashed border-gold/30 hover:border-gold/60 transition-colors duration-300 w-full h-full min-h-[540px] flex flex-col items-center justify-center gap-4 cursor-pointer group"
            >
              <div className="w-14 h-14 rounded-full bg-gold-light group-hover:bg-gold transition-colors duration-300 flex items-center justify-center">
                <ArrowRight size={24} className="text-gold group-hover:text-white transition-colors duration-300" />
              </div>
              <span className="text-dark font-medium group-hover:text-gold transition-colors duration-300">
                {t('viewAll') || 'Tüm İlanlar'}
              </span>
            </a>
          </motion.div>
        </motion.div>

        {/* Scroll hint indicator */}
        <motion.div
          style={{ opacity: useTransform(scrollYProgress, [0, 0.15, 0.3], [1, 1, 0]) }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-text-muted/50"
        >
          <span className="text-xs tracking-wider uppercase">Scroll</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            className="w-5 h-8 rounded-full border-2 border-text-muted/30 flex items-start justify-center pt-1.5"
          >
            <div className="w-1 h-1.5 rounded-full bg-text-muted/50" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
