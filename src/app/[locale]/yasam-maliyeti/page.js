import { setRequestLocale } from 'next-intl/server';
import { guideMeta } from '@/lib/guideUi';
import GuideScreens from '@/components/guide/GuideScreens';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  return guideMeta('yasam-maliyeti', locale);
}

export default async function Page({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <GuideScreens page="yasam-maliyeti" />;
}
