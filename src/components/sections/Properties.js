'use client';

import { useTranslations, useLocale } from 'next-intl';
import { motion, useScroll, useTransform } from 'framer-motion';
import { MapPin, BedDouble, Maximize2, ArrowRight } from 'lucide-react';
import { useRef } from 'react';
import FavoriteButton from '@/components/ui/FavoriteButton';

const sampleProperties = [
  {
    id: 1,
    title: 'Eixample Apartment',
    location: 'Eixample, Valencia',
    price: '€185,000',
    rooms: 3,
    sqm: 95,
    badge: 'new',
    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80&auto=format',
  },
  {
    id: 2,
    title: 'Ruzafa Penthouse',
    location: 'Ruzafa, Valencia',
    price: '€320,000',
    rooms: 4,
    sqm: 140,
    badge: 'premium',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80&auto=format',
  },
  {
    id: 3,
    title: 'Cabanyal Beach Home',
    location: 'Cabanyal, Valencia',
    price: '€245,000',
    rooms: 2,
    sqm: 80,
    badge: 'new',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80&auto=format',
  },
];

function PropertyCard({ property, index, t }) {
  const cardRef = useRef(null);
  const isReversed = index % 2 !== 0;

  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ['start end', 'end start'],
  });

  const imageY = useTransform(scrollYProgress, [0, 1], ['-8%', '8%']);
  const contentOpacity = useTransform(scrollYProgress, [0.1, 0.3], [0, 1]);
  const contentX = useTransform(
    scrollYProgress,
    [0.1, 0.35],
    [isReversed ? -40 : 40, 0]
  );

  return (
    <motion.div
      ref={cardRef}
      className={`flex flex-col ${isReversed ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-0 lg:gap-0 group`}
    >
      {/* Large image — takes ~60% width on desktop */}
      <div className="relative lg:w-[60%] aspect-[16/10] lg:aspect-auto overflow-hidden rounded-2xl lg:rounded-none lg:rounded-l-2xl">
        {isReversed && (
          <div className="absolute inset-0 overflow-hidden rounded-2xl lg:rounded-none lg:rounded-r-2xl">
            <motion.div style={{ y: imageY }} className="absolute inset-0 -top-[16%] -bottom-[16%]">
              <img
                src={property.image}
                alt={property.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </motion.div>
          </div>
        )}
        {!isReversed && (
          <div className="absolute inset-0 overflow-hidden rounded-2xl lg:rounded-none lg:rounded-l-2xl">
            <motion.div style={{ y: imageY }} className="absolute inset-0 -top-[16%] -bottom-[16%]">
              <img
                src={property.image}
                alt={property.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </motion.div>
          </div>
        )}
        {/* Badge */}
        <span className="absolute top-5 left-5 px-3 py-1.5 bg-gold text-dark text-xs font-semibold tracking-wide uppercase rounded-md shadow-gold z-10">
          {t(`badge_${property.badge}`)}
        </span>
        <FavoriteButton propertyId={property.id} className="absolute top-5 right-5 shadow-sm z-10" />
        {/* Gradient overlay for mobile */}
        <div className="absolute inset-0 bg-gradient-to-t from-dark/40 via-transparent to-transparent lg:hidden" />
      </div>

      {/* Content panel — dark with gold accents */}
      <motion.div
        style={{ opacity: contentOpacity, x: contentX }}
        className={`relative lg:w-[40%] bg-dark flex flex-col justify-center p-8 lg:p-12 ${
          isReversed ? 'lg:rounded-l-2xl' : 'lg:rounded-r-2xl'
        } -mt-8 lg:mt-0 mx-4 lg:mx-0 rounded-2xl lg:rounded-none z-10`}
      >
        {/* Decorative gold line */}
        <div className="w-12 h-0.5 bg-gold mb-6" />

        <h3 className="font-serif text-2xl lg:text-3xl text-white mb-3 group-hover:text-gold transition-colors duration-300">
          {property.title}
        </h3>

        <div className="flex items-center gap-1.5 text-white/50 text-sm mb-6">
          <MapPin size={14} />
          <span>{property.location}</span>
        </div>

        <div className="flex items-center gap-6 text-sm text-white/60 mb-8">
          <span className="flex items-center gap-2">
            <BedDouble size={16} className="text-gold/70" />
            {property.rooms} {t('rooms')}
          </span>
          <span className="flex items-center gap-2">
            <Maximize2 size={16} className="text-gold/70" />
            {property.sqm} {t('sqm')}
          </span>
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-white/10">
          <span className="text-2xl lg:text-3xl font-serif text-gold">{property.price}</span>
          <span className="w-10 h-10 rounded-full border border-gold/30 flex items-center justify-center group-hover:bg-gold group-hover:border-gold transition-all duration-300">
            <ArrowRight size={16} className="text-gold group-hover:text-dark transition-colors duration-300" />
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Properties() {
  const t = useTranslations('properties');
  const locale = useLocale();

  return (
    <section id="properties" className="py-24 lg:py-32 bg-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 lg:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
          >
            <div className="accent-line mx-auto mb-4" />
            <h2 className="text-3xl md:text-5xl font-serif text-dark mb-4">
              {t('title')}
            </h2>
            <p className="text-text-secondary max-w-xl mx-auto text-lg">
              {t('subtitle')}
            </p>
          </motion.div>
        </div>

        {/* Immersive Property Cards */}
        <div className="flex flex-col gap-12 lg:gap-16">
          {sampleProperties.map((property, i) => (
            <PropertyCard
              key={property.id}
              property={property}
              index={i}
              t={t}
            />
          ))}
        </div>

        {/* View All */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center mt-16"
        >
          <a
            href={`/${locale}/mulkler/`}
            className="inline-flex items-center gap-3 px-8 py-4 bg-dark text-white font-medium rounded-xl hover:bg-charcoal transition-all duration-300 group"
          >
            {t('view_all')}
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-200" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
