import { setRequestLocale } from 'next-intl/server';
import ServiceDetailTemplate from '@/components/service-pages/ServiceDetailTemplate';

export default async function Page({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <ServiceDetailTemplate
      locale={locale}
      serviceKey="legal"
      image="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1600&q=80&auto=format"
    />
  );
}
