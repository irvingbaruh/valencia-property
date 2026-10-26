'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Search, Scale, Paintbrush, Hammer, KeyRound, Home } from 'lucide-react';

const services = [
  { key: 'search', icon: Search },
  { key: 'legal', icon: Scale },
  { key: 'decor', icon: Paintbrush },
  { key: 'renovation', icon: Hammer },
  { key: 'rental', icon: KeyRound },
  { key: 'staging', icon: Home },
];

export default function Services() {
  const t = useTranslations('services');

  return (
    <section id="services" className="section-padding bg-soft">
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

        {/* Service Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, i) => (
            <motion.div
              key={service.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="bg-white rounded-xl p-6 border border-border hover:shadow-card-hover hover:border-gold/30 transition-all group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-gold-light flex items-center justify-center mb-4 group-hover:bg-gold group-hover:text-white transition-colors">
                <service.icon size={22} className="text-gold group-hover:text-white transition-colors" />
              </div>
              <h3 className="font-serif text-lg text-dark mb-2">
                {t(`${service.key}.title`)}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                {t(`${service.key}.desc`)}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
