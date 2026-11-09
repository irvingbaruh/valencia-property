import { setRequestLocale, getTranslations } from 'next-intl/server';
import MarketNotesList from '@/components/sections/MarketNotesList';

export default async function PiyasaPage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'market' });
  return (
    <div className="bg-soft">
      <div className="bg-band border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-48 pb-16 text-center">
          <h1 className="text-4xl sm:text-5xl font-serif text-dark mb-4">{t('title')}</h1>
          <p className="text-lg text-text-muted max-w-2xl mx-auto">{t('subtitle')}</p>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <MarketNotesList />
      </div>
    </div>
  );
}
