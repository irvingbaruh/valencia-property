'use client';

import { useTranslations, useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';
import { Home, Building2, TrendingUp, User } from 'lucide-react';
import { localePath } from '@/lib/routes';
import { useAuth } from '@/components/providers/AuthProvider';
import { useContactSettings, waDigits } from '@/lib/siteSettings';
import { trackFunnel } from '@/lib/funnel';
import { WA, WaIcon } from '@/components/chat/ChatWidget';

// Bottom navigation, only inside the installed app. My account is the raised button on the left,
// members also get a raised WhatsApp button on the right (the AI advisor floats just above it).
export default function AppTabBar() {
  const t = useTranslations('memberApp');
  const locale = useLocale();
  const pathname = usePathname() || '';
  const { user, profile } = useAuth();
  const contact = useContactSettings();
  const wa = WA[locale] || WA.en;
  const showWa = !!user && !!profile && profile.role !== 'admin' && !!waDigits(contact.whatsapp);
  const items = [
    { href: localePath(locale, 'panel'), label: t('tabAccount'), icon: User, match: (p) => p.startsWith(localePath(locale, 'panel').replace(/\/$/, '')) },
    { href: `/${locale}/`, label: t('tabHome'), icon: Home, match: (p) => p === `/${locale}` || p === `/${locale}/` },
    { href: localePath(locale, 'mulkler'), label: t('tabListings'), icon: Building2, match: (p) => p.startsWith(localePath(locale, 'mulkler').replace(/\/$/, '')) },
    { href: localePath(locale, 'piyasa'), label: t('tabMarket'), icon: TrendingUp, match: (p) => p.startsWith(localePath(locale, 'piyasa').replace(/\/$/, '')) },
  ];
  return (
    <nav className={`fixed bottom-0 inset-x-0 z-30 bg-[#0B0B11] border-t border-white/10 grid ${showWa ? 'grid-cols-5' : 'grid-cols-4'}`} style={{ paddingBottom: 'env(safe-area-inset-bottom)' }} aria-label="App">
      {items.map(({ href, label, icon: Icon, match }) => {
        const on = match(pathname);
        if (Icon === User) {
          return (
            <a key={href} href={href} className="flex flex-col items-center gap-0.5 pb-2 text-[11px] font-semibold text-[#C9A84C]" aria-current={on ? 'page' : undefined}>
              <span className={`-mt-5 flex h-12 w-12 items-center justify-center rounded-full bg-[#C9A84C] text-[#0B0B11] shadow-lg ring-4 ring-[#0B0B11] ${on ? 'brightness-110' : ''}`}><User size={22} /></span>
              {label}
            </a>
          );
        }
        return (
          <a key={href} href={href} className={`flex flex-col items-center gap-1 py-2.5 text-[11px] ${on ? 'text-[#C9A84C]' : 'text-white/70'}`} aria-current={on ? 'page' : undefined}>
            <Icon size={20} />{label}
          </a>
        );
      })}
      {showWa && (
        <a
          href={`https://wa.me/${waDigits(contact.whatsapp)}?text=${encodeURIComponent(wa.text(profile?.full_name || ''))}`}
          target="_blank" rel="noopener noreferrer" aria-label={wa.label} data-track="whatsapp_bubble"
          onClick={() => trackFunnel('wa_click', 'tabbar')}
          className="flex flex-col items-center gap-0.5 pb-2 text-[11px] font-semibold text-[#25D366]"
        >
          <span className="-mt-5 flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] shadow-lg ring-4 ring-[#0B0B11]"><WaIcon size={26} /></span>
          WhatsApp
        </a>
      )}
    </nav>
  );
}
