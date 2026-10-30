import { setRequestLocale } from 'next-intl/server';
import PanelContent from '@/components/panel/PanelContent';

export default async function PanelPage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <PanelContent />;
}
