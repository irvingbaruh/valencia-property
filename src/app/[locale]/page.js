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
        image="https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1920&q=80&auto=format"
        alt="Mediterranean coastline"
        translationKey="interstitial1"
      />
      <Services />
      <Process />
      <InterstitialWrapper
        image="https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=1920&q=80&auto=format"
        alt="Valencia architecture"
        translationKey="interstitial2"
      />
      <ROICalculator />
      <NewListings />
      <Testimonials />
      <CTASection />
    </>
  );
}
