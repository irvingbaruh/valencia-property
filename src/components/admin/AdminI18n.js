'use client';
import { useEffect, useSyncExternalStore } from 'react';
import { initAdminLang, getAdminLang, setAdminLang, subscribeAdminLang } from '@/lib/adminI18n';

export function useAdminLang() {
  return useSyncExternalStore(subscribeAdminLang, getAdminLang, () => 'tr');
}

export default function AdminI18n() {
  useEffect(() => { initAdminLang(); }, []);
  return null;
}

export function LangSwitch({ className = '' }) {
  const lang = useAdminLang();
  const btn = (code) => (
    <button
      type="button"
      onClick={() => setAdminLang(code)}
      aria-pressed={lang === code}
      className="px-3 py-1 rounded-md text-xs font-semibold transition-colors"
      style={lang === code ? { background: '#C9A84C', color: '#0B0B11' } : { color: '#9A9AAA' }}
    >
      {code.toUpperCase()}
    </button>
  );
  return (
    <div data-no-i18n className={`inline-flex items-center gap-1 p-1 rounded-lg ${className}`} style={{ background: '#1E1E2E' }} role="group" aria-label="Language">
      {btn('tr')}{btn('en')}
    </div>
  );
}
