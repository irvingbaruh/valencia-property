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
    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80&auto=format',
  },
  {
    id: 2,
    title: 'Ruzafa Penthouse',
    location: 'Ruzafa, Valencia',
    price: '€320,000',
    rooms: 4,
    sqm: 140,
    badge: 'premium',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80&auto=format',
  },
  {
    id: 3,
    title: 'Cabanyal Beach Home',
    location: 'Cabanyal, Valencia',
    price: '€245,000',
    rooms: 2,
    sqm: 80,
    badge: 'new',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80&auto=format',
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
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
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
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="group bg-white rounded-xl border border-border overflow-hidden hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1"
            >
              {/* Image */}
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={property.image}
                  alt={property.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                {/* Badge */}
                <span className="absolute top-3 left-3 px-2.5 py-1 bg-gold text-white text-xs font-medium rounded-md shadow-gold">
                  {t(`badge_${property.badge}`)}
                </span>
              </div>

              <div className="p-5">
                <h3 className="font-serif text-lg text-dark mb-1 group-hover:text-gold transition-colors duration-200">
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
                  <span className="w-8 h-8 rounded-full bg-gold-light flex items-center justify-center group-hover:bg-gold transition-colors duration-200">
                    <ArrowRight size={14} className="text-gold group-hover:text-white transition-colors duration-200" />
                  </span>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        {/* View All */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center mt-10"
        >
          <a
            href={`/${locale}/properties`}
            className="inline-flex items-center gap-2 px-6 py-3 border border-border text-text-secondary hover:text-dark hover:border-gold rounded-lg transition-all duration-200 font-medium text-sm group"
          >
            {t('view_all')}
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-200" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
