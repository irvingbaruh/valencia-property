'use client';

import { useEffect } from 'react';

/**
 * When the homepage is loaded with a URL hash (e.g. arriving from
 * "/hizmetler/renovasyon" via a header link to "/tr#services"), the browser
 * jumps to the anchor instantly before the page has finished laying out —
 * and it's an abrupt cut rather than a scroll. This smooth-scrolls to the
 * hash target shortly after mount instead, so navigating in from any page
 * feels the same as clicking the nav while already on the homepage.
 */
export default function ScrollToHash() {
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;

    const id = hash.slice(1);
    // Let layout/images settle first so scrollIntoView targets the right spot.
    const timer = setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 120);

    return () => clearTimeout(timer);
  }, []);

  return null;
}
