'use client';

import { useTranslations, useLocale } from 'next-intl';
import { ArrowRight, Phone } from 'lucide-react';
import ScrollReveal from '@/components/ui/ScrollReveal';

export default function CTASection() {
  const t = useTranslations('cta_section');
  const locale = useLocale();

  return (
    <section id="contact" className="relative overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1599946347371-68eb71b16afc?w=1920&q=80&auto=format"
          alt="Valencia architecture"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-dark/90" />
      </div>

      {/* Decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-gold/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-gold/3 blur-3xl" />
      </div>

      <div className="relative section-padding max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <ScrollReveal>
          <div className="accent-line mx-auto mb-4" />
          <h2 className="text-3xl md:text-5xl font-serif text-white mb-4">
            {t('title')}
          </h2>
          <p className="text-lg text-white/60 mb-10 max-w-xl mx-auto">
            {t('subtitle')}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={`/${locale}/hizmetler/#consultation-form`}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gold text-dark font-semibold rounded-xl hover:bg-gold-hover hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-gold group text-lg"
            >
              {t('button')}
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform duration-200" />
            </a>
            <a
              href="tel:+34600000000"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-white/20 text-white rounded-xl hover:bg-white/10 hover:border-white/30 transition-all duration-200 text-lg"
            >
              <Phone size={18} />
              {t('phone')}
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
