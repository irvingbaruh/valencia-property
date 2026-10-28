import { getTranslations } from 'next-intl/server';
import { ChevronRight, CheckCircle2, ArrowRight } from 'lucide-react';

/**
 * Shared static template for all /hizmetler/<slug> service detail pages.
 * Server component — all content comes from translations, no client JS needed.
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

      {/* Hero */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10 text-center">
        <h1 className="text-4xl sm:text-5xl font-serif text-dark mb-4 leading-tight">{t('title')}</h1>
        <p className="text-lg text-text-muted max-w-2xl mx-auto leading-relaxed">{t('intro')}</p>
      </div>

      {/* Hero image */}
      {image && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <div className="relative h-[320px] sm:h-[420px] rounded-2xl overflow-hidden shadow-card">
            <img src={image} alt={t('title')} className="w-full h-full object-cover" />
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 space-y-16">
        {/* Overview */}
        <section>
          <h2 className="text-2xl font-serif text-dark mb-4">{c('overviewTitle')}</h2>
          <p className="text-text-secondary leading-relaxed text-base">{t('overview')}</p>
        </section>

        {/* Process */}
        {steps.length > 0 && (
          <section>
            <h2 className="text-2xl font-serif text-dark mb-6">{c('processTitle')}</h2>
            <div className="grid sm:grid-cols-2 gap-5">
              {steps.map((step, i) => (
                <div key={i} className="bg-white rounded-xl border border-border p-5">
                  <div className="w-8 h-8 rounded-full bg-gold-light text-gold font-serif font-semibold flex items-center justify-center mb-3">
                    {i + 1}
                  </div>
                  <h3 className="font-semibold text-dark mb-1.5">{step.title}</h3>
                  <p className="text-sm text-text-muted leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Who we work with */}
        <section>
          <h2 className="text-2xl font-serif text-dark mb-4">{c('whoTitle')}</h2>
          <div className="bg-white rounded-xl border border-border p-6">
            <p className="text-text-secondary leading-relaxed">{t('who')}</p>
          </div>
        </section>

        {/* FAQ */}
        {faqs.length > 0 && (
          <section>
            <h2 className="text-2xl font-serif text-dark mb-6">{c('faqTitle')}</h2>
            <div className="space-y-5">
              {faqs.map((faq, i) => (
                <div key={i} className="border-b border-border pb-5 last:border-0">
                  <p className="font-semibold text-dark mb-2">{faq.q}</p>
                  <p className="text-text-muted leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CTA box */}
        <section className="bg-dark rounded-2xl p-8 sm:p-10 text-center">
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
        </section>
      </div>
    </div>
  );
}
