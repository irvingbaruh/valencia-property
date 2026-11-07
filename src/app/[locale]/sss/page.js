import { setRequestLocale, getTranslations } from 'next-intl/server';
import { localePath } from '@/lib/routes';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'faqPage' });
  return { title: `${t('title')} | Lock & Loft`, description: t('subtitle') };
}

export default async function FaqPage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'faqPage' });
  const items = t.raw('items');
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((i) => ({
      '@type': 'Question',
      name: i.q,
      acceptedAnswer: { '@type': 'Answer', text: i.a },
    })),
  };

  return (
    <div className="bg-soft">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="bg-white border-b border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-36 pb-16">
          <h1 className="text-4xl sm:text-5xl font-serif text-dark mb-4">{t('title')}</h1>
          <p className="text-lg text-text-muted">{t('subtitle')}</p>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="space-y-3">
          {items.map((i) => (
            <details key={i.q} className="group bg-white border border-border rounded-xl open:border-gold">
              <summary className="cursor-pointer list-none flex items-center justify-between gap-4 p-5 font-medium text-dark">
                {i.q}
                <span className="text-gold text-xl leading-none transition-transform group-open:rotate-45" aria-hidden="true">+</span>
              </summary>
              <p className="px-5 pb-5 text-text-muted leading-relaxed">{i.a}</p>
            </details>
          ))}
        </div>
        <p className="text-xs text-text-muted mt-8">{t('note')}</p>
        <div className="mt-10 bg-dark text-white rounded-xl p-8 text-center">
          <h2 className="text-xl font-serif mb-4">{t('ctaH')}</h2>
          <a href={localePath(locale, 'iletisim')} className="inline-block bg-gold text-dark font-medium px-6 py-3 rounded-lg hover:opacity-90 transition-opacity">
            {t('ctaBtn')}
          </a>
        </div>
      </div>
    </div>
  );
}
