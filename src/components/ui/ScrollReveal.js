'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

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

  const opacity = useTransform(scrollYProgress, [start, end], [0, 1]);

  const y = useTransform(
    scrollYProgress,
    [start, end],
    [from === 'bottom' ? distance : 0, 0]
  );

  const x = useTransform(
    scrollYProgress,
    [start, end],
    [from === 'right' ? distance : from === 'left' ? -distance : 0, 0]
  );

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
