'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Scale, Paintbrush, Hammer, KeyRound, Home, ChevronRight, CheckCircle2, ArrowRight } from 'lucide-react';
import ScrollReveal from '@/components/ui/ScrollReveal';

const services = [
  {
    key: 'search',
    slug: 'mulk-arama',
    icon: Search,
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80&auto=format',
  },
  {
    key: 'legal',
    slug: 'hukuki-destek',
    icon: Scale,
    image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80&auto=format',
  },
  {
    key: 'decor',
    slug: 'dekorasyon-mobilya',
    icon: Paintbrush,
    image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=80&auto=format',
    secondaryCta: { labelKey: 'decorCta', url: 'https://www.decorpetit.com' },
  },
  {
    key: 'renovation',
    slug: 'renovasyon',
    icon: Hammer,
    image: 'https://images.unsplash.com/photo-1768321916877-8cf4e4ef7487?w=800&q=80&auto=format',
  },
  {
    key: 'rental',
    slug: 'kira-yonetimi',
    icon: KeyRound,
    image: 'https://images.unsplash.com/photo-1733244766159-f58f4184fd38?w=800&q=80&auto=format',
  },
  {
    key: 'staging',
    slug: 'home-staging',
    icon: Home,
    image: 'https://images.unsplash.com/photo-1746517757473-7c88850e539b?w=800&q=80&auto=format',
    secondaryCta: { labelKey: 'stagingCta', url: 'https://www.decorpetit.com/pages/home-staging?view=home-staging' },
  },
];

