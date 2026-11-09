'use client';

import { useEffect } from 'react';

// Registers the admin service worker (push notifications) and asks the phone to keep the
// login data, so the app stays signed in.
export default function AdminPwa() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/lockandloft/admin/sw.js', { scope: '/lockandloft/admin/' }).catch(() => {});
    }
    try {
      navigator.storage && navigator.storage.persist && navigator.storage.persist();
    } catch {}
  }, []);
  return null;
}
