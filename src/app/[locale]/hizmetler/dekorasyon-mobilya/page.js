import { setRequestLocale } from 'next-intl/server';
import ServiceDetailTemplate from '@/components/service-pages/ServiceDetailTemplate';

export default async function Page({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <ServiceDetailTemplate
      locale={locale}
      serviceKey="decor"
      image="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1600&q=80&auto=format"
      secondaryCta={{ labelKey: 'decorCta', url: 'https://www.decorpetit.com' }}
    />
  );
}