function ServiceCard({ service, index, isExpanded, onToggle, t, locale }) {
  const Icon = service.icon;
  const details = [
    t(`${service.key}.d1`),
    t(`${service.key}.d2`),
    t(`${service.key}.d3`),
    t(`${service.key}.d4`),
  ];

  return (
    <motion.div
      layout
      onClick={onToggle}
      whileHover={{ y: -4 }}
      transition={{ layout: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }, y: { duration: 0.25 } }}
      className="relative cursor-pointer group"
    >
      {/* Card */}
      <motion.div
        layout
        className={`
          relative overflow-hidden rounded-2xl transition-all duration-500
          ${isExpanded
            ? 'bg-white ring-1 ring-gold/40 shadow-lg shadow-gold/10'
            : 'bg-white ring-1 ring-black/[0.06] group-hover:ring-gold/40 group-hover:shadow-[0_0_28px_rgba(201,168,76,0.18)]'
          }
        `}
      >
        {/* Gold accent bar on left when expanded */}
        <motion.div
          className="absolute left-0 top-0 bottom-0 w-1 bg-gold rounded-l-2xl z-10"
          initial={false}
          animate={{ opacity: isExpanded ? 1 : 0, scaleY: isExpanded ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />

        {/* Service image */}
        <motion.div layout className="relative h-[400px] sm:h-[440px] overflow-hidden">
          <img
            src={service.image}
            alt=""
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          {/* Icon overlay */}
          <motion.div
            layout
            className={`
              absolute bottom-4 left-4 w-12 h-12 rounded-xl flex items-center justify-center backdrop-blur-sm transition-all duration-500
              ${isExpanded
                ? 'bg-gold shadow-[0_0_20px_rgba(201,168,76,0.4)]'
                : 'bg-white/90 group-hover:bg-gold/90'
              }
            `}
          >
            <Icon
              size={22}
              className={`transition-colors duration-300 ${
                isExpanded ? 'text-white' : 'text-dark group-hover:text-white'
              }`}
            />
          </motion.div>
        </motion.div>

        <motion.div layout className="p-5 sm:p-6">
          {/* Header row */}
          <motion.div layout className="flex items-start gap-3">
            {/* Title + desc */}
            <div className="flex-1 min-w-0">
              <motion.h3
                layout
                className={`font-serif text-lg leading-snug transition-colors duration-300 ${
                  isExpanded ? 'text-gold' : 'text-dark group-hover:text-gold'
                }`}
              >
                {t(`${service.key}.title`)}
              </motion.h3>
              <motion.p
                layout
                className="text-sm text-text-muted mt-1 leading-relaxed"
              >
                {t(`${service.key}.desc`)}
              </motion.p>
            </div>

            {/* Expand indicator + hover hint */}
            <motion.div layout className="shrink-0 mt-1 flex items-center gap-2">
              {!isExpanded && (
                <span className="hidden sm:inline text-xs text-gold opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                  {t('explore')}
                </span>
              )}
              <motion.div
                animate={{ rotate: isExpanded ? 90 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronRight size={18} className={`transition-colors duration-300 ${isExpanded ? 'text-gold' : 'text-black/30 group-hover:text-gold'}`} />
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Expanded detail section — golden background with white text */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
                className="overflow-hidden"
              >
                <div className="mt-4 px-5 sm:px-6 py-5 bg-gold rounded-xl">
                  <ul className="space-y-3">
                    {details.map((detail, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + i * 0.06, duration: 0.3 }}
                        className="flex items-start gap-3"
                      >
                        <CheckCircle2 size={16} className="text-white shrink-0 mt-0.5" />
                        <span className="text-sm text-white leading-relaxed">{detail}</span>
                      </motion.li>
                    ))}
                  </ul>

                  {/* CTA buttons */}
                  <div
                    className="mt-5 pt-4 border-t border-white/25 flex flex-col sm:flex-row gap-3"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <a
                      href={`/${locale}/hizmetler/${service.slug}/`}
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-dark text-sm font-semibold rounded-lg hover:bg-gold-light transition-colors duration-200 group/btn"
                    >
                      {t('viewServicePage')}
                      <ArrowRight size={15} className="group-hover/btn:translate-x-1 transition-transform duration-200" />
                    </a>
                    {service.secondaryCta && (
                      <a
                        href={service.secondaryCta.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-white/50 text-white text-sm font-semibold rounded-lg hover:bg-white/10 transition-colors duration-200"
                      >
                        {t(service.secondaryCta.labelKey)}
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export default function Services() {
  const t = useTranslations('services');
  const locale = useLocale();
  const [expandedIndex, setExpandedIndex] = useState(null);

  const toggleCard = (index) => {
    setExpandedIndex(prev => prev === index ? null : index);
  };

  return (
    <section id="services" className="relative py-24 sm:py-32 overflow-hidden bg-soft">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <ScrollReveal className="text-center mb-16">
          <div className="inline-flex items-center gap-3 mb-6">
            <span className="h-px w-8 bg-gold/60" />
            <span className="text-gold text-xs font-sans tracking-[0.2em] uppercase">
              Services
            </span>
            <span className="h-px w-8 bg-gold/60" />
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-dark mb-4 leading-tight">
            {t('title')}
          </h2>
          <p className="text-text-muted max-w-xl mx-auto text-base sm:text-lg leading-relaxed">
            {t('subtitle')}
          </p>
        </ScrollReveal>

        {/* Service Cards — 2 columns on desktop, 1 on mobile */}
        <div className="grid md:grid-cols-2 gap-5 sm:gap-6">
          {services.map((service, i) => (
            <ScrollReveal key={service.key} delay={i * 0.025}>
              <ServiceCard
                service={service}
                index={i}
                isExpanded={expandedIndex === i}
                onToggle={() => toggleCard(i)}
                t={t}
                locale={locale}
              />
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal className="text-center mt-12">
          <a
            href={`/${locale}/hizmetler/`}
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 border border-gold/40 text-dark font-semibold rounded-xl hover:bg-gold hover:text-white hover:border-gold transition-all duration-200 group"
          >
            {t('viewAllServices')}
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-200" />
          </a>
        </ScrollReveal>
      </div>
    </section>
  );
}
