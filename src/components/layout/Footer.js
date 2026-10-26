'use client';

import { useTranslations, useLocale } from 'next-intl';
import { MapPin, Phone, Mail } from 'lucide-react';

export default function Footer() {
  const t = useTranslations('footer');
  const locale = useLocale();

  const columns = [
    {
      title: t('about'),
      links: [
        { label: t('about_us'), href: `/${locale}/about` },
        { label: t('team'), href: `/${locale}/team` },
        { label: t('remax'), href: `/${locale}/remax` },
      ],
    },
    {
      title: t('services_title'),
      links: [
        { label: t('resources'), href: `/${locale}/blog` },
        { label: t('roi_calc'), href: `/${locale}#calculator` },
        { label: t('faq'), href: `/${locale}/faq` },
        { label: t('glossary'), href: `/${locale}/glossary` },
      ],
    },
  ];

  return (
    <footer className="bg-dark text-white">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-9 h-9 rounded-lg bg-gold flex items-center justify-center">
                <span className="text-white font-bold text-sm">VP</span>
              </div>
              <div>
                <span className="font-serif text-lg text-white">Valencia Property</span>
              </div>
            </div>
            <p className="text-sm text-white/60 leading-relaxed mb-6 max-w-xs">
              {t('remax_note')}
            </p>
            <div className="space-y-3 text-sm text-white/60">
              <div className="flex items-center gap-2">
                <MapPin size={15} className="text-gold shrink-0" />
                <span>{t('address')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={15} className="text-gold shrink-0" />
                <a href="tel:+34600000000" className="hover:text-gold transition-colors">
                  +34 600 000 000
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={15} className="text-gold shrink-0" />
                <a href="mailto:info@valenciaproperty.com" className="hover:text-gold transition-colors">
                  info@valenciaproperty.com
                </a>
              </div>
            </div>
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
                      className="text-sm text-white/60 hover:text-gold transition-colors"
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
            <div className="flex gap-3 mb-6">
              <a
                href="#"
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-gold transition-colors"
                aria-label="Instagram"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-gold transition-colors"
                aria-label="Facebook"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-gold transition-colors"
                aria-label="LinkedIn"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-white/40">
            {t('copyright')}
          </p>
          <p className="text-xs text-white/40">
            {t('remax_note')}
          </p>
        </div>
      </div>
    </footer>
  );
}
