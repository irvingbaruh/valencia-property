import { setRequestLocale } from 'next-intl/server';
import ServiceDetailTemplate from '@/components/service-pages/ServiceDetailTemplate';

export default async function Page({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <ServiceDetailTemplate
      locale={locale}
      serviceKey="renovation"
      image="https://images.unsplash.com/photo-1768321916877-8cf4e4ef7487?w=1600&q=80&auto=format"
    />
  );
}
