'use client';

import { useTranslations } from 'next-intl';
import { animate, useInView } from 'framer-motion';
import { Globe, Route, MessageCircle, Award } from 'lucide-react';
import { useRef, useEffect, useState } from 'react';
import ScrollReveal from '@/components/ui/ScrollReveal';

function AnimatedNumber({ value, suffix = '', duration = 1.5 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { margin: "-50px" });
  const [display, setDisplay] = useState('0');

  useEffect(() => {
    if (!isInView) {
      setDisplay('0');
      return;
    }

    const num = parseInt(value.replace(/[^0-9]/g, '')) || 0;
    const controls = animate(0, num, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(Math.round(v).toLocaleString()),
    });

    return () => controls.stop();
  }, [isInView, value, duration]);

  return (
    <span ref={ref}>
      {display}{suffix}
    </span>
  );
}

const stats = [
  { key: 'languages', value: '4', suffix: '', icon: Globe },
  { key: 'service', icon: Route, isText: true },
  { key: 'consultation', icon: MessageCircle, isText: true },
  { key: 'partner', value: 'RE/MAX', suffix: '', icon: Award, isText: true },
];

export default function Stats() {
  const t = useTranslations('stats');

  return (
    <section className="relative -mt-12 z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <ScrollReveal className="bg-white rounded-2xl shadow-card-hover border border-border p-6 md:p-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, i) => (
            <ScrollReveal
              key={stat.key}
              delay={i * 0.03}
              className="text-center group"
            >
              <div className="w-12 h-12 rounded-xl bg-gold-light flex items-center justify-center mx-auto mb-3 group-hover:bg-gold group-hover:scale-105 transition-all duration-300">
                <stat.icon size={22} className="text-gold group-hover:text-white transition-colors duration-300" />
              </div>
              <p className="text-2xl md:text-3xl font-serif text-dark mb-1">
                {stat.isText ? (stat.value || t(`${stat.key}Headline`)) : (
                  <AnimatedNumber value={stat.value} suffix={stat.suffix} duration={1.5 + i * 0.2} />
                )}
              </p>
              <p className="text-sm text-text-muted">{t(stat.key)}</p>
            </ScrollReveal>
          ))}
        </div>
      </ScrollReveal>
    </section>
  );
}
