'use client';

import { useTranslations, useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { MapPin, BedDouble, Maximize2, ArrowRight } from 'lucide-react';

const sampleProperties = [
  {
    id: 1,
    title: 'Eixample Apartment',
    location: 'Eixample, Valencia',
    price: '€185,000',
    rooms: 3,
    sqm: 95,
    badge: 'new',
  },
  {
    id: 2,
    title: 'Ruzafa Penthouse',
    location: 'Ruzafa, Valencia',
    price: '€320,000',
    rooms: 4,
    sqm: 140,
    badge: 'premium',
  },
  {
    id: 3,
    title: 'Cabanyal Beach Home',
    location: 'Cabanyal, Valencia',
    price: '€245,000',
    rooms: 2,
    sqm: 80,
    badge: 'new',
  },
];

export default function Properties() {
  const t = useTranslations('properties');
  const locale = useLocale();

  return (
    <section id="properties" className="section-padding bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="accent-line mx-auto mb-4" />
          <h2 className="text-3xl md:text-4xl font-serif text-dark mb-3">
            {t('title')}
          </h2>
          <p className="text-text-secondary max-w-xl mx-auto">
            {t('subtitle')}
          </p>
        </motion.div>

        {/* Property Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {sampleProperties.map((property, i) => (
            <motion.article
              key={property.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group bg-white rounded-xl border border-border overflow-hidden hover:shadow-card-hover transition-shadow"
            >
              {/* Image placeholder */}
              <div className="relative aspect-[4/3] bg-gradient-to-br from-soft to-warm-gray flex items-center justify-center">
                <svg width="60" height="60" viewBox="0 0 80 80" fill="none" className="text-border">
                  <rect x="10" y="25" width="60" height="45" rx="3" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M10 40L40 20L70 40" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <rect x="30" y="45" width="20" height="25" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
                {/* Badge */}
                <span className="absolute top-3 left-3 px-2.5 py-1 bg-gold text-white text-xs font-medium rounded-md">
                  {t(`badge_${property.badge}`)}
                </span>
              </div>

              <div className="p-5">
                <h3 className="font-serif text-lg text-dark mb-1 group-hover:text-gold transition-colors">
                  {property.title}
                </h3>
                <div className="flex items-center gap-1 text-text-muted text-sm mb-4">
                  <MapPin size={14} />
                  <span>{property.location}</span>
                </div>

                <div className="flex items-center gap-4 text-sm text-text-secondary mb-4">
                  <span className="flex items-center gap-1">
                    <BedDouble size={15} />
                    {property.rooms} {t('rooms')}
                  </span>
                  <span className="flex items-center gap-1">
                    <Maximize2 size={15} />
                    {property.sqm} {t('sqm')}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <span className="text-xl font-serif text-gold">{property.price}</span>
                  <button className="text-sm text-text-muted hover:text-gold transition-colors flex items-center gap-1">
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        {/* View All */}
        <div className="text-center mt-10">
          <a
            href={`/${locale}/properties`}
            className="inline-flex items-center gap-2 px-6 py-3 border border-border text-text-secondary hover:text-dark hover:border-gold rounded-lg transition-colors font-medium text-sm"
          >
            {t('view_all')}
            <ArrowRight size={16} />
          </a>
        </div>
      </div>
    </section>
  );
}
