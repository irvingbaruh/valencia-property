import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Search, Scale, Paintbrush, Hammer, KeyRound, Home, ArrowRight } from 'lucide-react';
import ScrollReveal from '@/components/ui/ScrollReveal';
import ConsultationForm from '@/components/forms/ConsultationForm';

const services = [
  { key: 'search', slug: 'mulk-arama', icon: Search },
  { key: 'legal', slug: 'hukuki-destek', icon: Scale },
  { key: 'decor', slug: 'dekorasyon-mobilya', icon: Paintbrush },
  { key: 'renovation', slug: 'renovasyon', icon: Hammer },
  { key: 'rental', slug: 'kira-yonetimi', icon: KeyRound },
  { key: 'staging', slug: 'home-staging', icon: Home },
];

export default async function HizmetlerPage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'services' });
  const p = await getTranslations({ locale, namespace: 'hizmetlerPage' });

  return (
    <div className="bg-soft">
      {/* Hero */}
      <div className="bg-white border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="inline-flex items-center gap-3 mb-6">
            <span className="h-px w-8 bg-gold/60" />
            <span className="text-gold text-xs font-sans tracking-[0.2em] uppercase">Services</span>
            <span className="h-px w-8 bg-gold/60" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-serif text-dark mb-4">{p('title')}</h1>
          <p className="text-lg text-text-muted max-w-2xl mx-auto">{p('subtitle')}</p>
        </div>
      </div>

      {/* Services list */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid sm:grid-cols-2 gap-6 mb-20">
          {services.map((service, i) => {
            const Icon = service.icon;
            return (
              <ScrollReveal key={service.key} delay={i * 0.03}>
                <div className="bg-white rounded-2xl border border-border p-6 h-full flex flex-col">
                  <div className="w-12 h-12 rounded-xl bg-gold-light flex items-center justify-center mb-4">
                    <Icon size={22} className="text-gold" />
                  </div>
                  <h2 className="font-serif text-xl text-dark mb-2">{t(`${service.key}.title`)}</h2>
                  <p className="text-sm text-text-muted leading-relaxed mb-5 flex-1">{t(`${service.key}.desc`)}</p>
                  <a
                    href={`/${locale}/hizmetler/${service.slug}/`}
                    className="inline-flex items-center gap-1.5 text-sm text-gold font-semibold hover:gap-2.5 transition-all duration-200 w-fit"
                  >
                    {p('readMore')}
                    <ArrowRight size={15} />
                  </a>
                </div>
              </ScrollReveal>
            );
          })}
        </div>

        {/* Consultation form */}
        <ScrollReveal id="consultation-form" className="scroll-mt-28">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-serif text-dark mb-3">{p('formTitle')}</h2>
            <p className="text-text-muted max-w-xl mx-auto">{p('formSubtitle')}</p>
          </div>
          <ConsultationForm />
        </ScrollReveal>
      </div>
    </div>
  );
}
