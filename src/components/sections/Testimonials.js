'use client';

import { useTranslations, useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Mehmet K.',
    location: 'Berlin, DE',
    text: {
      tr: 'Valencia\'da ev alma sürecimiz inanılmaz kolay geçti. Her adımda profesyonel destek aldık.',
      en: 'The process of buying a home in Valencia was incredibly smooth. We received professional support at every step.',
      es: 'El proceso de comprar una casa en Valencia fue increíblemente fácil. Recibimos apoyo profesional en cada paso.',
      de: 'Der Hauskauf in Valencia verlief unglaublich reibungslos. Wir erhielten bei jedem Schritt professionelle Unterstützung.',
    },
  },
  {
    name: 'Ayse & Thomas D.',
    location: 'Hamburg, DE',
    text: {
      tr: 'Dekorasyon ve kiralama yönetimi hizmetleri sayesinde yatırımımız ilk aydan itibaren gelir getirdi.',
      en: 'Thanks to the decoration and rental management services, our investment generated income from the first month.',
      es: 'Gracias a los servicios de decoración y gestión de alquiler, nuestra inversión generó ingresos desde el primer mes.',
      de: 'Dank der Dekorations- und Mietverwaltungsdienste erzielte unsere Investition ab dem ersten Monat Einnahmen.',
    },
  },
  {
    name: 'Carlos M.',
    location: 'Madrid, ES',
    text: {
      tr: 'RE/MAX ortaklığı ve ekibin uzmanlığı sayesinde güvenle yatırım yaptık.',
      en: 'The RE/MAX partnership and the team\'s expertise gave us confidence in our investment.',
      es: 'La asociación con RE/MAX y la experiencia del equipo nos dieron confianza en nuestra inversión.',
      de: 'Die RE/MAX-Partnerschaft und die Kompetenz des Teams gaben uns Vertrauen in unsere Investition.',
    },
  },
];

export default function Testimonials() {
  const t = useTranslations('testimonials');

  return (
    <section className="section-padding bg-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="accent-line mx-auto mb-4" />
          <h2 className="text-3xl md:text-4xl font-serif text-dark mb-3">
            {t('title')}
          </h2>
          <p className="text-text-secondary max-w-xl mx-auto">
            {t('subtitle')}
          </p>
        </motion.div>

        {/* Testimonial Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((item, i) => (
            <TestimonialCard key={i} item={item} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({ item, index }) {
  const locale = useLocale();
  const text = item.text[locale] || item.text.tr;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-white rounded-xl p-6 border border-border"
    >
      <Quote size={24} className="text-gold/30 mb-4" />
      <p className="text-text-secondary text-sm leading-relaxed mb-5">
        {text}
      </p>
      <div className="flex items-center gap-3 pt-4 border-t border-border">
        <div className="w-10 h-10 rounded-full bg-gold-light flex items-center justify-center">
          <span className="text-gold font-semibold text-sm">
            {item.name.charAt(0)}
          </span>
        </div>
        <div>
          <p className="text-sm font-medium text-dark">{item.name}</p>
          <p className="text-xs text-text-muted">{item.location}</p>
        </div>
        <div className="ml-auto flex gap-0.5">
          {[...Array(5)].map((_, j) => (
            <Star key={j} size={12} className="text-gold fill-gold" />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
