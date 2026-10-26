'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { Menu, X, Globe, ChevronDown } from 'lucide-react';

const localeLabels = {
  tr: 'Türkçe',
  es: 'Español',
  en: 'English',
  de: 'Deutsch',
};

const localeFlags = {
  tr: '🇹🇷',
  es: '🇪🇸',
  en: '🇬🇧',
  de: '🇩🇪',
};

export default function Header() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const switchLocale = (newLocale) => {
    const segments = pathname.split('/');
    segments[1] = newLocale;
    router.push(segments.join('/'));
    setLangOpen(false);
  };

  const navLinks = [
    { label: t('properties'), href: `/${locale}#properties` },
    { label: t('services'), href: `/${locale}#services` },
    { label: t('calculator'), href: `/${locale}#calculator` },
    { label: t('blog'), href: `/${locale}/blog` },
    { label: t('contact'), href: `/${locale}#contact` },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/90 backdrop-blur-xl shadow-card'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 md:h-20">
          {/* Logo */}
          <a href={`/${locale}`} className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-lg bg-gold flex items-center justify-center">
              <span className="text-white font-bold text-sm">VP</span>
            </div>
            <div className="flex flex-col">
              <span
                className={`font-serif text-lg leading-tight transition-colors ${
                  scrolled ? 'text-dark' : 'text-white'
                }`}
              >
                Valencia Property
              </span>
              <span
                className={`text-[10px] tracking-widest uppercase transition-colors ${
                  scrolled ? 'text-gold' : 'text-gold-light'
                }`}
              >
                RE/MAX Partner
              </span>
            </div>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  scrolled
                    ? 'text-text-secondary hover:text-dark hover:bg-soft'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right side: language + CTA + mobile toggle */}
          <div className="flex items-center gap-3">
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-sm transition-colors ${
                  scrolled
                    ? 'text-text-secondary hover:text-dark hover:bg-soft'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <Globe size={16} />
                <span className="hidden sm:inline">{localeFlags[locale]}</span>
                <ChevronDown size={14} className={`transition-transform ${langOpen ? 'rotate-180' : ''}`} />
              </button>

              {langOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setLangOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-44 bg-white rounded-lg shadow-card-hover border border-border py-1 z-50">
                    {Object.entries(localeLabels).map(([code, label]) => (
                      <button
                        key={code}
                        onClick={() => switchLocale(code)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors ${
                          code === locale
                            ? 'bg-gold-light text-dark font-medium'
                            : 'text-text-secondary hover:bg-soft hover:text-dark'
                        }`}
                      >
                        <span>{localeFlags[code]}</span>
                        <span>{label}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* CTA Button */}
            <a
              href={`/${locale}#contact`}
              className="hidden md:inline-flex items-center px-5 py-2.5 bg-gold text-white text-sm font-semibold rounded-lg hover:bg-gold-hover transition-colors shadow-gold"
            >
              {t('cta')}
            </a>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={`lg:hidden p-2 rounded-md transition-colors ${
                scrolled
                  ? 'text-dark hover:bg-soft'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-border shadow-card-hover">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="block px-3 py-2.5 text-text-secondary hover:text-dark hover:bg-soft rounded-md text-sm font-medium transition-colors"
              >
                {link.label}
              </a>
            ))}
            <div className="pt-3 border-t border-border mt-3">
              <a
                href={`/${locale}#contact`}
                className="block w-full text-center px-5 py-3 bg-gold text-white font-semibold rounded-lg hover:bg-gold-hover transition-colors"
              >
                {t('cta')}
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
