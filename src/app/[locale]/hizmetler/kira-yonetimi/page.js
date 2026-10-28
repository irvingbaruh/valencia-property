import { setRequestLocale } from 'next-intl/server';
import ServiceDetailTemplate from '@/components/service-pages/ServiceDetailTemplate';

export default async function Page({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <ServiceDetailTemplate
      locale={locale}
      serviceKey="rental"
      image="https://images.unsplash.com/photo-1733244766159-f58f4184fd38?w=1600&q=80&auto=format"
    />
  );
}
