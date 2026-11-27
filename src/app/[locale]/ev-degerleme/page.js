import { setRequestLocale, getTranslations } from 'next-intl/server';
import ValuationPage from '@/components/valuation/ValuationPage';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'valuationPage' });
  return { title: `${t('title')} | Lock & Loft`, description: t('subtitle') };
}

export default async function Page({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ValuationPage />;
}
