'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Bell } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { supabase } from '@/lib/supabase';
import { isIos, isStandalone, pushCapable, currentSubscription, enableMemberPush } from '@/lib/memberPush';
import InstallButton from '@/components/app/InstallButton';

// A switch at the top of the member panel: notifications are off until the member turns them on here.
export default function PushQuickCard() {
  const t = useTranslations('memberApp');
  const locale = useLocale();
  const { user } = useAuth();
  const [state, setState] = useState('hidden'); // hidden | off | install
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    let off = false;
    (async () => {
      if (isIos() && !isStandalone()) { setState('install'); return; }
      if (!pushCapable()) return;
      const sub = await currentSubscription();
      let on = false;
      if (sub && user) {
        const { data } = await supabase.from('push_subscriptions').select('id').eq('endpoint', sub.endpoint).eq('user_id', user.id).maybeSingle();
        on = !!data;
      }
      if (!off) setState(on ? 'hidden' : 'off');
    })();
    return () => { off = true; };
  }, [user]);

  if (state === 'hidden') return null;

  const turnOn = async () => {
    setBusy(true); setErr('');
    try {
      const r = await enableMemberPush(user.id, locale);
      if (r.ok) setState('hidden');
      else setErr(t(r.reason === 'denied' ? 'pushDenied' : 'pushFailed'));
    } catch { setErr(t('pushFailed')); } finally { setBusy(false); }
  };

  return (
    <div className="mb-6 dark-card rounded-2xl shadow-sm p-5 border border-[var(--color-gold)]/40 flex items-center gap-4">
      <Bell className="w-6 h-6 text-[var(--color-gold)] shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-[var(--color-dark)] text-sm">{t('quickTitle')}</p>
        <p className="text-xs text-[var(--color-charcoal)] mt-0.5">{state === 'install' ? t('quickNeedInstall') : t('quickText')}</p>
        {err && <p className="text-xs text-red-600 mt-1">{err}</p>}
      </div>
      {state === 'install' ? (
        <InstallButton className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-[#C9A84C] text-[#0B0B11] text-xs font-semibold px-3 py-2" />
      ) : (
        <button type="button" role="switch" aria-checked="false" aria-label={t('quickTitle')} onClick={turnOn} disabled={busy}
          className="shrink-0 relative w-14 h-8 rounded-full bg-gray-500/50 disabled:opacity-60 transition-colors">
          <span className="absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow" />
        </button>
      )}
    </div>
  );
}
