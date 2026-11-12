import { setRequestLocale } from 'next-intl/server';
import { areaUi } from '@/lib/areaContent';
import MemberDirectory from '@/components/sections/MemberDirectory';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const p = areaUi(locale).areas;
  return { title: `${p.metaTitle} | Lock & Loft`, description: p.metaDesc, robots: { index: false } };
}

export default async function Page({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <MemberDirectory kind="areas" />;
}
