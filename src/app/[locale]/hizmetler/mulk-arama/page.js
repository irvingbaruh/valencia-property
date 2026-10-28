import { setRequestLocale } from 'next-intl/server';
import ServiceDetailTemplate from '@/components/service-pages/ServiceDetailTemplate';

export default async function Page({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <ServiceDetailTemplate
      locale={locale}
      serviceKey="search"
      image="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&q=80&auto=format"
    />
  );
}
