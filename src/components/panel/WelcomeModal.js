'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { Search, Bell, Smartphone, Compass, X } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { localePath } from '@/lib/routes';
import { gt } from '@/lib/growthText';
import { trackFunnel } from '@/lib/funnel';

const ICONS = { search: Search, push: Bell, app: Smartphone, guide: Compass };

// Shown once to a member who has just joined: the four things that make the account worth having.
export default function WelcomeModal({ goTab }) {
  const locale = useLocale();
  const { user, profile } = useAuth();
  const w = gt(locale).welcome;
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user || !profile?.created_at) return;
    const fresh = Date.now() - new Date(profile.created_at).getTime() < 7 * 864e5; // only new members, not everyone who signed up earlier
    let seen = true;
    try { seen = localStorage.getItem(`ll_welcome_${user.id}`) === '1'; } catch {}
    if (fresh && !seen) {
      setOpen(true);
      trackFunnel('welcome_view');
    }
  }, [user, profile]);

  if (!open) return null;

  const close = () => {
    setOpen(false);
    try { localStorage.setItem(`ll_welcome_${user.id}`, '1'); } catch {}
  };
  const act = (key) => {
    trackFunnel('welcome_go', key);
    close();
    if (key === 'search') window.location.href = localePath(locale, 'mulkler');
    else goTab(key === 'guide' ? 'guide' : 'settings');
  };

  return (
    <div className="fixed inset-0 z-[90] bg-black/60 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="welcome-title" onClick={close}>
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 sm:p-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <button type="button" onClick={close} aria-label="×" className="absolute top-4 right-4 w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500">
          <X size={18} />
        </button>
        <h2 id="welcome-title" className="font-serif text-2xl text-[var(--color-dark)] mb-1">{w.title}</h2>
        <p className="text-[var(--color-charcoal)] mb-5">{w.text}</p>
        <ul className="space-y-3">
          {w.steps.map(([key, title, text]) => {
            const Icon = ICONS[key];
            return (
              <li key={key}>
                <button type="button" onClick={() => act(key)} className="w-full text-left flex items-start gap-3 rounded-xl border border-gray-200 hover:border-[var(--color-gold)] p-4 transition-colors">
                  <span className="w-10 h-10 rounded-xl bg-[var(--color-gold)]/10 flex items-center justify-center shrink-0"><Icon className="w-5 h-5 text-[var(--color-gold)]" /></span>
                  <span className="flex-1">
                    <span className="block font-medium text-[var(--color-dark)]">{title}</span>
                    <span className="block text-sm text-[var(--color-charcoal)]">{text}</span>
                  </span>
                  <span className="text-sm font-semibold text-[var(--color-gold)] self-center">{w.go}</span>
                </button>
              </li>
            );
          })}
        </ul>
        <button type="button" onClick={close} className="mt-6 w-full rounded-xl bg-[var(--color-gold)] text-white font-semibold py-3 hover:opacity-90 transition-opacity">
          {w.start}
        </button>
      </div>
    </div>
  );
}
