import { setRequestLocale } from 'next-intl/server';
import { guide } from '@/lib/guideContent';
import GuideView from '@/components/sections/GuideView';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const g = guide(locale);
  return { title: `${g.metaTitle} | Lock & Loft`, description: g.metaDesc, robots: { index: false } };
}

export default async function GuidePage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <GuideView />;
}
