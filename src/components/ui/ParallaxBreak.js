'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion';

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
 *   video    — optional mp4 path. When it loads, it replaces the image and is
 *              scrubbed by scroll (down = forward, up = backward). The image
 *              stays as the poster/fallback if the file is missing or the
 *              visitor prefers reduced motion.
 */

export default function ParallaxBreak({
  image,
  alt = '',
  line1 = '',
  line2 = '',
  height = '70vh',
  overlay = 0.4,
  video = '',
}) {
  const ref = useRef(null);
  const videoRef = useRef(null);
  const rafRef = useRef(0);
  const [videoReady, setVideoReady] = useState(false);

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

  // Scroll-scrubbed video: map section progress to playback time.
  useMotionValueEvent(scrollYProgress, 'change', (p) => {
    const v = videoRef.current;
    if (!v || !videoReady || !v.duration) return;
    const t = Math.min(1, Math.max(0, (p - 0.05) / 0.9)) * v.duration;
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      if (Math.abs(v.currentTime - t) > 0.03) v.currentTime = t;
    });
  });

  useEffect(() => {
    const v = videoRef.current;
    if (!v || !video) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    v.muted = true; // React renders the muted attribute unreliably; iOS needs the property
    v.setAttribute('webkit-playsinline', '');
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      try { v.pause(); v.currentTime = 0; } catch (e) {}
      setVideoReady(true);
    };
    // Mobile browsers (iOS, data saver) often skip preloading and never fire
    // 'loadeddata' until play() is called, and iOS only allows seeking after
    // a first play. So: force load, start a muted play, pause on first frame.
    const kick = () => {
      if (done) return;
      const pr = v.play();
      if (pr && pr.then) pr.then(() => { if (v.readyState >= 2) finish(); }).catch(() => {});
    };
    v.addEventListener('playing', finish, { once: true });
    v.addEventListener('loadeddata', kick, { once: true });
    v.load();
    kick();
    // Low-power / blocked autoplay: retry on the first touch or scroll.
    const retry = () => kick();
    window.addEventListener('touchstart', retry, { once: true, passive: true });
    window.addEventListener('scroll', retry, { once: true, passive: true });
    return () => {
      v.removeEventListener('playing', finish);
      v.removeEventListener('loadeddata', kick);
      window.removeEventListener('touchstart', retry);
      window.removeEventListener('scroll', retry);
      cancelAnimationFrame(rafRef.current);
    };
  }, [video]);

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
        {video && (
          <video
            ref={videoRef}
            src={video}
            muted
            playsInline
            preload="auto"
            aria-hidden="true"
            tabIndex={-1}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${videoReady ? 'opacity-100' : 'opacity-0'}`}
          />
        )}
      </motion.div>

      {/* Overlay */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: `rgba(11, 11, 17, ${overlay})` }}
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
