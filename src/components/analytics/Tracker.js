'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { captureAttribution } from '@/lib/attribution';

// Cookieless first-party analytics: page views, clicks and listing impressions.
// Stored in the browser: an "ignore me" flag on the admins' own devices and the first-visit source (lib/attribution.js).
const ENDPOINT = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/track`;
const LISTING_RE = /ilan\/\?id=([0-9a-f-]{36})/i;

const skip = () => {
  try {
    return localStorage.getItem('ll_notrack') === '1' || navigator.webdriver;
  } catch {
    return false;
  }
};

export default function Tracker() {
  const pathname = usePathname();
  const queue = useRef([]);
  const timer = useRef(null);
  const seen = useRef(new Set());

  const flush = () => {
    clearTimeout(timer.current);
    timer.current = null;
    if (!queue.current.length) return;
    const body = JSON.stringify({ events: queue.current.splice(0, 20) });
    try {
      if (!(navigator.sendBeacon && navigator.sendBeacon(ENDPOINT, new Blob([body], { type: 'text/plain' })))) {
        fetch(ENDPOINT, { method: 'POST', body, keepalive: true, headers: { 'Content-Type': 'text/plain' } }).catch(() => {});
      }
    } catch {}
  };
  const push = (ev) => {
    if (skip()) return;
    queue.current.push({ p: window.location.pathname, l: window.location.pathname.split('/')[1], ...ev });
    if (!timer.current) timer.current = setTimeout(flush, 1500);
  };

  // page views (also fires on client-side navigation)
  useEffect(() => {
    seen.current = new Set();
    let ref = '';
    try {
      const u = document.referrer && new URL(document.referrer);
      if (u && u.host !== window.location.host) ref = u.host.replace(/^www\./, '');
    } catch {}
    const m = window.location.pathname.includes('/ilan') ? LISTING_RE.exec(`ilan/${window.location.search}`) : null;
    // campaign tags (utm_source / utm_campaign) of this visit; the first-touch source is remembered for sign-up
    const tags = skip() ? {} : captureAttribution();
    push({ k: 'view', r: ref, id: m ? m[1] : undefined, ...tags });
  }, [pathname]);

  useEffect(() => {
    const labelOf = (el) => {
      const explicit = el.getAttribute('data-track') || el.getAttribute('aria-label');
      const text = explicit || (el.innerText || '').replace(/\s+/g, ' ').trim();
      return text.slice(0, 80);
    };
    const onClick = (e) => {
      const el = e.target.closest && e.target.closest('a[href], button');
      if (!el) return;
      const href = el.tagName === 'A' ? el.getAttribute('href') || '' : '';
      const lm = LISTING_RE.exec(href);
      if (lm) {
        push({ k: 'listing_click', id: lm[1], lb: labelOf(el) });
        return;
      }
      let target = href;
      if (/^https?:/i.test(href)) {
        try {
          const u = new URL(href);
          target = u.host === window.location.host ? u.pathname : u.host;
        } catch {}
      }
      const label = labelOf(el);
      if (!label && !target) return;
      push({ k: 'click', lb: label, t: target });
    };
    document.addEventListener('click', onClick, { capture: true, passive: true });
    const onHide = () => document.visibilityState === 'hidden' && flush();
    document.addEventListener('visibilitychange', onHide);
    window.addEventListener('pagehide', flush);

    // listing impressions: a card counts once per page view, when at least half is on screen
    const io = new IntersectionObserver(
      (entries) => {
        for (const en of entries) {
          if (!en.isIntersecting) continue;
          const a = en.target.__a;
          const m = a && LISTING_RE.exec(a.getAttribute('href') || '');
          if (!m || seen.current.has(m[1])) continue;
          seen.current.add(m[1]);
          io.unobserve(en.target);
          push({ k: 'listing_view', id: m[1] });
        }
      },
      { threshold: 0.5 }
    );
    const watched = new WeakSet();
    const scan = () => {
      document.querySelectorAll('a[href*="ilan/?id="]').forEach((a) => {
        if (watched.has(a)) return;
        watched.add(a);
        // anchors rendered with display:contents have no box of their own; watch their first child
        const box = getComputedStyle(a).display === 'contents' ? a.firstElementChild : a;
        if (!box) return;
        box.__a = a;
        io.observe(box);
      });
    };
    scan();
    const mo = new MutationObserver(() => scan());
    mo.observe(document.body, { childList: true, subtree: true });

    // signup-funnel steps from trackFunnel() (lib/funnel.js); steps sent before this mounted are queued
    const onFunnel = (e) => {
      const d = e.detail || {};
      if (d.step) push({ k: 'funnel', lb: String(d.step).slice(0, 40), t: String(d.ctx || '').slice(0, 60) });
    };
    window.addEventListener('ll:funnel', onFunnel);
    window.__llFunnelReady = true;
    (window.__llFunnelQ || []).splice(0).forEach((d) => onFunnel({ detail: d }));

    return () => {
      document.removeEventListener('click', onClick, { capture: true });
      document.removeEventListener('visibilitychange', onHide);
      window.removeEventListener('pagehide', flush);
      window.removeEventListener('ll:funnel', onFunnel);
      window.__llFunnelReady = false;
      io.disconnect();
      mo.disconnect();
    };
  }, []);

  return null;
}
