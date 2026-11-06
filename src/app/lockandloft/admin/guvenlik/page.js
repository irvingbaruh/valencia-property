'use client';

import { useEffect } from 'react';

// Security settings now live under Ayarlar > Hesabım; keep old bookmarks working.
export default function AdminSecurityRedirect() {
  useEffect(() => {
    window.location.replace('/lockandloft/admin/ayarlar/?tab=account');
  }, []);
  return null;
}
