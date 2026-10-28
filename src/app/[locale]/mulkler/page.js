import { setRequestLocale, getTranslations } from 'next-intl/server';
import { MapPin, BedDouble, Maximize2, ArrowRight } from 'lucide-react';
import ScrollReveal from '@/components/ui/ScrollReveal';

const properties = [
  { id: 1, title: 'Eixample Dairesi', location: 'Eixample, Valencia', price: '€185.000', rooms: 3, sqm: 95, badge: 'new', image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80&auto=format' },
  { id: 2, title: 'Ruzafa Çatı Katı', location: 'Ruzafa, Valencia', price: '€320.000', rooms: 4, sqm: 140, badge: 'premium', image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80&auto=format' },
  { id: 3, title: 'Cabanyal Sahil Evi', location: 'Cabanyal, Valencia', price: '€245.000', rooms: 2, sqm: 80, badge: 'new', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80&auto=format' },
  { id: 4, title: 'El Carmen Dairesi', location: 'El Carmen, Valencia', price: '€185.000', rooms: 2, sqm: 78, badge: 'new', image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80&auto=format' },
  { id: 5, title: 'Benimaclet Evi', location: 'Benimaclet, Valencia', price: '€145.000', rooms: 3, sqm: 92, badge: 'new', image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&q=80&auto=format' },
  { id: 6, title: 'Ciutat Vella Rezidansı', location: 'Ciutat Vella, Valencia', price: '€265.000', rooms: 3, sqm: 110, badge: 'premium', image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200&q=80&auto=format' },
  { id: 7, title: 'Poblats Marítims Sahil Dairesi', location: 'Poblats Marítims, Valencia', price: '€198.000', rooms: 2, sqm: 85, badge: 'premium', image: 'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=1200&q=80&auto=format' },
  { id: 8, title: 'Patraix Stüdyo Daire', location: 'Patraix, Valencia', price: '€155.000', rooms: 2, sqm: 70, badge: 'new', image: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1200&q=80&auto=format' },
  { id: 9, title: 'Extramurs Aile Evi', location: 'Extramurs, Valencia', price: '€220.000', rooms: 4, sqm: 125, badge: 'new', image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1200&q=80&auto=format' },
];

export default async function MulklerPage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'properties' });
  const m = await getTranslations({ locale, namespace: 'mulklerPage' });

  return (
    <div className="bg-soft">
      {/* Hero */}
      <div className="bg-white border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
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
        <div className="grid sm:grid-cols-2 gap-8 lg:gap-10 mb-20">
          {properties.map((property, i) => (
            <ScrollReveal key={property.id} delay={(i % 2) * 0.04}>
              <div className="group bg-white rounded-2xl overflow-hidden border border-border hover:border-gold/30 hover:shadow-card-hover transition-all duration-300 h-full flex flex-col">
                {/* Big image */}
                <div className="relative h-72 sm:h-80 overflow-hidden">
                  <img
                    src={property.image}
                    alt={property.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <span className="absolute top-4 left-4 px-3 py-1.5 bg-gold text-dark text-xs font-semibold tracking-wide uppercase rounded-md shadow-gold">
                    {t(`badge_${property.badge}`)}
                  </span>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col">
                  <h2 className="font-serif text-xl text-dark mb-2 group-hover:text-gold transition-colors duration-300">
                    {property.title}
                  </h2>
                  <div className="flex items-center gap-1.5 text-text-muted text-sm mb-4">
                    <MapPin size={14} className="text-gold" />
                    <span>{property.location}</span>
                  </div>

                  <div className="flex items-center gap-6 text-sm text-text-muted mb-5">
                    <span className="flex items-center gap-1.5">
                      <BedDouble size={15} className="text-gold/70" />
                      {property.rooms} {t('rooms')}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Maximize2 size={15} className="text-gold/70" />
                      {property.sqm} {t('sqm')}
                    </span>
                  </div>

                  <div className="mt-auto pt-5 border-t border-border flex items-center justify-between">
                    <span className="text-2xl font-serif text-dark">{property.price}</span>
                    <span className="w-10 h-10 rounded-full border border-gold/30 flex items-center justify-center group-hover:bg-gold group-hover:border-gold transition-all duration-300">
                      <ArrowRight size={16} className="text-gold group-hover:text-white transition-colors duration-300" />
                    </span>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* CTA */}
        <ScrollReveal className="bg-dark rounded-2xl p-8 sm:p-10 text-center">
          <h2 className="text-2xl font-serif text-white mb-2">{m('ctaTitle')}</h2>
          <p className="text-white/70 mb-7 max-w-md mx-auto">{m('ctaSubtitle')}</p>
          <a
            href={`/${locale}/hizmetler/#consultation-form`}
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
