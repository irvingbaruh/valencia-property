import { setRequestLocale } from 'next-intl/server';
import Hero from '@/components/sections/Hero';
import Stats from '@/components/sections/Stats';
import Properties from '@/components/sections/Properties';
import Services from '@/components/sections/Services';
import Process from '@/components/sections/Process';
import ROICalculator from '@/components/sections/ROICalculator';
import Testimonials from '@/components/sections/Testimonials';
import NewListings from '@/components/sections/NewListings';
import CTASection from '@/components/sections/CTASection';
import ParallaxBreak from '@/components/ui/ParallaxBreak';
import { InterstitialWrapper } from '@/components/ui/InterstitialWrapper';

export default async function HomePage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <>
      <Hero />
      <Stats />
      <Properties />
      <InterstitialWrapper
        image="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80&auto=format"
        alt="Mediterranean coastline"
        translationKey="interstitial1"
      />
      <Services />
      <Process />
      <InterstitialWrapper
        image="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1920&q=80&auto=format"
        alt="Modern Mediterranean villa"
        translationKey="interstitial2"
      />
      <ROICalculator />
      <NewListings />
      <Testimonials />
      <CTASection />
    </>
  );
}
