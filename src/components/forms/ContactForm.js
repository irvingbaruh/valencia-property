'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Check, Send } from 'lucide-react';

export default function ContactForm() {
  const t = useTranslations('iletisimPage');
  const [values, setValues] = useState({ name: '', email: '', phone: '', message: '' });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (field) => (e) => setValues((p) => ({ ...p, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!values.name.trim()) errs.name = true;
    if (!values.email.trim()) errs.email = true;
    if (!values.message.trim()) errs.message = true;
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="bg-white rounded-2xl border border-border p-10 text-center">
        <div className="w-14 h-14 rounded-full bg-gold flex items-center justify-center mx-auto mb-5">
          <Check size={24} className="text-white" />
        </div>
        <h3 className="text-xl font-serif text-dark mb-2">{t('submittedTitle')}</h3>
        <p className="text-text-muted">{t('submittedBody')}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-border p-6 sm:p-8 space-y-5">
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1.5">{t('nameLabel')} *</label>
        <input
          type="text"
          value={values.name}
          onChange={handleChange('name')}
          className={`w-full px-4 py-3 bg-soft border rounded-lg text-dark focus:outline-none focus:ring-2 focus:ring-gold/40 ${errors.name ? 'border-red-400' : 'border-border'}`}
        />
      </div>
      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">{t('emailLabel')} *</label>
          <input
            type="email"
            value={values.email}
            onChange={handleChange('email')}
            className={`w-full px-4 py-3 bg-soft border rounded-lg text-dark focus:outline-none focus:ring-2 focus:ring-gold/40 ${errors.email ? 'border-red-400' : 'border-border'}`}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">{t('phoneLabel')}</label>
          <input
            type="tel"
            value={values.phone}
            onChange={handleChange('phone')}
            className="w-full px-4 py-3 bg-soft border border-border rounded-lg text-dark focus:outline-none focus:ring-2 focus:ring-gold/40"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1.5">{t('messageLabel')} *</label>
        <textarea
          rows={4}
          value={values.message}
          onChange={handleChange('message')}
          className={`w-full px-4 py-3 bg-soft border rounded-lg text-dark focus:outline-none focus:ring-2 focus:ring-gold/40 resize-none ${errors.message ? 'border-red-400' : 'border-border'}`}
        />
      </div>
      <button
        type="submit"
        className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gold text-white font-semibold rounded-xl hover:bg-gold-hover transition-colors duration-200"
      >
        {t('submitButton')}
        <Send size={16} />
      </button>
    </form>
  );
}
