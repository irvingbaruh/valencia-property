import { setRequestLocale } from 'next-intl/server';
import ServiceDetailTemplate from '@/components/service-pages/ServiceDetailTemplate';

export default async function Page({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <ServiceDetailTemplate
      locale={locale}
      serviceKey="aftersales"
      image="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1600&q=80&auto=format"
    />
  );
}
