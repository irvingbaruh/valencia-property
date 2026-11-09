import { setRequestLocale, getTranslations } from 'next-intl/server';
import { ArrowRight } from 'lucide-react';
import ScrollReveal from '@/components/ui/ScrollReveal';
import PropertiesGrid from '@/components/sections/PropertiesGrid';
import { localePath } from '@/lib/routes';

const properties = [
  { id: 1, hood: 'Eixample', type: 'apartment', location: 'Eixample, Valencia', price: '€185.000', rooms: 3, sqm: 95, badge: 'new', image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80&auto=format' },
  { id: 2, hood: 'Ruzafa', type: 'penthouse', location: 'Ruzafa, Valencia', price: '€320.000', rooms: 4, sqm: 140, badge: 'premium', image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80&auto=format' },
  { id: 3, hood: 'Cabanyal', type: 'beachHouse', location: 'Cabanyal, Valencia', price: '€245.000', rooms: 2, sqm: 80, badge: 'new', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80&auto=format' },
  { id: 4, hood: 'El Carmen', type: 'apartment', location: 'El Carmen, Valencia', price: '€185.000', rooms: 2, sqm: 78, badge: 'new', image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80&auto=format' },
  { id: 5, hood: 'Benimaclet', type: 'house', location: 'Benimaclet, Valencia', price: '€145.000', rooms: 3, sqm: 92, badge: 'new', image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&q=80&auto=format' },
  { id: 6, hood: 'Ciutat Vella', type: 'residence', location: 'Ciutat Vella, Valencia', price: '€265.000', rooms: 3, sqm: 110, badge: 'premium', image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200&q=80&auto=format' },
  { id: 7, hood: 'Poblats Marítims', type: 'seaApartment', location: 'Poblats Marítims, Valencia', price: '€198.000', rooms: 2, sqm: 85, badge: 'premium', image: 'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=1200&q=80&auto=format' },
  { id: 8, hood: 'Patraix', type: 'studio', location: 'Patraix, Valencia', price: '€155.000', rooms: 2, sqm: 70, badge: 'new', image: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1200&q=80&auto=format' },
  { id: 9, hood: 'Extramurs', type: 'familyHome', location: 'Extramurs, Valencia', price: '€220.000', rooms: 4, sqm: 125, badge: 'new', image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1200&q=80&auto=format' },
];

export default async function MulklerPage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const m = await getTranslations({ locale, namespace: 'mulklerPage' });

  return (
    <div className="bg-soft">
      {/* Hero */}
      <div className="bg-band border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-48 pb-16 text-center">
          <div className="inline-flex items-center gap-3 mb-6">
            <span className="h-px w-8 bg-gold/60" />
            <span className="text-gold text-xs font-sans tracking-[0.2em] uppercase">Properties</span>
            <span className="h-px w-8 bg-gold/60" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-serif text-dark mb-4">{m('title')}</h1>
          <p className="text-lg text-text-muted max-w-2xl mx-auto">{m('subtitle')}</p>
        </div>
      </div>

      {/* Grid — 2 columns, large cards */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <PropertiesGrid samples={properties} />

        {/* CTA */}
        <ScrollReveal className="bg-dark rounded-2xl p-8 sm:p-10 text-center">
          <h2 className="text-2xl font-serif text-white mb-2">{m('ctaTitle')}</h2>
          <p className="text-white mb-7 max-w-md mx-auto">{m('ctaSubtitle')}</p>
          <a
            href={`${localePath(locale, 'hizmetler', `#consultation-form`)}`}
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-gold text-dark font-semibold rounded-xl hover:bg-gold-hover active:scale-[0.98] transition-all duration-200 shadow-gold group"
          >
            {m('ctaButton')}
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-200" />
          </a>
        </ScrollReveal>
      </div>
    </div>
  );
}
