'use client';

/*
 * ConsultationForm — branching consultation wizard
 * ================================================
 * Questions -> contact details -> account. The last step creates the member
 * account and stores every answer with it:
 *  - new visitor: answers travel in the sign-up metadata; a database trigger
 *    (handle_new_user) writes the profile and a client_intake row, so nothing
 *    is lost while the e-mail is still unconfirmed.
 *  - logged-in member: the same data is written straight to client_intake and
 *    any empty profile fields are filled in.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { ArrowLeft, ArrowRight, Check, Send } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { supabase } from '@/lib/supabase';
import { localePath } from '@/lib/routes';

const opts = (values) => values.map((value) => ({ value }));

const getSteps = (answers, loggedIn) => {
  const steps = [{ key: 'propertyType', type: 'single', options: opts(['home', 'investment', 'land', 'unsure']) }];

  if (answers.propertyType === 'investment') {
    steps.push({ key: 'investmentStrategy', type: 'single', options: opts(['airbnb', 'longterm', 'flip', 'unsure']) });
  }
  if (answers.propertyType === 'land') {
    steps.push({ key: 'landPlan', type: 'single', options: opts(['build', 'project', 'unsure']) });
  }
  if (answers.propertyType !== 'land') {
    steps.push({ key: 'condition', type: 'single', options: opts(['ready', 'light', 'renovation', 'any']) });
  }

  steps.push({
    key: 'region',
    type: 'multi',
    hint: true,
    options: opts(['valencia-centro', 'el-carmen', 'benimaclet', 'ciutat-vella', 'poblats-maritims', 'alicante', 'any']),
  });
  steps.push({ key: 'budget', type: 'single', options: opts(['under150', '150-300', '300-500', '500plus']) });
  steps.push({ key: 'timeline', type: 'single', options: opts(['now', '3-6', '6-12', 'researching']) });
  steps.push({
    key: 'services',
    type: 'multi',
    hint: true,
    subtitle: true,
    options: opts(['emlak', 'legal', 'renovasyon', 'staging', 'management', 'airbnb', 'insaat']),
  });
  steps.push({ key: 'location', type: 'single', options: opts(['turkey', 'europe-tr', 'spain', 'other']) });
  steps.push({ key: 'contact', type: 'contact' });
  if (!loggedIn) steps.push({ key: 'account', type: 'account', subtitle: true });

  return steps;
};

const COUNTRY_BY_LOCATION = { turkey: 'Turkey', spain: 'Spain' };

const inputCls = (bad) =>
  `w-full px-4 py-3 bg-white/5 border rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-gold/50 ${bad ? 'border-red-500/60' : 'border-white/15'}`;

export default function ConsultationForm() {
  const t = useTranslations('consult');
  const locale = useLocale();
  const { user, profile, signUp } = useAuth();
  const loggedIn = Boolean(user);

  const [answers, setAnswers] = useState({});
  const [stepIndex, setStepIndex] = useState(0);
  const [done, setDone] = useState(null); // null | 'checkEmail' | 'saved'
  const [sending, setSending] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');

  const steps = getSteps(answers, loggedIn);
  const current = steps[stepIndex];
  const isLast = stepIndex === steps.length - 1;
  const progress = ((stepIndex + 1) / steps.length) * 100;

  const set = (key, value) => setAnswers((prev) => ({ ...prev, [key]: value }));
  const toggleMulti = (key, value) => {
    const list = answers[key] || [];
    set(key, list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  };

  // Logged-in members: pre-fill what we already know
  const val = (k, fallback = '') => {
    if (answers[k] !== undefined) return answers[k];
    if (k === 'name') return profile?.full_name || fallback;
    if (k === 'email') return user?.email || fallback;
    if (k === 'phone') return profile?.phone || fallback;
    return fallback;
  };

  const canProceed = () => (current.type === 'single' ? Boolean(answers[current.key]) : true);

  const intakePayload = () => {
    const { password, consent, name, email, phone, preferredLanguage, ...rest } = answers;
    return rest; // propertyType, investmentStrategy, region, budget, timeline, services, location, note...
  };

  const submit = async () => {
    setSending(true);
    setMessage('');
    const name = val('name').trim();
    const email = val('email').trim();
    const phone = val('phone').trim();
    const prefLang = answers.preferredLanguage || locale;
    const intake = intakePayload();
    const country = COUNTRY_BY_LOCATION[answers.location] || null;

    try {
      if (loggedIn) {
        const { error } = await supabase.from('client_intake').insert({
          user_id: user.id,
          goals: [intake.propertyType, intake.investmentStrategy, intake.landPlan].filter(Boolean),
          budget_range: intake.budget || null,
          timeline: intake.timeline || null,
          preferred_regions: intake.region || [],
          property_types: intake.propertyType ? [intake.propertyType] : [],
          desired_features: intake.condition ? [intake.condition] : [],
          selected_services: intake.services || [],
          notes: intake.note || null,
          status: 'submitted',
          submitted_at: new Date().toISOString(),
          answers: intake,
          lang: locale,
        });
        if (error) throw error;
        const updates = {};
        if (!profile?.phone && phone) updates.phone = phone;
        if (!profile?.whatsapp_phone && phone) updates.whatsapp_phone = phone;
        if (!profile?.country && country) updates.country = country;
        if (!profile?.full_name && name) updates.full_name = name;
        if (Object.keys(updates).length) await supabase.from('profiles').update(updates).eq('id', user.id);
        setDone('saved');
      } else {
        const { data, error } = await signUp(email, answers.password, name, {
          phone,
          country,
          preferred_language: prefLang,
          intake,
        });
        if (error) {
          setMessage(/already registered/i.test(error.message || '') ? t('errTaken') : t('errGeneric'));
        } else if (data?.user?.identities?.length === 0) {
          setMessage(t('errTaken'));
        } else {
          setDone('checkEmail');
        }
      }
    } catch {
      setMessage(t('errGeneric'));
    }
    setSending(false);
  };

  const goNext = () => {
    setMessage('');
    if (current.type === 'contact') {
      const errs = {};
      if (!val('name').trim()) errs.name = true;
      if (!/^\S+@\S+\.\S+$/.test(val('email').trim())) errs.email = true;
      if (!val('phone').trim()) errs.phone = true;
      setErrors(errs);
      if (Object.keys(errs).length) {
        setMessage(t('errRequired'));
        return;
      }
      if (loggedIn) return submit();
    }
    if (current.type === 'account') {
      const errs = {};
      if (!answers.password || answers.password.length < 8) errs.password = true;
      if (!answers.consent) errs.consent = true;
      setErrors(errs);
      if (errs.password) return setMessage(t('errPassword'));
      if (errs.consent) return setMessage(t('errConsent'));
      return submit();
    }
    setStepIndex((i) => Math.min(i + 1, steps.length - 1));
  };

  const goBack = () => {
    setMessage('');
    setStepIndex((i) => Math.max(i - 1, 0));
  };

  if (done) {
    return (
      <div className="bg-dark rounded-2xl p-10 sm:p-14 text-center">
        <div className="w-16 h-16 rounded-full bg-gold flex items-center justify-center mx-auto mb-6">
          <Check size={28} className="text-dark" />
        </div>
        <h3 className="text-2xl font-serif text-white mb-3">
          {t('thanksTitle')}, {val('name').split(' ')[0]}!
        </h3>
        <p className="text-white/60 max-w-md mx-auto leading-relaxed">
          {done === 'checkEmail' ? t('thanksCheckEmail') : t('thanksSaved')}
        </p>
        {done === 'saved' && (
          <a
            href={localePath(locale, 'panel')}
            className="inline-flex items-center gap-2 mt-7 px-6 py-3 bg-gold text-dark font-semibold rounded-xl hover:bg-gold-hover transition-colors"
          >
            {t('goPanel')}
            <ArrowRight size={16} />
          </a>
        )}
      </div>
    );
  }

  return (
    <div className="bg-dark rounded-2xl p-6 sm:p-10">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-white/40 uppercase tracking-wider">
          {t('step')} {stepIndex + 1} {t('of')} {steps.length}
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
          <h3 className="text-xl sm:text-2xl font-serif text-white mb-1.5">{t(`q.${current.key}.title`)}</h3>
          {current.subtitle ? (
            <p className="text-sm text-white/50 mb-6">{t(`q.${current.key}.subtitle`)}</p>
          ) : current.hint ? (
            <p className="text-sm text-white/50 mb-6">{t('multiHint')}</p>
          ) : (
            <div className="mb-6" />
          )}

          {current.type === 'single' && (
            <div className="grid sm:grid-cols-2 gap-3">
              {current.options.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => set(current.key, opt.value)}
                  className={`text-left px-5 py-4 rounded-xl border transition-all duration-200 ${
                    answers[current.key] === opt.value
                      ? 'bg-gold border-gold text-dark font-semibold'
                      : 'bg-white/5 border-white/10 text-white/80 hover:border-gold/40 hover:bg-white/10'
                  }`}
                >
                  {t(`o.${current.key}.${opt.value}`)}
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
                    {t(`o.${current.key}.${opt.value}`)}
                  </button>
                );
              })}
            </div>
          )}

          {current.type === 'contact' && (
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs text-white/50 mb-1.5">{t('nameLabel')} *</label>
                <input
                  type="text"
                  autoComplete="name"
                  value={val('name')}
                  onChange={(e) => set('name', e.target.value)}
                  className={inputCls(errors.name)}
                  placeholder={t('namePh')}
                />
              </div>
              <div>
                <label className="block text-xs text-white/50 mb-1.5">{t('emailLabel')} *</label>
                <input
                  type="email"
                  autoComplete="email"
                  value={val('email')}
                  onChange={(e) => set('email', e.target.value)}
                  disabled={loggedIn}
                  className={`${inputCls(errors.email)} disabled:opacity-60`}
                  placeholder="name@email.com"
                />
              </div>
              <div>
                <label className="block text-xs text-white/50 mb-1.5">{t('phoneLabel')} *</label>
                <input
                  type="tel"
                  autoComplete="tel"
                  value={val('phone')}
                  onChange={(e) => set('phone', e.target.value)}
                  className={inputCls(errors.phone)}
                  placeholder="+90 5XX XXX XX XX"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs text-white/50 mb-1.5">{t('langLabel')}</label>
                <select
                  value={answers.preferredLanguage || locale}
                  onChange={(e) => set('preferredLanguage', e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold/50"
                >
                  <option value="tr" className="bg-dark">Türkçe</option>
                  <option value="en" className="bg-dark">English</option>
                  <option value="es" className="bg-dark">Español</option>
                  <option value="de" className="bg-dark">Deutsch</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs text-white/50 mb-1.5">{t('noteLabel')}</label>
                <textarea
                  value={answers.note || ''}
                  onChange={(e) => set('note', e.target.value)}
                  rows={3}
                  className={`${inputCls(false)} resize-none`}
                  placeholder={t('notePh')}
                />
              </div>
              {loggedIn && <p className="sm:col-span-2 text-xs text-gold">{t('loggedInAs')}</p>}
            </div>
          )}

          {current.type === 'account' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-white/50 mb-1.5">{t('emailLabel')}</label>
                <p className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white/70">{val('email')}</p>
              </div>
              <div>
                <label className="block text-xs text-white/50 mb-1.5">{t('passwordLabel')} *</label>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={answers.password || ''}
                  onChange={(e) => set('password', e.target.value)}
                  className={inputCls(errors.password)}
                />
                <p className="text-xs text-white/40 mt-1.5">{t('passwordHint')}</p>
              </div>
              <label className={`flex items-start gap-3 text-sm cursor-pointer ${errors.consent ? 'text-red-300' : 'text-white/70'}`}>
                <input
                  type="checkbox"
                  checked={Boolean(answers.consent)}
                  onChange={(e) => set('consent', e.target.checked)}
                  className="mt-1 accent-[#C9A84C]"
                />
                <span>{t('consent')}</span>
              </label>
              <p className="text-sm text-white/50">
                {t('haveAccount')}{' '}
                <a href={localePath(locale, 'giris')} className="text-gold hover:underline">
                  {t('loginLink')}
                </a>
              </p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {message && (
        <p className="mt-5 text-sm text-red-300" role="alert">
          {message}{' '}
          {message === t('errTaken') && (
            <a href={localePath(locale, 'giris')} className="text-gold underline">
              {t('loginLink')}
            </a>
          )}
        </p>
      )}

      <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
        <button
          type="button"
          onClick={goBack}
          disabled={stepIndex === 0 || sending}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm text-white/60 hover:text-white disabled:opacity-0 disabled:pointer-events-none transition-colors"
        >
          <ArrowLeft size={16} />
          {t('back')}
        </button>
        <button
          type="button"
          onClick={goNext}
          disabled={!canProceed() || sending}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gold text-dark font-semibold rounded-xl hover:bg-gold-hover disabled:opacity-40 disabled:pointer-events-none transition-all duration-200"
        >
          {sending ? (
            t('sending')
          ) : isLast || (current.type === 'contact' && loggedIn) ? (
            <>
              {loggedIn ? t('submitLoggedIn') : t('submit')}
              <Send size={16} />
            </>
          ) : (
            <>
              {t('next')}
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
