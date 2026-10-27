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

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 25 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function Services() {
  const t = useTranslations('services');

  return (
    <section id="services" className="section-padding bg-soft">
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

        {/* Service Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {services.map((service) => (
            <motion.div
              key={service.key}
              variants={itemVariants}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="bg-white rounded-xl p-6 border border-border hover:shadow-card-hover hover:border-gold/30 transition-all duration-300 group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-gold-light flex items-center justify-center mb-4 group-hover:bg-gold transition-colors duration-300">
                <service.icon size={22} className="text-gold group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="font-serif text-lg text-dark mb-2 group-hover:text-gold transition-colors duration-200">
                {t(`${service.key}.title`)}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                {t(`${service.key}.desc`)}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
