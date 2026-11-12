'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Smartphone, Bell, ArrowRight } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { localePath } from '@/lib/routes';
import InstallButton from '@/components/app/InstallButton';

// Invitation to add the app and join. Visitors are sent to sign up first (notifications are for members);
// members can add the app and turn on notifications. variant: 'strip' (home page) | 'listing' (listing page).
export default function AppPromo({ variant = 'strip' }) {
  const t = useTranslations('memberApp');
  const locale = useLocale();
  const { user, loading } = useAuth();
  const [standalone, setStandalone] = useState(false);
  useEffect(() => { setStandalone(window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true); }, []);

  const join = `${localePath(locale, 'giris')}?app=1`;
  const settings = `${localePath(locale, 'panel')}?tab=settings`;
  const member = !loading && !!user;

  if (variant === 'listing') {
    return (
      <div className="mt-5 rounded-xl border border-gold/40 bg-gold-light/40 p-4">
        <p className="text-sm text-dark flex gap-2"><Bell size={16} className="text-gold shrink-0 mt-0.5" />{t('listingNote')}</p>
        <a href={member ? settings : join} className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-dark hover:text-gold">
          {member ? t('promoEnable') : t('listingJoin')} <ArrowRight size={14} />
        </a>
      </div>
    );
  }

  return (
    <section className="bg-dark text-white" aria-label={t('promoTitle')}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col md:flex-row md:items-center gap-6">
        <img src="/brand/app-192.png" alt="" width={64} height={64} className="rounded-2xl shrink-0" loading="lazy" />
        <div className="flex-1">
          <h2 className="font-serif text-2xl md:text-3xl mb-2">{t('promoTitle')}</h2>
          <p className="text-white/80 max-w-xl">{t('promoText')}</p>
        </div>
        <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row gap-3 shrink-0">
          {member ? (
            <>
              {!standalone && <InstallButton className="inline-flex items-center justify-center gap-2 rounded-xl bg-gold text-dark font-semibold px-5 py-3 text-sm" />}
              <a href={settings} className="inline-flex items-center justify-center gap-2 rounded-xl border border-gold/60 px-5 py-3 text-sm hover:bg-gold hover:text-dark transition-colors"><Bell size={15} />{t('promoEnable')}</a>
            </>
          ) : (
            <a href={join} className="inline-flex items-center justify-center gap-2 rounded-xl bg-gold text-dark font-semibold px-5 py-3 text-sm"><Smartphone size={16} />{t('promoJoin')}</a>
          )}
        </div>
      </div>
    </section>
  );
}
