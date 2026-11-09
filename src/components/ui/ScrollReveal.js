'use client';

import { motion, useTransform, useMotionValue } from 'framer-motion';
import { useEffect, useRef } from 'react';

/**
 * Scroll-progress-driven reveal component.
 * Animation is tied to scroll position, so scrolling up literally
 * rewinds the entrance animation (elements slide back out the way they came).
 *
 * Progress is computed from the element's LIVE position on every scroll frame (not from cached offsets),
 * so it cannot go stale after a browser Back/restored scroll position or a layout shift, and an element
 * that is on screen always ends up fully visible.
 *
 * @param {string} from - 'bottom' | 'left' | 'right' — direction element enters from
 * @param {number} delay - 0–0.15, shifts animation range for staggering children
 * @param {number} distance - pixels to travel (default 40)
 */

// One shared scroll listener for every ScrollReveal on the page.
const active = new Set();
let queued = false;
let bound = false;
function flush() {
  queued = false;
  active.forEach((fn) => fn());
}
function schedule() {
  if (queued) return;
  queued = true;
  requestAnimationFrame(flush);
}
function bind() {
  if (bound || typeof window === 'undefined') return;
  bound = true;
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  window.addEventListener('pageshow', schedule);
  window.addEventListener('load', schedule);
  window.addEventListener('orientationchange', schedule);
}

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
  const progress = useMotionValue(0);

  // Animation happens in the first ~10% of the element's scroll range
  // (when it first enters the viewport from the bottom).
  const start = 0.02 + delay;
  const end = 0.1 + delay;

  const opacity = useTransform(progress, [start, end], [0, 1]);
  const y = useTransform(progress, [start, end], [from === 'bottom' ? distance : 0, 0]);
  const x = useTransform(progress, [start, end], [from === 'right' ? distance : from === 'left' ? -distance : 0, 0]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    bind();

    const update = () => {
      const vh = window.innerHeight || document.documentElement.clientHeight;
      const r = el.getBoundingClientRect();
      // position without our own transform, so the animation cannot feed back into the measurement
      const top = r.top - (Number(y.get()) || 0);
      const p = (vh - top) / (vh + r.height);
      progress.set(Math.min(1, Math.max(0, p)));
    };
    update();

    let io;
    if (typeof IntersectionObserver !== 'undefined') {
      io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) active.add(update);
          else { active.delete(update); update(); } // settle at 0 (below screen) or 1 (above screen)
        });
      }, { rootMargin: '60% 0px 60% 0px', threshold: 0 });
      io.observe(el);
    } else {
      active.add(update);
    }
    // late layout shifts (images, fonts, async content)
    const t1 = setTimeout(update, 400);
    const t2 = setTimeout(update, 1500);
    return () => {
      active.delete(update);
      if (io) io.disconnect();
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [progress, y]);

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
