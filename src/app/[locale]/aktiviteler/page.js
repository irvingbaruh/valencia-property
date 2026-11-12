import { setRequestLocale } from 'next-intl/server';
import { PAGES } from '@/lib/guideUi';
import GuideScreens from '@/components/guide/GuideScreens';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const P = PAGES['aktiviteler'];
  const title = (P.meta || P.title)[locale] || P.title.tr;
  return { title: `${title} | Lock & Loft`, robots: { index: false } };
}

export default async function Page({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <GuideScreens page="aktiviteler" />;
}
