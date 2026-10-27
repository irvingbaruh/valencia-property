'use client';

import { useTranslations, useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';

export default function Hero() {
  const t = useTranslations('hero');
  const locale = useLocale();

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1583269838827-8e1ff60b2f72?w=1920&q=80&auto=format"
          alt="Valencia cityscape"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-dark/95 via-dark/80 to-dark/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-dark/60 via-transparent to-dark/30" />
      </div>

      {/* Animated grain texture */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Text */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="inline-flex items-center gap-2 px-4 py-1.5 bg-gold/10 border border-gold/20 rounded-full mb-6 backdrop-blur-sm"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
              <span className="text-gold text-xs font-medium tracking-wide">RE/MAX Partner — Valencia, Spain</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="text-4xl sm:text-5xl lg:text-6xl font-serif text-white leading-[1.1] mb-6"
            >
              {t('title')}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="text-lg text-white/60 leading-relaxed mb-8 max-w-lg"
            >
              {t('subtitle')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <a
                href={`/${locale}#contact`}
                className="inline-flex items-center justify-center gap-2 px-7 py-4 bg-gold text-dark font-semibold rounded-xl hover:bg-gold-hover hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-gold group"
              >
                {t('cta_primary')}
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform duration-200" />
              </a>
              <a
                href={`/${locale}#properties`}
                className="inline-flex items-center justify-center gap-2 px-7 py-4 border border-white/20 text-white rounded-xl hover:bg-white/10 hover:border-white/30 transition-all duration-200"
              >
                <Play size={16} />
                {t('cta_secondary')}
              </a>
            </motion.div>
          </div>

          {/* Right: Property Preview Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="hidden lg:block"
          >
            <div className="relative">
              {/* Main property card */}
              <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 shadow-2xl">
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-4">
                  <img
                    src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80&auto=format"
                    alt="Luxury property"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark/40 to-transparent" />
                  <span className="absolute top-3 left-3 px-3 py-1 bg-gold text-white text-xs font-semibold rounded-md">
                    Premium
                  </span>
                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                    <div>
                      <p className="text-white font-serif text-lg drop-shadow-lg">Ruzafa Penthouse</p>
                      <p className="text-white/80 text-xs drop-shadow-lg">Ruzafa, Valencia</p>
                    </div>
                    <p className="text-gold font-serif text-xl drop-shadow-lg">€320,000</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-white/70 text-sm px-1">
                  <span>🛏 4 rooms</span>
                  <span>📐 140m²</span>
                  <span>🏠 Penthouse</span>
                </div>
              </div>

              {/* Floating badge */}
              <motion.div
                initial={{ opacity: 0, x: -20, y: 10 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="absolute -bottom-4 -left-4 bg-white rounded-xl px-4 py-3 shadow-card-hover"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gold-light flex items-center justify-center">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-dark">500+</p>
                    <p className="text-[10px] text-text-muted">Happy Clients</p>
                  </div>
                </div>
              </motion.div>

              {/* Floating ROI badge */}
              <motion.div
                initial={{ opacity: 0, x: 20, y: -10 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ duration: 0.5, delay: 1, ease: [0.22, 1, 0.36, 1] }}
                className="absolute -top-3 -right-3 bg-white rounded-xl px-4 py-3 shadow-card-hover"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-dark">6.5%</p>
                    <p className="text-[10px] text-text-muted">Avg. ROI</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2"
        >
          <div className="w-1 h-2 bg-gold rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
}
