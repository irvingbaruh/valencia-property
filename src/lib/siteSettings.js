'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

// Contact details shown on the site. The admin edits them under Ayarlar; these defaults
// are what visitors see until the saved values load (and if loading fails).
export const CONTACT_DEFAULTS = {
  phone: '+34 656 738 556',
  whatsapp: '34656738556',
  email: 'info@lockandloft.com',
};

const CACHE_KEY = 'll_contact_v1';

const readCache = () => {
  try {
    return { ...CONTACT_DEFAULTS, ...JSON.parse(sessionStorage.getItem(CACHE_KEY) || '{}') };
  } catch {
    return CONTACT_DEFAULTS;
  }
};

export const telHref = (phone) => `tel:${String(phone || '').replace(/[^\d+]/g, '')}`;
export const waDigits = (v) => String(v || '').replace(/\D/g, '');

export function useContactSettings() {
  const [contact, setContact] = useState(CONTACT_DEFAULTS);

  useEffect(() => {
    setContact(readCache());
    let alive = true;
    supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'contact')
      .maybeSingle()
      .then(({ data }) => {
        if (!alive || !data?.value) return;
        const next = { ...CONTACT_DEFAULTS, ...data.value };
        setContact(next);
        try {
          sessionStorage.setItem(CACHE_KEY, JSON.stringify(next));
        } catch {}
      });
    return () => {
      alive = false;
    };
  }, []);

  return contact;
}
