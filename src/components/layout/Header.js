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
    // On desktop, the hero's photo-mosaic zooms to fill the screen over a 250vh
    // scroll section — keep the header transparent (with the top gradient for
    // contrast) until that zoom has finished, so the white background doesn't
    // snap in while the enlarging image is still mid-animation.
    // On mobile the hero is a single full-bleed image with no scroll-zoom, so
    // switch over almost immediately.
    let threshold = window.innerWidth > 768 ? window.innerHeight * 2 : 20;

    const onScroll = () => setScrolled(window.scrollY > threshold);
    const onResize = () => {
      threshold = window.innerWidth > 768 ? window.innerHeight * 2 : 20;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
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

  // Services, the ROI calculator and Contact each have both a homepage
  // preview section AND their own dedicated page now. While on the
  // homepage, the nav should smooth-scroll to the preview section; from any
  // other page, it should go straight to the dedicated page instead of
  // round-tripping through the homepage. "Mülkler" has no dedicated page
  // yet, so it always targets the homepage section (ScrollToHash smooths
  // the landing when arriving from elsewhere).
  const isHome = pathname === `/${locale}` || pathname === `/${locale}/`;

  const sectionHref = (anchor, dedicatedPath) => {
    if (isHome) return `#${anchor}`;
    return dedicatedPath ? `/${locale}/${dedicatedPath}/` : `/${locale}#${anchor}`;
  };

  const handleNavClick = (e, href) => {
    if (!href.startsWith('#')) return; // real page link — let the browser navigate normally
    const id = href.slice(1);
    const el = document.getElementById(id);
    if (el) {
      e.preventDefault();
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setMobileOpen(false);
    }
  };

  const navLinks = [
    { label: t('properties'), href: sectionHref('properties') },
    { label: t('services'), href: sectionHref('services', 'hizmetler') },
    { label: t('calculator'), href: sectionHref('calculator', 'roi-hesaplama') },
    { label: t('blog'), href: `/${locale}/blog/` },
    { label: t('contact'), href: sectionHref('contact', 'iletisim') },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/90 backdrop-blur-xl shadow-card'
          : 'bg-transparent'
      }`}
    >
      {/* Subtle top gradient for contrast before scroll (header is transparent) */}
      <div
        aria-hidden="true"
        className={`absolute inset-x-0 top-0 h-28 pointer-events-none transition-opacity duration-500 -z-10 ${
          scrolled ? 'opacity-0' : 'opacity-100'
        }`}
        style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.55), rgba(0,0,0,0))' }}
      />
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
                onClick={(e) => handleNavClick(e, link.href)}
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
              href={`/${locale}/hizmetler/#consultation-form`}
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
                onClick={(e) => handleNavClick(e, link.href)}
                className="block px-3 py-2.5 text-text-secondary hover:text-dark hover:bg-soft rounded-md text-sm font-medium transition-colors"
              >
                {link.label}
              </a>
            ))}
            <div className="pt-3 border-t border-border mt-3">
              <a
                href={`/${locale}/hizmetler/#consultation-form`}
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
