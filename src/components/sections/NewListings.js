'use client';

import { useTranslations } from 'next-intl';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useRef } from 'react';
import { MapPin, BedDouble, Maximize2, ArrowRight } from 'lucide-react';

const listings = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&q=80&auto=format',
    location: 'El Carmen, Valencia',
    price: '€185.000',
    beds: 2,
    sqm: 78,
    tag: 'new',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=600&q=80&auto=format',
    location: 'Benimaclet, Valencia',
    price: '€145.000',
    beds: 3,
    sqm: 92,
    tag: 'new',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=600&q=80&auto=format',
    location: 'Ciutat Vella, Valencia',
    price: '€265.000',
    beds: 3,
    sqm: 110,
    tag: 'new',
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=600&q=80&auto=format',
    location: 'Poblats Marítims',
    price: '€198.000',
    beds: 2,
    sqm: 85,
    tag: 'new',
  },
  {
    id: 5,
    image: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=600&q=80&auto=format',
    location: 'Patraix, Valencia',
    price: '€155.000',
    beds: 2,
    sqm: 70,
    tag: 'new',
  },
  {
    id: 6,
    image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=600&q=80&auto=format',
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
      className="flex-shrink-0 w-[300px] md:w-[340px] group cursor-pointer"
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-shadow duration-500 border border-border">
        {/* Image */}
        <div className="relative h-48 overflow-hidden">
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
  const sectionRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // Smooth spring for natural feel
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // Cards move left as you scroll down (negative x), right when scrolling up
  const x = useTransform(smoothProgress, [0, 1], ['10%', '-40%']);

  return (
    <section ref={sectionRef} className="py-20 overflow-hidden bg-soft">
      {/* Section Header */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ margin: "-50px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className="text-3xl md:text-4xl font-serif text-dark mb-3">{t('title')}</h2>
          <p className="text-text-muted max-w-xl">{t('subtitle')}</p>
        </motion.div>
      </div>

      {/* Scroll-linked Carousel */}
      <motion.div
        style={{ x }}
        className="flex gap-5 pl-4 sm:pl-8 lg:pl-[calc((100vw-72rem)/2+1rem)]"
      >
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} t={t} />
        ))}

        {/* View All Card */}
        <motion.div
          className="flex-shrink-0 w-[300px] md:w-[340px] flex items-center justify-center"
          whileHover={{ scale: 1.02 }}
        >
          <div className="bg-white/80 backdrop-blur rounded-2xl border-2 border-dashed border-gold/30 hover:border-gold/60 transition-colors duration-300 w-full h-full min-h-[280px] flex flex-col items-center justify-center gap-4 cursor-pointer group">
            <div className="w-14 h-14 rounded-full bg-gold-light group-hover:bg-gold transition-colors duration-300 flex items-center justify-center">
              <ArrowRight size={24} className="text-gold group-hover:text-white transition-colors duration-300" />
            </div>
            <span className="text-dark font-medium group-hover:text-gold transition-colors duration-300">
              {t('viewAll') || 'Tüm İlanlar'}
            </span>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
