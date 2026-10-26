'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Building2, Clock, Users, Award } from 'lucide-react';

const stats = [
  { key: 'properties', value: '350+', icon: Building2 },
  { key: 'experience', value: '15+', icon: Clock },
  { key: 'clients', value: '500+', icon: Users },
  { key: 'partner', value: 'RE/MAX', icon: Award },
];

export default function Stats() {
  const t = useTranslations('stats');

  return (
    <section className="relative -mt-12 z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-2xl shadow-card-hover border border-border p-6 md:p-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="text-center"
            >
              <div className="w-12 h-12 rounded-xl bg-gold-light flex items-center justify-center mx-auto mb-3">
                <stat.icon size={22} className="text-gold" />
              </div>
              <p className="text-2xl md:text-3xl font-serif text-dark mb-1">{stat.value}</p>
              <p className="text-sm text-text-muted">{t(stat.key)}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
