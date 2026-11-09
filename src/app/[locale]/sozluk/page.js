import { setRequestLocale, getTranslations } from 'next-intl/server';
import { localePath } from '@/lib/routes';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'glossaryPage' });
  return { title: `${t('title')} | Lock & Loft`, description: t('subtitle') };
}

export default async function GlossaryPage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'glossaryPage' });
  const terms = t.raw('terms');

  return (
    <div className="bg-soft">
      <div className="bg-band border-b border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-48 pb-16">
          <h1 className="text-4xl sm:text-5xl font-serif text-dark mb-4">{t('title')}</h1>
          <p className="text-lg text-text-muted">{t('subtitle')}</p>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <dl className="divide-y divide-border dark-card border border-white/10 rounded-xl">
          {terms.map(([term, def]) => (
            <div key={term} className="p-5 sm:grid sm:grid-cols-[13rem_1fr] sm:gap-6">
              <dt className="font-serif text-dark mb-1 sm:mb-0">{term}</dt>
              <dd className="text-sm text-text-muted leading-relaxed">{def}</dd>
            </div>
          ))}
        </dl>
        <p className="text-xs text-text-muted mt-6">{t('note')}</p>
        <a href={localePath(locale, 'iletisim')} className="inline-block mt-8 bg-dark text-white px-6 py-3 rounded-lg hover:bg-gold hover:text-dark transition-colors">
          {t('ctaBtn')}
        </a>
      </div>
    </div>
  );
}
