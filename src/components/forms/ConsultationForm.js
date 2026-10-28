'use client';

/*
 * ConsultationForm — branching "Danışmanlık Al" wizard
 * =====================================================
 * NOTE: this is a first-pass draft per Irving's brief (property type →
 * investment/land branch → renovation condition → region/budget/timeline/
 * location → contact details). Text is Turkish-only for now since the
 * questions themselves are expected to change — translate once finalized.
 *
 * No backend wired up yet: submitting just shows a thank-you state.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, Send } from 'lucide-react';

const getSteps = (answers) => {
  const steps = [
    {
      key: 'propertyType',
      title: 'Ne tür bir mülk arıyorsunuz?',
      type: 'single',
      options: [
        { value: 'home', label: 'Oturmak İçin Ev' },
        { value: 'investment', label: 'Yatırım Amaçlı Mülk' },
        { value: 'land', label: 'Arsa' },
        { value: 'unsure', label: 'Henüz Karar Vermedim' },
      ],
    },
  ];

  if (answers.propertyType === 'investment') {
    steps.push({
      key: 'investmentStrategy',
      title: 'Yatırım stratejiniz nedir?',
      type: 'single',
      options: [
        { value: 'airbnb', label: 'Kısa Dönem Kiralama (Airbnb)' },
        { value: 'longterm', label: 'Uzun Dönem Kiralama' },
        { value: 'flip', label: 'Al-Sat (Değer Artışı)' },
        { value: 'unsure', label: 'Henüz Karar Vermedim' },
      ],
    });
  }

  if (answers.propertyType === 'land') {
    steps.push({
      key: 'landPlan',
      title: 'Arsa ile ilgili planınız nedir?',
      type: 'single',
      options: [
        { value: 'build', label: 'Kendi Evimi İnşa Etmek' },
        { value: 'project', label: 'Yatırım / İnşaat Projesi' },
        { value: 'unsure', label: 'Henüz Karar Vermedim' },
      ],
    });
  }

  if (answers.propertyType !== 'land') {
    steps.push({
      key: 'condition',
      title: 'Mülkün durumu sizin için önemli mi?',
      type: 'single',
      options: [
        { value: 'ready', label: 'Tamamen Hazır, Taşınmaya Hazır Olmalı' },
        { value: 'light', label: 'Küçük Yenilemelere Açığım' },
        { value: 'renovation', label: 'Renovasyon Projesi Arıyorum (Fırsat Fiyatına)' },
        { value: 'any', label: 'Fark Etmez' },
      ],
    });
  }

  steps.push({
    key: 'region',
    title: 'Bölge tercihiniz nedir?',
    subtitle: 'Birden fazla seçenek işaretleyebilirsiniz.',
    type: 'multi',
    options: [
      { value: 'valencia-centro', label: 'Valencia Merkez' },
      { value: 'el-carmen', label: 'El Carmen' },
      { value: 'benimaclet', label: 'Benimaclet' },
      { value: 'ciutat-vella', label: 'Ciutat Vella' },
      { value: 'poblats-maritims', label: 'Poblats Marítims' },
      { value: 'alicante', label: 'Alicante Bölgesi' },
      { value: 'any', label: 'Fark Etmez / Öneri İsterim' },
    ],
  });

  steps.push({
    key: 'budget',
    title: 'Bütçe aralığınız nedir?',
    type: 'single',
    options: [
      { value: 'under150', label: "150.000€'nun Altı" },
      { value: '150-300', label: '150.000€ – 300.000€' },
      { value: '300-500', label: '300.000€ – 500.000€' },
      { value: '500plus', label: '500.000€ ve Üzeri' },
    ],
  });

  steps.push({
    key: 'timeline',
    title: 'Zaman çizelgeniz nedir?',
    type: 'single',
    options: [
      { value: 'now', label: 'Hemen' },
      { value: '3-6', label: '3-6 Ay İçinde' },
      { value: '6-12', label: '6-12 Ay İçinde' },
      { value: 'researching', label: 'Sadece Araştırıyorum' },
    ],
  });

  steps.push({
    key: 'location',
    title: 'Şu anda nerede yaşıyorsunuz?',
    type: 'single',
    options: [
      { value: 'turkey', label: 'Türkiye' },
      { value: 'europe-tr', label: "Avrupa'da Yaşayan Türküm" },
      { value: 'spain', label: "İspanya'da Yaşıyorum" },
      { value: 'other', label: 'Diğer' },
    ],
  });

  steps.push({ key: 'contact', title: 'İletişim Bilgileriniz', type: 'contact' });

  return steps;
};

export default function ConsultationForm() {
  const [answers, setAnswers] = useState({});
  const [stepIndex, setStepIndex] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [contactErrors, setContactErrors] = useState({});

  const steps = getSteps(answers);
  const current = steps[stepIndex];
  const isLast = stepIndex === steps.length - 1;
  const progress = ((stepIndex + 1) / steps.length) * 100;

  const selectSingle = (key, value) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const toggleMulti = (key, value) => {
    setAnswers((prev) => {
      const list = prev[key] || [];
      const next = list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
      return { ...prev, [key]: next };
    });
  };

  const canProceed = () => {
    if (current.type === 'single') return Boolean(answers[current.key]);
    if (current.type === 'multi') return true;
    return true;
  };

  const goNext = () => {
    if (current.type === 'contact') {
      const errs = {};
      if (!answers.name?.trim()) errs.name = true;
      if (!answers.email?.trim()) errs.email = true;
      if (!answers.phone?.trim()) errs.phone = true;
      setContactErrors(errs);
      if (Object.keys(errs).length > 0) return;
      setSubmitted(true);
      return;
    }
    setStepIndex((i) => Math.min(i + 1, steps.length - 1));
  };

  const goBack = () => setStepIndex((i) => Math.max(i - 1, 0));

  if (submitted) {
    return (
      <div className="bg-dark rounded-2xl p-10 sm:p-14 text-center">
        <div className="w-16 h-16 rounded-full bg-gold flex items-center justify-center mx-auto mb-6">
          <Check size={28} className="text-dark" />
        </div>
        <h3 className="text-2xl font-serif text-white mb-3">Teşekkürler, {answers.name?.split(' ')[0] || ''}!</h3>
        <p className="text-white/60 max-w-md mx-auto leading-relaxed">
          Talebinizi aldık. Ekibimiz en kısa sürede sizinle {answers.phone ? 'telefon veya WhatsApp üzerinden' : 'e-posta ile'} iletişime geçecek.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-dark rounded-2xl p-6 sm:p-10">
      {/* Progress bar */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-white/40 uppercase tracking-wider">
          Adım {stepIndex + 1} / {steps.length}
        </span>
      </div>
      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-8">
        <motion.div
          className="h-full bg-gold rounded-full"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={current.key}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.25 }}
        >
          <h3 className="text-xl sm:text-2xl font-serif text-white mb-1.5">{current.title}</h3>
          {current.subtitle && <p className="text-sm text-white/50 mb-6">{current.subtitle}</p>}
          {!current.subtitle && <div className="mb-6" />}

          {current.type === 'single' && (
            <div className="grid sm:grid-cols-2 gap-3">
              {current.options.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => selectSingle(current.key, opt.value)}
                  className={`text-left px-5 py-4 rounded-xl border transition-all duration-200 ${
                    answers[current.key] === opt.value
                      ? 'bg-gold border-gold text-dark font-semibold'
                      : 'bg-white/5 border-white/10 text-white/80 hover:border-gold/40 hover:bg-white/10'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}

          {current.type === 'multi' && (
            <div className="flex flex-wrap gap-2.5">
              {current.options.map((opt) => {
                const selected = (answers[current.key] || []).includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => toggleMulti(current.key, opt.value)}
                    className={`px-4 py-2.5 rounded-full border text-sm transition-all duration-200 ${
                      selected
                        ? 'bg-gold border-gold text-dark font-semibold'
                        : 'bg-white/5 border-white/10 text-white/80 hover:border-gold/40 hover:bg-white/10'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          )}

          {current.type === 'contact' && (
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs text-white/50 mb-1.5">Ad Soyad *</label>
                <input
                  type="text"
                  value={answers.name || ''}
                  onChange={(e) => setAnswers((p) => ({ ...p, name: e.target.value }))}
                  className={`w-full px-4 py-3 bg-white/5 border rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-gold/50 ${contactErrors.name ? 'border-red-500/60' : 'border-white/15'}`}
                  placeholder="Adınız Soyadınız"
                />
              </div>
              <div>
                <label className="block text-xs text-white/50 mb-1.5">E-posta *</label>
                <input
                  type="email"
                  value={answers.email || ''}
                  onChange={(e) => setAnswers((p) => ({ ...p, email: e.target.value }))}
                  className={`w-full px-4 py-3 bg-white/5 border rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-gold/50 ${contactErrors.email ? 'border-red-500/60' : 'border-white/15'}`}
                  placeholder="ornek@email.com"
                />
              </div>
              <div>
                <label className="block text-xs text-white/50 mb-1.5">Telefon / WhatsApp *</label>
                <input
                  type="tel"
                  value={answers.phone || ''}
                  onChange={(e) => setAnswers((p) => ({ ...p, phone: e.target.value }))}
                  className={`w-full px-4 py-3 bg-white/5 border rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-gold/50 ${contactErrors.phone ? 'border-red-500/60' : 'border-white/15'}`}
                  placeholder="+90 5XX XXX XX XX"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs text-white/50 mb-1.5">Tercih Edilen Dil</label>
                <select
                  value={answers.preferredLanguage || 'tr'}
                  onChange={(e) => setAnswers((p) => ({ ...p, preferredLanguage: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold/50"
                >
                  <option value="tr" className="bg-dark">Türkçe</option>
                  <option value="en" className="bg-dark">English</option>
                  <option value="es" className="bg-dark">Español</option>
                  <option value="de" className="bg-dark">Deutsch</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs text-white/50 mb-1.5">Ek Not (opsiyonel)</label>
                <textarea
                  value={answers.note || ''}
                  onChange={(e) => setAnswers((p) => ({ ...p, note: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-gold/50 resize-none"
                  placeholder="Eklemek istediğiniz bir şey var mı?"
                />
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Nav buttons */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
        <button
          type="button"
          onClick={goBack}
          disabled={stepIndex === 0}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm text-white/60 hover:text-white disabled:opacity-0 disabled:pointer-events-none transition-colors"
        >
          <ArrowLeft size={16} />
          Geri
        </button>
        <button
          type="button"
          onClick={goNext}
          disabled={!canProceed()}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gold text-dark font-semibold rounded-xl hover:bg-gold-hover disabled:opacity-40 disabled:pointer-events-none transition-all duration-200"
        >
          {isLast ? (
            <>
              Gönder
              <Send size={16} />
            </>
          ) : (
            <>
              İleri
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
