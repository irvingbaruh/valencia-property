import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Phone, Mail, MessageCircle } from 'lucide-react';
import ScrollReveal from '@/components/ui/ScrollReveal';
import ContactForm from '@/components/forms/ContactForm';

// NOTE: placeholder contact details — swap in the real phone/email/WhatsApp
// number once provided.
const PLACEHOLDER_PHONE = '+34 600 000 000';
const PLACEHOLDER_EMAIL = 'info@valenciaproperty.com';
const PLACEHOLDER_WHATSAPP = '34600000000'; // wa.me format, no "+" or spaces

export default async function IletisimPage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'iletisimPage' });

  return (
    <div className="bg-soft">
      {/* Hero */}
      <div className="bg-white border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
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
            <div className="bg-dark rounded-2xl p-8 text-white h-full flex flex-col">
              <h2 className="text-2xl font-serif mb-6">{t('detailsTitle')}</h2>

              <div className="space-y-5 mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gold/20 flex items-center justify-center shrink-0">
                    <Phone size={18} className="text-gold" />
                  </div>
                  <div>
                    <p className="text-xs text-white/50">{t('phoneDetail')}</p>
                    <a href={`tel:${PLACEHOLDER_PHONE.replace(/\s/g, '')}`} className="text-white hover:text-gold transition-colors">
                      {PLACEHOLDER_PHONE}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gold/20 flex items-center justify-center shrink-0">
                    <Mail size={18} className="text-gold" />
                  </div>
                  <div>
                    <p className="text-xs text-white/50">{t('emailDetail')}</p>
                    <a href={`mailto:${PLACEHOLDER_EMAIL}`} className="text-white hover:text-gold transition-colors">
                      {PLACEHOLDER_EMAIL}
                    </a>
                  </div>
                </div>
              </div>

              <a
                href={`https://wa.me/${PLACEHOLDER_WHATSAPP}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#25D366] text-white font-semibold rounded-xl hover:brightness-110 transition-all duration-200 mt-auto"
              >
                <MessageCircle size={18} />
                {t('whatsappButton')}
              </a>

              <p className="text-xs text-white/30 mt-6 leading-relaxed">{t('officeNote')}</p>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
}
