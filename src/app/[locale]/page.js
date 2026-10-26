import Hero from '@/components/sections/Hero';
import Stats from '@/components/sections/Stats';
import Properties from '@/components/sections/Properties';
import Services from '@/components/sections/Services';
import Process from '@/components/sections/Process';
import ROICalculator from '@/components/sections/ROICalculator';
import Testimonials from '@/components/sections/Testimonials';
import CTASection from '@/components/sections/CTASection';

export default function HomePage() {
  return (
    <>
      <Hero />
      <Stats />
      <Properties />
      <Services />
      <Process />
      <ROICalculator />
      <Testimonials />
      <CTASection />
    </>
  );
}
