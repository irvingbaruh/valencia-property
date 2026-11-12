'use client';

import { useTranslations, useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';
import Logo from '@/components/brand/Logo';
import { MapPin, Phone, Mail } from 'lucide-react';
import { localePath } from '@/lib/routes';
import { useContactSettings, telHref } from '@/lib/siteSettings';
import InstallButton from '@/components/app/InstallButton';

// Sosyal hesap adresleri. Gerçek adresi buraya yaz.
const SOCIAL = { instagram: '#', facebook: '#', linkedin: '#' };
// '#' = henüz adres yok: ikon görünür ama yeni sekme açmaz.
const ext = (u) => (u && u !== '#' ? { target: '_blank', rel: 'noopener noreferrer' } : {});

export default function Footer() {
  const t = useTranslations('footer');
  const locale = useLocale();
  const pathname = usePathname();
  const contact = useContactSettings();

  const columns = [
    {
      title: t('about'),
      links: [
        { label: t('about_us'), href: localePath(locale, 'hakkimizda') },
        { label: t('remax'), href: localePath(locale, 'remax') },
      ],
    },
    {
      title: t('services_title'),
      links: [
        { label: t('blog'), href: `/${locale}/blog/` },
        { label: t('roi_calc'), href: localePath(locale, 'roi-hesaplama') },
        { label: t('faq'), href: localePath(locale, 'sss') },
        { label: t('glossary'), href: localePath(locale, 'sozluk') },
      ],
    },
  ];

  if (/\/admin(\/|$)/.test(pathname || '')) return null;

  return (
    <footer className="bg-dark text-white">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Logo variant="dark" className="h-12 w-auto mb-5" />
            <p className="text-sm text-white leading-relaxed mb-6 max-w-xs">
              {t('remax_note')}
            </p>
            <span className="inline-block bg-white rounded-lg px-3 py-2 mb-6">
              <img src="/brand/remax-logo.png" alt="RE/MAX" width={96} height={26} className="h-6 w-auto" loading="lazy" />
            </span>
          </div>

          {/* Link Columns */}
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold text-white mb-4 tracking-wide">
                {col.title}
              </h3>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-white hover:text-gold transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact / Social Column */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4 tracking-wide">
              {t('contact')}
            </h3>
            <div className="space-y-3 text-sm mb-6 text-white">
              <div className="flex items-center gap-2">
                <MapPin size={15} className="text-gold shrink-0" />
                <span>{t('address')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={15} className="text-gold shrink-0" />
                <a href={telHref(contact.phone)} className="hover:text-gold transition-colors">
                  {contact.phone}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={15} className="text-gold shrink-0" />
                <a href={`mailto:${contact.email}`} className="hover:text-gold transition-colors">
                  {contact.email}
                </a>
              </div>
            </div>
            <div className="mb-5 empty:hidden"><InstallButton /></div>
            <div className="flex gap-3 mb-6 empty:hidden">
              {SOCIAL.instagram && (
              <a
                href={SOCIAL.instagram} {...ext(SOCIAL.instagram)}
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-gold transition-colors"
                aria-label="Instagram"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </a>
              )}
              {SOCIAL.facebook && (
              <a
                href={SOCIAL.facebook} {...ext(SOCIAL.facebook)}
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-gold transition-colors"
                aria-label="Facebook"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              )}
              {SOCIAL.linkedin && (
              <a
                href={SOCIAL.linkedin} {...ext(SOCIAL.linkedin)}
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-gold transition-colors"
                aria-label="LinkedIn"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
              </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-white">
            {t('copyright')}
          </p>
          <a href={localePath(locale, 'gizlilik')} className="text-xs text-white hover:text-gold transition-colors">
            {t('privacy')}
          </a>
        </div>
      </div>
    </footer>
  );
}
