import { setRequestLocale, getTranslations } from 'next-intl/server';
import { ArrowRight, Newspaper } from 'lucide-react';
import ScrollReveal from '@/components/ui/ScrollReveal';
import DetailedROICalculator from '@/components/sections/DetailedROICalculator';
import LiveExchangeRates from '@/components/sections/LiveExchangeRates';
import { localePath } from '@/lib/routes';

const newsLinks = [
  { name: 'Idealista News', url: 'https://www.idealista.com/news/', descKey: 'src1' },
  { name: 'Spanish Property Insight', url: 'https://www.spanishpropertyinsight.com', descKey: 'src2' },
  { name: 'Banco de España', url: 'https://www.bde.es', descKey: 'src3' },
];

export default async function ROIPage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'roiPage' });

  return (
    <div className="bg-soft">
      {/* Hero */}
      <div className="bg-white border-b border-white/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-36 pb-16 text-center">
          <div className="inline-flex items-center gap-3 mb-6">
            <span className="h-px w-8 bg-gold/60" />
            <span className="text-gold text-xs font-sans tracking-[0.2em] uppercase">ROI</span>
            <span className="h-px w-8 bg-gold/60" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-serif text-dark mb-4">{t('title')}</h1>
          <p className="text-lg text-text-muted max-w-2xl mx-auto">{t('subtitle')}</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-20">
        {/* Calculator */}
        <ScrollReveal>
          <DetailedROICalculator />
        </ScrollReveal>

        {/* Live data */}
        <section>
          <ScrollReveal>
            <h2 className="text-2xl font-serif text-dark mb-6">{t('liveDataTitle')}</h2>
          </ScrollReveal>
          <div className="grid md:grid-cols-2 gap-6">
            <ScrollReveal>
              <LiveExchangeRates />
            </ScrollReveal>
            <ScrollReveal delay={0.04}>
              <div className="dark-card rounded-2xl border border-white/10 p-6 h-full">
                <h3 className="font-serif text-lg text-dark mb-5">{t('newsTitle')}</h3>
                <div className="space-y-3">
                  {newsLinks.map((link) => (
                    <a
                      key={link.url}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-3 p-3 rounded-xl hover:bg-soft transition-colors duration-200 group"
                    >
                      <div className="w-9 h-9 rounded-lg bg-gold-light flex items-center justify-center shrink-0">
                        <Newspaper size={16} className="text-gold" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-dark group-hover:text-gold transition-colors">{link.name}</p>
                        <p className="text-xs text-text-muted leading-relaxed">{t(link.descKey)}</p>
                      </div>
                    </a>
                  ))}
                </div>
                <p className="text-xs text-text-muted/70 mt-4">{t('newsNote')}</p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* CTA */}
        <ScrollReveal className="bg-dark rounded-2xl p-8 sm:p-10 text-center">
          <h2 className="text-2xl font-serif text-white mb-2">{t('ctaTitle')}</h2>
          <p className="text-white/70 mb-7 max-w-md mx-auto">{t('ctaSubtitle')}</p>
          <a
            href={`${localePath(locale, 'hizmetler', `#consultation-form`)}`}
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-gold text-dark font-semibold rounded-xl hover:bg-gold-hover active:scale-[0.98] transition-all duration-200 shadow-gold group"
          >
            {t('ctaButton')}
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-200" />
          </a>
        </ScrollReveal>
      </div>
    </div>
  );
}
