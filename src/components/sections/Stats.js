'use client';

import { useTranslations } from 'next-intl';
import { motion, useInView, useMotionValue, useTransform, animate } from 'framer-motion';
import { Building2, Clock, Users, Award } from 'lucide-react';
import { useRef, useEffect, useState } from 'react';

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
  { key: 'properties', value: '350', suffix: '+', icon: Building2 },
  { key: 'experience', value: '15', suffix: '+', icon: Clock },
  { key: 'clients', value: '500', suffix: '+', icon: Users },
  { key: 'partner', value: 'RE/MAX', suffix: '', icon: Award, isText: true },
];

export default function Stats() {
  const t = useTranslations('stats');

  return (
    <section className="relative -mt-12 z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="bg-white rounded-2xl shadow-card-hover border border-border p-6 md:p-8"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="text-center group"
            >
              <div className="w-12 h-12 rounded-xl bg-gold-light flex items-center justify-center mx-auto mb-3 group-hover:bg-gold group-hover:scale-105 transition-all duration-300">
                <stat.icon size={22} className="text-gold group-hover:text-white transition-colors duration-300" />
              </div>
              <p className="text-2xl md:text-3xl font-serif text-dark mb-1">
                {stat.isText ? stat.value : (
                  <AnimatedNumber value={stat.value} suffix={stat.suffix} duration={1.5 + i * 0.2} />
                )}
              </p>
              <p className="text-sm text-text-muted">{t(stat.key)}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
