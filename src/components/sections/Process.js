'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { ClipboardList, Building, FileCheck, Key } from 'lucide-react';

const steps = [
  { key: 'step1', icon: ClipboardList, num: '01' },
  { key: 'step2', icon: Building, num: '02' },
  { key: 'step3', icon: FileCheck, num: '03' },
  { key: 'step4', icon: Key, num: '04' },
];

export default function Process() {
  const t = useTranslations('process');

  return (
    <section className="section-padding bg-dark text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-14"
        >
          <div className="accent-line mx-auto mb-4" />
          <h2 className="text-3xl md:text-4xl font-serif text-white mb-3">
            {t('title')}
          </h2>
          <p className="text-white/60 max-w-xl mx-auto">
            {t('subtitle')}
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={step.key}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.5, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="relative text-center group"
            >
              {/* Connector line (desktop) */}
              {i < steps.length - 1 && (
                <motion.div
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.3 + i * 0.2, ease: [0.22, 1, 0.36, 1] }}
                  className="hidden lg:block absolute top-10 left-[60%] w-[80%] h-px bg-gradient-to-r from-gold/40 to-transparent origin-left"
                />
              )}

              <motion.div
                whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                className="relative inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-charcoal border border-white/10 mb-5 group-hover:border-gold/40 transition-colors duration-300"
              >
                <step.icon size={28} className="text-gold" />
                <motion.span
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.4 + i * 0.15 }}
                  className="absolute -top-2 -right-2 w-7 h-7 bg-gold text-dark text-xs font-bold rounded-full flex items-center justify-center"
                >
                  {step.num}
                </motion.span>
              </motion.div>

              <h3 className="font-serif text-lg text-white mb-2 group-hover:text-gold transition-colors duration-200">
                {t(`${step.key}.title`)}
              </h3>
              <p className="text-sm text-white/50 leading-relaxed max-w-xs mx-auto">
                {t(`${step.key}.desc`)}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
