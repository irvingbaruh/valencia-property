import { setRequestLocale, getTranslations } from 'next-intl/server';
import ScrollReveal from '@/components/ui/ScrollReveal';
import ContactForm from '@/components/forms/ContactForm';
import ContactDetailsCard from '@/components/forms/ContactDetailsCard';


export default async function IletisimPage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'iletisimPage' });

  return (
    <div className="bg-soft">
      {/* Hero */}
      <div className="bg-band border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-48 pb-16 text-center">
          <div className="inline-flex items-center gap-3 mb-6">
            <span className="h-px w-8 bg-gold/60" />
            <span className="text-gold text-xs font-sans tracking-[0.2em] uppercase">Contact</span>
            <span className="h-px w-8 bg-gold/60" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-serif text-dark mb-4">{t('title')}</h1>
          <p className="text-lg text-text-muted max-w-2xl mx-auto">{t('subtitle')}</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-10">
          {/* Form */}
          <ScrollReveal from="left">
            <h2 className="text-2xl font-serif text-dark mb-6">{t('formTitle')}</h2>
            <ContactForm />
          </ScrollReveal>

          {/* Details */}
          <ScrollReveal from="right" delay={0.05}>
            <ContactDetailsCard
              labels={{
                title: t('detailsTitle'),
                phone: t('phoneDetail'),
                email: t('emailDetail'),
                whatsapp: t('whatsappButton'),
                office: t('officeNote'),
              }}
            />
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
}
