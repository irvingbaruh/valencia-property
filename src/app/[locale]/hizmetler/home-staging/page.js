import { setRequestLocale } from 'next-intl/server';
import ServiceDetailTemplate from '@/components/service-pages/ServiceDetailTemplate';

export default async function Page({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <ServiceDetailTemplate
      locale={locale}
      serviceKey="staging"
      image="https://images.unsplash.com/photo-1746517757473-7c88850e539b?w=1600&q=80&auto=format"
      secondaryCta={{ labelKey: 'stagingCta', url: 'https://www.decorpetit.com/pages/home-staging?view=home-staging' }}
    />
  );
}
