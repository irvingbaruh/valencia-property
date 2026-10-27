'use client';

import { useTranslations, useLocale } from 'next-intl';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';

/*
 * Cinematic Hero with Photo-Mosaic Scroll-Zoom
 * =============================================
 * Desktop: A grid of lifestyle photos starts as a mosaic. As the user scrolls,
 * the center image scales up and eventually fills the entire viewport.
 *
 * Mobile: Single full-bleed background image with text overlay —
 * the mosaic grid is too cramped on small screens.
 *
 * Layout (3×2 grid, desktop only):
 *   [img1] [CENTER_IMAGE] [img3]
 *   [img4] [  img5      ] [img6]
 */

const mosaicImages = [
  { src: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&q=80&auto=format', alt: 'Modern living room' },
  { src: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&q=80&auto=format', alt: 'Luxury villa exterior', center: true },
  { src: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80&auto=format', alt: 'Luxury villa exterior' },
  { src: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600&q=80&auto=format', alt: 'Interior design' },
  { src: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80&auto=format', alt: 'Mediterranean home' },
  { src: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80&auto=format', alt: 'Pool and garden' },
];

// Mobile hero uses a single full-bleed image
const mobileHeroImage = 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&q=80&auto=format';

export default function Hero() {
  const t = useTranslations('hero');
  const locale = useLocale();
  const sectionRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    setIsMobile(mq.matches);
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  // Center image zoom: starts at 1, scales to fill viewport
  const centerScale = useTransform(scrollYProgress, [0, 0.5, 0.8], [1, 1.8, 3.5]);
  // Other images: fade and scale down
  const sideOpacity = useTransform(scrollYProgress, [0, 0.3, 0.5], [1, 0.6, 0]);
  const sideScale = useTransform(scrollYProgress, [0, 0.3, 0.5], [1, 0.95, 0.85]);
  // Gap between tiles shrinks as center expands
  const gridGap = useTransform(scrollYProgress, [0, 0.4], [12, 0]);
  // Text content fades in mid-scroll, then out
  const headingOpacity = useTransform(scrollYProgress, [0, 0.15, 0.55, 0.7], [1, 1, 1, 0]);
  const headingY = useTransform(scrollYProgress, [0, 0.15, 0.55, 0.7], [0, 0, 0, -60]);
  // Overlay darkens as center fills
  const overlayOpacity = useTransform(scrollYProgress, [0.4, 0.7], [0, 0.55]);
  // Scroll indicator
  const scrollIndicatorOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);
  // Border radius on center image shrinks to 0
  const centerRadius = useTransform(scrollYProgress, [0, 0.5], [12, 0]);

  // ─── Mobile hero: single full-bleed image ───
  if (isMobile) {
    return (
      <section className="relative h-screen overflow-hidden bg-dark">
        {/* Full-bleed background image */}
        <motion.img
          src={mobileHeroImage}
          alt="Luxury Mediterranean villa"
          className="absolute inset-0 w-full h-full object-cover"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
        />

        {/* Gradient overlays for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-dark/60 via-dark/20 to-dark/70" />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-dark/40 backdrop-blur-md border border-white/15 rounded-full mb-6"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
            <span className="text-gold text-[10px] font-medium tracking-widest uppercase">
              RE/MAX Partner — Valencia
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="text-4xl font-serif text-white leading-[1.1] mb-5 drop-shadow-2xl text-center"
          >
            {t('title')}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-base text-white/75 max-w-sm mx-auto mb-8 drop-shadow-lg text-center"
          >
            {t('subtitle')}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.1 }}
            className="flex flex-col gap-3 w-full max-w-xs"
          >
            <a
              href={`/${locale}#contact`}
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-gold text-dark font-semibold rounded-xl hover:bg-gold-hover active:scale-[0.98] transition-all duration-200 shadow-gold group"
            >
              {t('cta_primary')}
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-200" />
            </a>
            <a
              href={`/${locale}#properties`}
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 border border-white/25 text-white rounded-xl hover:bg-white/10 transition-all duration-200 backdrop-blur-sm"
            >
              {t('cta_secondary')}
            </a>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
        >
          <span className="text-white/40 text-[10px] tracking-widest uppercase">Scroll</span>
          <div className="w-5 h-8 border-2 border-white/25 rounded-full flex justify-center pt-1.5">
            <div className="w-1 h-1.5 bg-gold rounded-full" />
          </div>
        </motion.div>
      </section>
    );
  }

  // ─── Desktop hero: mosaic scroll-zoom ───
  return (
    <section
      ref={sectionRef}
      className="relative"
      style={{ height: '250vh' }}
    >
      {/* Sticky viewport container */}
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-dark">
        {/* Mosaic grid — positioned center, fills viewport */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="grid w-full h-full max-w-[100vw] max-h-[100vh]"
            style={{
              gridTemplateColumns: '1fr 2fr 1fr',
              gridTemplateRows: '1.2fr 1fr',
              gap: gridGap,
              padding: gridGap,
            }}
          >
            {/* Top-left */}
            <motion.div
              style={{ opacity: sideOpacity, scale: sideScale }}
              className="relative overflow-hidden rounded-xl"
            >
              <img
                src={mosaicImages[0].src}
                alt={mosaicImages[0].alt}
                className="w-full h-full object-cover"
              />
            </motion.div>

            {/* CENTER — the hero image that zooms */}
            <motion.div
              style={{
                scale: centerScale,
                borderRadius: centerRadius,
                zIndex: 10,
              }}
              className="relative overflow-hidden rounded-xl row-span-1"
            >
              <img
                src={mosaicImages[1].src}
                alt={mosaicImages[1].alt}
                className="w-full h-full object-cover"
              />
              {/* Dark overlay that fades in during zoom */}
              <motion.div
                style={{ opacity: overlayOpacity }}
                className="absolute inset-0 bg-dark"
              />
            </motion.div>

            {/* Top-right */}
            <motion.div
              style={{ opacity: sideOpacity, scale: sideScale }}
              className="relative overflow-hidden rounded-xl"
            >
              <img
                src={mosaicImages[2].src}
                alt={mosaicImages[2].alt}
                className="w-full h-full object-cover"
              />
            </motion.div>

            {/* Bottom-left */}
            <motion.div
              style={{ opacity: sideOpacity, scale: sideScale }}
              className="relative overflow-hidden rounded-xl"
            >
              <img
                src={mosaicImages[3].src}
                alt={mosaicImages[3].alt}
                className="w-full h-full object-cover"
              />
            </motion.div>

            {/* Bottom-center */}
            <motion.div
              style={{ opacity: sideOpacity, scale: sideScale }}
              className="relative overflow-hidden rounded-xl"
            >
              <img
                src={mosaicImages[4].src}
                alt={mosaicImages[4].alt}
                className="w-full h-full object-cover"
              />
            </motion.div>

            {/* Bottom-right */}
            <motion.div
              style={{ opacity: sideOpacity, scale: sideScale }}
              className="relative overflow-hidden rounded-xl"
            >
              <img
                src={mosaicImages[5].src}
                alt={mosaicImages[5].alt}
                className="w-full h-full object-cover"
              />
            </motion.div>
          </motion.div>
        </div>

        {/* Heading overlay — centered on mosaic */}
        <motion.div
          style={{ opacity: headingOpacity, y: headingY }}
          className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"
        >
          <div className="text-center px-4 pointer-events-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="inline-flex items-center gap-2 px-5 py-2 bg-dark/40 backdrop-blur-md border border-white/15 rounded-full mb-8"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
              <span className="text-gold text-xs font-medium tracking-widest uppercase">
                RE/MAX Partner — Valencia, Spain
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="text-5xl sm:text-6xl lg:text-8xl font-serif text-white leading-[1.05] mb-6 drop-shadow-2xl"
            >
              {t('title')}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="text-lg sm:text-xl text-white/70 max-w-xl mx-auto mb-10 drop-shadow-lg"
            >
              {t('subtitle')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.1 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <a
                href={`/${locale}#contact`}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gold text-dark font-semibold rounded-xl hover:bg-gold-hover hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-gold group"
              >
                {t('cta_primary')}
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform duration-200" />
              </a>
              <a
                href={`/${locale}#properties`}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-white/25 text-white rounded-xl hover:bg-white/10 hover:border-white/40 transition-all duration-200 backdrop-blur-sm"
              >
                {t('cta_secondary')}
              </a>
            </motion.div>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          style={{ opacity: scrollIndicatorOpacity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center gap-3"
          >
            <span className="text-white/50 text-xs tracking-widest uppercase">Scroll</span>
            <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
              <div className="w-1 h-2 bg-gold rounded-full" />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
