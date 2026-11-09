import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Search, Scale, Paintbrush, Hammer, KeyRound, Home, ClipboardCheck, ArrowRight } from 'lucide-react';
import ScrollReveal from '@/components/ui/ScrollReveal';
import ConsultationForm from '@/components/forms/ConsultationForm';
import { localePath } from '@/lib/routes';

const services = [
  { key: 'search', image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80&auto=format', slug: 'mulk-arama', icon: Search },
  { key: 'legal', image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80&auto=format', slug: 'hukuki-destek', icon: Scale },
  { key: 'renovation', image: 'https://images.unsplash.com/photo-1768321916877-8cf4e4ef7487?w=800&q=80&auto=format', slug: 'renovasyon', icon: Hammer },
  { key: 'decor', image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=80&auto=format', slug: 'dekorasyon-mobilya', icon: Paintbrush },
  { key: 'rental', image: 'https://images.unsplash.com/photo-1733244766159-f58f4184fd38?w=800&q=80&auto=format', slug: 'kira-yonetimi', icon: KeyRound },
  { key: 'staging', image: 'https://images.unsplash.com/photo-1746517757473-7c88850e539b?w=800&q=80&auto=format', slug: 'home-staging', icon: Home },
  { key: 'aftersales', image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80&auto=format', slug: 'satis-sonrasi-yonetim', icon: ClipboardCheck },
];

export default async function HizmetlerPage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'services' });
  const p = await getTranslations({ locale, namespace: 'hizmetlerPage' });

  return (
    <div className="bg-soft">
      {/* Hero */}
      <div className="bg-band border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-48 pb-16 text-center">
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
                <div className="dark-card rounded-2xl border border-white/10 overflow-hidden h-full flex flex-col">
                  <div className="h-48 overflow-hidden bg-dark-mid">
                    <img src={service.image} alt={t(`${service.key}.title`)} loading="lazy" className="w-full h-full object-cover" />
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                  <div className="w-12 h-12 rounded-xl bg-gold-light flex items-center justify-center mb-4">
                    <Icon size={22} className="text-gold" />
                  </div>
                  <h2 className="font-serif text-xl text-dark mb-2">{t(`${service.key}.title`)}</h2>
                  <p className="text-sm text-text-muted leading-relaxed mb-5 flex-1">{t(`${service.key}.desc`)}</p>
                  <a
                    href={`${localePath(locale, 'hizmetler', `${service.slug}/`)}`}
                    className="inline-flex items-center gap-1.5 text-sm text-gold font-semibold hover:gap-2.5 transition-all duration-200 w-fit"
                  >
                    {p('readMore')}
                    <ArrowRight size={15} />
                  </a>
                  </div>
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
