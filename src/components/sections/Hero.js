'use client';

import { useTranslations, useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';

export default function Hero() {
  const t = useTranslations('hero');
  const locale = useLocale();

  return (
    <section className="relative min-h-screen flex items-center bg-dark overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-dark via-dark-mid to-charcoal" />
        {/* Decorative gold circles */}
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-gold/5 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-gold/3 blur-3xl" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Text */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gold/10 border border-gold/20 rounded-full mb-6">
              <div className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
              <span className="text-gold text-xs font-medium tracking-wide">RE/MAX Partner — Valencia, Spain</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif text-white leading-[1.1] mb-6">
              {t('title')}
            </h1>

            <p className="text-lg text-white/60 leading-relaxed mb-8 max-w-lg">
              {t('subtitle')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href={`/${locale}#contact`}
                className="inline-flex items-center justify-center gap-2 px-7 py-4 bg-gold text-dark font-semibold rounded-xl hover:bg-gold-hover transition-all shadow-gold group"
              >
                {t('cta_primary')}
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href={`/${locale}#properties`}
                className="inline-flex items-center justify-center gap-2 px-7 py-4 border border-white/20 text-white rounded-xl hover:bg-white/5 transition-colors"
              >
                <Play size={16} />
                {t('cta_secondary')}
              </a>
            </div>
          </motion.div>

          {/* Right: Visual card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
            className="hidden lg:block"
          >
            <div className="relative">
              {/* Main property card placeholder */}
              <div className="bg-charcoal/60 backdrop-blur-sm border border-white/10 rounded-2xl p-6 shadow-2xl">
                <div className="aspect-[4/3] rounded-xl bg-gradient-to-br from-charcoal-light to-dark-mid flex items-center justify-center mb-4">
                  <svg width="80" height="80" viewBox="0 0 80 80" fill="none" className="text-gold/30">
                    <rect x="10" y="25" width="60" height="45" rx="3" stroke="currentColor" strokeWidth="2"/>
                    <path d="M10 40L40 20L70 40" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <rect x="30" y="45" width="20" height="25" rx="1" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-white/10 rounded w-3/4" />
                  <div className="h-3 bg-white/5 rounded w-1/2" />
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="h-5 bg-gold/20 rounded w-1/3" />
                  <div className="h-8 bg-gold/10 rounded-lg w-24" />
                </div>
              </div>

              {/* Floating badge */}
              <div className="absolute -bottom-4 -left-4 bg-white rounded-xl px-4 py-3 shadow-card-hover">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gold-light flex items-center justify-center">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-dark">500+</p>
                    <p className="text-[10px] text-text-muted">Happy Clients</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
