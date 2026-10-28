import { getTranslations } from 'next-intl/server';
import { ChevronRight, ArrowRight } from 'lucide-react';
import ScrollReveal from '@/components/ui/ScrollReveal';
import ParallaxBreak from '@/components/ui/ParallaxBreak';

/**
 * Shared template for all /hizmetler/<slug> service detail pages.
 * Server component for data (translations), but renders the same client
 * motion components the homepage uses — ParallaxBreak for the hero image,
 * ScrollReveal on every section — so these pages feel consistent with the
 * homepage's scroll-driven style instead of a flat static page.
 */
export default async function ServiceDetailTemplate({ locale, serviceKey, image, secondaryCta }) {
  const t = await getTranslations({ locale, namespace: `servicePages.${serviceKey}` });
  const c = await getTranslations({ locale, namespace: 'servicePages.common' });
  const servicesT = await getTranslations({ locale, namespace: 'services' });

  const steps = t.raw('steps') || [];
  const faqs = t.raw('faqs') || [];

  return (
    <div className="bg-soft">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-2 text-sm text-text-muted">
          <a href={`/${locale}/`} className="hover:text-gold transition-colors">{c('breadcrumbHome')}</a>
          <ChevronRight size={14} />
          <a href={`/${locale}/#services`} className="hover:text-gold transition-colors">{c('breadcrumbServices')}</a>
          <ChevronRight size={14} />
          <span className="text-dark font-medium">{t('title')}</span>
        </div>
      </div>

      {/* Intro */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10 text-center">
        <p className="text-lg text-text-muted leading-relaxed">{t('intro')}</p>
      </div>

      {/* Cinematic parallax hero — same component as the homepage interstitials */}
      {image && (
        <ParallaxBreak image={image} alt={t('title')} line1={t('title')} height="60vh" overlay={0.45} />
      )}

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24 space-y-16">
        {/* Overview */}
        <ScrollReveal>
          <h2 className="text-2xl font-serif text-dark mb-4">{c('overviewTitle')}</h2>
          <p className="text-text-secondary leading-relaxed text-base">{t('overview')}</p>
        </ScrollReveal>

        {/* Process */}
        {steps.length > 0 && (
          <section>
            <ScrollReveal>
              <h2 className="text-2xl font-serif text-dark mb-6">{c('processTitle')}</h2>
            </ScrollReveal>
            <div className="grid sm:grid-cols-2 gap-5">
              {steps.map((step, i) => (
                <ScrollReveal key={i} delay={i * 0.04}>
                  <div className="bg-white rounded-xl border border-border p-5 h-full">
                    <div className="w-8 h-8 rounded-full bg-gold-light text-gold font-serif font-semibold flex items-center justify-center mb-3">
                      {i + 1}
                    </div>
                    <h3 className="font-semibold text-dark mb-1.5">{step.title}</h3>
                    <p className="text-sm text-text-muted leading-relaxed">{step.desc}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </section>
        )}

        {/* Who we work with */}
        <ScrollReveal>
          <h2 className="text-2xl font-serif text-dark mb-4">{c('whoTitle')}</h2>
          <div className="bg-white rounded-xl border border-border p-6">
            <p className="text-text-secondary leading-relaxed">{t('who')}</p>
          </div>
        </ScrollReveal>

        {/* FAQ */}
        {faqs.length > 0 && (
          <section>
            <ScrollReveal>
              <h2 className="text-2xl font-serif text-dark mb-6">{c('faqTitle')}</h2>
            </ScrollReveal>
            <div className="space-y-5">
              {faqs.map((faq, i) => (
                <ScrollReveal key={i} delay={i * 0.04}>
                  <div className="border-b border-border pb-5 last:border-0">
                    <p className="font-semibold text-dark mb-2">{faq.q}</p>
                    <p className="text-text-muted leading-relaxed">{faq.a}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </section>
        )}

        {/* CTA box */}
        <ScrollReveal className="bg-dark rounded-2xl p-8 sm:p-10 text-center">
          <h2 className="text-2xl font-serif text-white mb-2">{c('ctaBoxTitle')}</h2>
          <p className="text-white/70 mb-7 max-w-md mx-auto">{c('ctaBoxSubtitle')}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href={`/${locale}/#contact`}
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-gold text-dark font-semibold rounded-xl hover:bg-gold-hover active:scale-[0.98] transition-all duration-200 shadow-gold group"
            >
              {c('ctaPrimary')}
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-200" />
            </a>
            {secondaryCta && (
              <a
                href={secondaryCta.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 border border-white/25 text-white rounded-xl hover:bg-white/10 transition-all duration-200"
              >
                {servicesT(secondaryCta.labelKey)}
              </a>
            )}
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
