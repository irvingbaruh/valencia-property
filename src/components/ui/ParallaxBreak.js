'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

/*
 * ParallaxBreak — Cinematic full-width image interstitial
 * =======================================================
 * Inspired by 111w57.com and hallettspoint.com: large parallax
 * background image with slow vertical drift, overlaid with
 * oversized serif typography that slides in from opposite sides.
 *
 * Props:
 *   image    — Unsplash CDN URL
 *   alt      — image alt text
 *   line1    — top text line (slides from left)
 *   line2    — bottom text line (slides from right)
 *   height   — container height (default '70vh')
 *   overlay  — overlay darkness 0–1 (default 0.4)
 */

export default function ParallaxBreak({
  image,
  alt = '',
  line1 = '',
  line2 = '',
  height = '70vh',
  overlay = 0.4,
}) {
  const ref = useRef(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  // Parallax: image moves slower than scroll
  const imageY = useTransform(scrollYProgress, [0, 1], ['-15%', '15%']);
  // Text slides: line1 from left, line2 from right
  const line1X = useTransform(scrollYProgress, [0.1, 0.5], ['-8%', '0%']);
  const line2X = useTransform(scrollYProgress, [0.1, 0.5], ['8%', '0%']);
  // Text fades in
  const textOpacity = useTransform(scrollYProgress, [0.15, 0.35], [0, 1]);

  return (
    <section
      ref={ref}
      className="relative overflow-hidden"
      style={{ height }}
    >
      {/* Parallax background */}
      <motion.div
        style={{ y: imageY }}
        className="absolute inset-0 -top-[20%] -bottom-[20%]"
      >
        <img
          src={image}
          alt={alt}
          className="w-full h-full object-cover"
        />
      </motion.div>

      {/* Overlay */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: `rgba(26, 26, 46, ${overlay})` }}
      />

      {/* Typography overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10 px-4">
        <motion.p
          style={{ x: line1X, opacity: textOpacity }}
          className="font-serif text-4xl sm:text-5xl lg:text-7xl text-white/90 leading-tight text-center"
        >
          {line1}
        </motion.p>
        {line2 && (
          <motion.p
            style={{ x: line2X, opacity: textOpacity }}
            className="font-serif text-4xl sm:text-5xl lg:text-7xl text-gold leading-tight text-center mt-2"
          >
            {line2}
          </motion.p>
        )}
      </div>

      {/* Subtle top/bottom gradient edges */}
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-dark/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-dark/30 to-transparent" />
    </section>
  );
}
