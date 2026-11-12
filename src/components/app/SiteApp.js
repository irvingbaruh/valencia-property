'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useAuth } from '@/components/providers/AuthProvider';
import { localePath } from '@/lib/routes';
import AppTabBar from '@/components/app/AppTabBar';
import { Download, X } from 'lucide-react';
import { registerSiteWorker, isIos, isStandalone } from '@/lib/memberPush';
import InstallSteps from '@/components/app/InstallSteps';
import { supabase } from '@/lib/supabase';
import { trackFunnel } from '@/lib/funnel';

// Registers the site service worker, keeps the browser's install prompt for later, and shows a small
// "add to your phone" banner to phone visitors (once every two weeks, never inside the installed app).
let deferred = null;
const listeners = new Set();
export const getInstallPrompt = () => deferred;
export const onInstallPrompt = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };

const SNOOZE_KEY = 'll_app_banner_until';
const platformOf = () => (isIos() ? 'ios' : /Android/i.test(navigator.userAgent) ? 'android' : 'desktop');

export default function SiteApp() {
  const t = useTranslations('memberApp');
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();
  const { user, loading } = useAuth();
  const [standalone, setStandalone] = useState(false);
  const [show, setShow] = useState(false);
  const [ios, setIos] = useState(false);
  const [guide, setGuide] = useState(false);
  const userRef = useRef(null);
  userRef.current = user;

  // Which members have the installed app: written to their profile when they open it, and counted in the funnel.
  useEffect(() => {
    if (loading || !isStandalone()) return;
    let sent = false;
    try { sent = sessionStorage.getItem('ll_app_open') === '1'; } catch {}
    if (!sent) {
      trackFunnel('app_open', platformOf());
      try { sessionStorage.setItem('ll_app_open', '1'); } catch {}
    }
    if (user) supabase.rpc('mark_app_open', { p_platform: platformOf() }).then(() => {}, () => {});
  }, [loading, user]);

  useEffect(() => {
    registerSiteWorker();
    const sa = isStandalone();
    setStandalone(sa);
    if (sa) document.documentElement.classList.add('ll-standalone');
    const onPrompt = (e) => { e.preventDefault(); deferred = e; listeners.forEach((f) => f()); };
    const onInstalled = () => {
      deferred = null; setShow(false); listeners.forEach((f) => f());
      trackFunnel('app_install', platformOf());
      if (userRef.current) supabase.rpc('mark_app_open', { p_platform: platformOf() }).then(() => {}, () => {});
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    setIos(isIos());
    let snoozed = false;
    try { snoozed = Number(localStorage.getItem(SNOOZE_KEY) || 0) > Date.now(); } catch {}
    const phone = window.matchMedia('(max-width: 767px)').matches;
    let timer;
    if (phone && !snoozed && !isStandalone()) timer = setTimeout(() => setShow(true), 9000);
    return () => { clearTimeout(timer); window.removeEventListener('beforeinstallprompt', onPrompt); window.removeEventListener('appinstalled', onInstalled); };
  }, []);

  const dismiss = () => {
    setShow(false);
    try { localStorage.setItem(SNOOZE_KEY, String(Date.now() + 14 * 864e5)); } catch {}
  };
  const install = async () => {
    if (deferred) {
      deferred.prompt();
      try { await deferred.userChoice; } catch {}
      deferred = null;
      dismiss();
    } else {
      setGuide(true);
    }
  };

  // Only offer it when the browser can actually install (Android prompt) or on iPhone (guide).
  const canOffer = show && !/\/panel|\/mi-cuenta|\/account|\/mein-konto/.test(pathname || '') && (ios || deferred);
  const inAdmin = /\/lockandloft\//.test(pathname || '');
  if (standalone) return inAdmin ? null : <AppTabBar />;
  if (!canOffer && !guide) return null;

  return (
    <>
      {canOffer && !guide && (
        <div className="fixed left-3 right-3 bottom-3 z-40 md:hidden rounded-2xl bg-[#0B0B11] text-white border border-[#C9A84C]/40 shadow-2xl p-4 pr-10 flex items-center gap-3" role="dialog" aria-label={t('bannerTitle')}>
          <img src="/brand/app-192.png" alt="" width={44} height={44} className="rounded-xl shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold leading-tight">{t('bannerTitle')}</p>
            <p className="text-xs text-white/70 mt-0.5 leading-snug">{t('bannerText')}</p>
          </div>
          <button onClick={install} className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-[#C9A84C] text-[#0B0B11] text-xs font-semibold px-3 py-2">
            <Download size={14} /> {t('installShort')}
          </button>
          <button onClick={dismiss} className="absolute top-2 right-2 p-1.5 text-white/60" aria-label={t('close')}><X size={16} /></button>
        </div>
      )}
      {guide && <InstallSteps onClose={() => { setGuide(false); dismiss(); }} />}
    </>
  );
}
