'use client';

import { motion, useScroll, useTransform, useMotionValue } from 'framer-motion';
import { useEffect, useRef } from 'react';

/**
 * Scroll-progress-driven reveal component.
 * Animation is tied to scroll position, so scrolling up literally
 * rewinds the entrance animation (elements slide back out the way they came).
 *
 * @param {string} from - 'bottom' | 'left' | 'right' — direction element enters from
 * @param {number} delay - 0–0.15, shifts animation range for staggering children
 * @param {number} distance - pixels to travel (default 40)
 */
export default function ScrollReveal({
  children,
  className,
  from = 'bottom',
  delay = 0,
  distance = 40,
  style: extraStyle,
  ...props
}) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  // Animation happens in the first ~10% of the element's scroll range
  // (when it first enters the viewport from the bottom), so it finishes
  // almost immediately after the element becomes visible rather than
  // staying visibly mid-fade (washed out / low-opacity) for a long
  // stretch of scrolling.
  // Scrolling back up rewinds through this exact same range.
  const start = 0.02 + delay;
  const end = 0.1 + delay;

  // Safety latch: if the scroll position is restored (browser Back) or the layout shifted after the
  // offsets were measured, scroll progress can be stale and leave a visible element faded or shifted
  // sideways. Once the element has really entered the screen we lock it to its final state.
  const seen = useMotionValue(0);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') { seen.set(1); return undefined; }
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { seen.set(1); io.disconnect(); }
    }, { rootMargin: '0px 0px -22% 0px', threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, [seen]);

  const opacityScrub = useTransform(scrollYProgress, [start, end], [0, 1]);
  const yScrub = useTransform(scrollYProgress, [start, end], [from === 'bottom' ? distance : 0, 0]);
  const xScrub = useTransform(scrollYProgress, [start, end], [from === 'right' ? distance : from === 'left' ? -distance : 0, 0]);

  const opacity = useTransform([opacityScrub, seen], ([o, v]) => (v ? 1 : o));
  const y = useTransform([yScrub, seen], ([o, v]) => (v ? 0 : o));
  const x = useTransform([xScrub, seen], ([o, v]) => (v ? 0 : o));

  return (
    <motion.div
      ref={ref}
      style={{ opacity, y, x, ...extraStyle }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}
