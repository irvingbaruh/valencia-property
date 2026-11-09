'use client';

/*
 * ConsultationForm — consultation questionnaire (6 sections)
 * ==========================================================
 * Contact details + five question sections -> account. The last step creates the member
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

// The questionnaire: six sections, one page each (single = pick one, text = free text).
const SECTIONS = [
  { key: 'contact', type: 'contact' },
  {
    key: 'purpose',
    questions: [
      { key: 'investType', type: 'single', options: ['residential', 'commercial', 'land', 'other'] },
      { key: 'timeframe', type: 'single', options: ['now', '3-6', '6plus'] },
      { key: 'readyToBuy', type: 'single', options: ['yes', 'no'] },
      { key: 'purpose', type: 'single', options: ['rental', 'holiday', 'live', 'other'] },
      { key: 'priority', type: 'single', options: ['monthly', 'appreciation', 'both'] },
      { key: 'rentalType', type: 'single', options: ['long', 'seasonal', 'both'] },
      { key: 'holdYears', type: 'single', options: ['1-3', '3-5', '5-10', '10plus', 'undecided'] },
    ],
  },
  {
    key: 'prefs',
    questions: [
      { key: 'area', type: 'single', options: ['center', 'sea', 'nearCenter', 'outside', 'any'] },
      { key: 'condition', type: 'single', options: ['ready', 'newProject', 'any'] },
      { key: 'propertyType', type: 'single', options: ['apartment', 'penthouse', 'house'] },
      { key: 'bedrooms', type: 'single', options: ['studio', '1', '2', '3', 'any'] },
      { key: 'bathrooms', type: 'single', options: ['1', '2', '3plus', 'any'] },
      { key: 'unwanted', type: 'textarea' },
      { key: 'furnished', type: 'single', options: ['furnished', 'unfurnished', 'any'] },
    ],
  },
  {
    key: 'budget',
    questions: [
      { key: 'budget', type: 'text', required: true },
      { key: 'budgetIncludes', type: 'single', options: ['all', 'separate', 'unknown'] },
      { key: 'payment', type: 'single', options: ['cash', 'partial', 'undecided'] },
    ],
  },
  {
    key: 'income',
    questions: [
      { key: 'targetRent', type: 'text' },
      { key: 'renovation', type: 'single', options: ['yes', 'no', 'budget'] },
      { key: 'management', type: 'single', options: ['yes', 'no', 'offer'] },
    ],
  },
  {
    key: 'legal',
    questions: [
      { key: 'nationality', type: 'single', options: ['spanish', 'eu', 'turkish', 'other'] },
      { key: 'residency', type: 'single', options: ['resident', 'applying', 'none', 'info'], showIf: (a) => a.nationality === 'turkish' || a.nationality === 'other' },
      { key: 'nie', type: 'single', options: ['have', 'none', 'unknown'], showIf: (a) => a.nationality && a.nationality !== 'spanish' },
      { key: 'bank', type: 'single', options: ['have', 'need', 'info'], showIf: (a) => a.nationality && a.nationality !== 'spanish' },
      { key: 'legal', type: 'single', options: ['yes', 'no', 'info'] },
      { key: 'note', type: 'textarea' },
    ],
  },
];

// Questions that apply to the answers so far (e.g. residence-permit questions only for non-EU buyers)
const visibleQuestions = (section, a) => (section.questions || []).filter((q) => !q.showIf || q.showIf(a));

const getSteps = (loggedIn) => [
  ...SECTIONS,
  ...(loggedIn ? [] : [{ key: 'account', type: 'account', subtitle: true }]),
];

// Services the admin can assign, derived from the yes/no answers
const deriveServices = (a) => {
  const list = [];
  if (a.legal === 'yes') list.push('legal');
  if (a.management === 'yes') list.push('management');
  if (a.renovation === 'yes') list.push('renovasyon');
  return list;
};

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

  const steps = getSteps(loggedIn);
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

  const canProceed = () => {
    if (!current.questions) return true;
    return visibleQuestions(current, answers).every((q) => {
      if (q.type === 'single') return Boolean(answers[q.key]);
      if (q.required) return Boolean((answers[q.key] || '').trim());
      return true;
    });
  };

  const intakePayload = () => {
    const { password, consent, marketing, name, email, phone, preferredLanguage, ...rest } = answers;
    // drop answers to questions that no longer apply (e.g. the buyer changed their nationality answer)
    SECTIONS.forEach((sec) => (sec.questions || []).forEach((q) => {
      if (q.showIf && !q.showIf(answers)) delete rest[q.key];
    }));
    return { ...rest, services: deriveServices(answers) };
  };

  const submit = async () => {
    setSending(true);
    setMessage('');
    const name = val('name').trim();
    const email = val('email').trim();
    const phone = val('phone').trim();
    const prefLang = locale;
    const intake = intakePayload();
    const country = null;

    try {
      if (loggedIn) {
        const { error } = await supabase.from('client_intake').insert({
          user_id: user.id,
          goals: [intake.investType, intake.purpose].filter(Boolean),
          budget_range: (intake.budget || '').slice(0, 200) || null,
          timeline: intake.timeframe || null,
          preferred_regions: intake.area ? [intake.area] : [],
          property_types: intake.propertyType ? [intake.propertyType] : [],
          desired_features: [intake.condition, intake.furnished].filter(Boolean),
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
        if (answers.marketing && !profile?.marketing_opt_in) updates.marketing_opt_in = true;
        if (Object.keys(updates).length) await supabase.from('profiles').update(updates).eq('id', user.id);
        setDone('saved');
      } else {
        const { data, error } = await signUp(email, answers.password, name, {
          phone,
          country,
          preferred_language: prefLang,
          marketing: Boolean(answers.marketing),
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
    }
    if (isLast && current.type !== 'account') return submit();
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
        <p className="text-white max-w-md mx-auto leading-relaxed">
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
        <span className="text-xs text-white uppercase tracking-wider">
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
          <h3 className="text-xl sm:text-2xl font-serif text-white mb-1.5">{t(`q.${current.type === 'account' || current.type === 'contact' ? current.key : 's_' + current.key}.title`)}</h3>
          {current.subtitle ? (
            <p className="text-sm text-white mb-6">{t(`q.${current.key}.subtitle`)}</p>
          ) : (
            <div className="mb-6" />
          )}

          {current.questions && (
            <div className="space-y-7">
              {visibleQuestions(current, answers).map((q) => (
                <div key={q.key}>
                  <p className="text-sm sm:text-base text-white mb-3 leading-snug">
                    {t(`q.${q.key}.title`)}
                    {q.type !== 'single' && !q.required && (
                      <span className="text-white"> ({t('optional')})</span>
                    )}
                  </p>
                  {q.type === 'single' && (
                    <div className="flex flex-wrap gap-2.5">
                      {q.options.map((value) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => set(q.key, value)}
                          className={`text-left px-4 py-2.5 rounded-xl border text-sm transition-all duration-200 ${
                            answers[q.key] === value
                              ? 'bg-gold border-gold text-dark font-semibold'
                              : 'bg-white/5 border-white/10 text-white hover:border-gold/40 hover:bg-white/10'
                          }`}
                        >
                          {t(`o.${q.key}.${value}`)}
                        </button>
                      ))}
                    </div>
                  )}
                  {q.type === 'text' && (
                    <input
                      type="text"
                      value={answers[q.key] || ''}
                      onChange={(e) => set(q.key, e.target.value)}
                      className={inputCls(false)}
                      placeholder={t('answerPh')}
                    />
                  )}
                  {q.type === 'textarea' && (
                    <textarea
                      value={answers[q.key] || ''}
                      onChange={(e) => set(q.key, e.target.value)}
                      rows={3}
                      className={`${inputCls(false)} resize-none`}
                      placeholder={t('answerPh')}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {current.type === 'contact' && (
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs text-white mb-1.5">{t('nameLabel')} *</label>
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
                <label className="block text-xs text-white mb-1.5">{t('emailLabel')} *</label>
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
                <label className="block text-xs text-white mb-1.5">{t('phoneLabel')} *</label>
                <input
                  type="tel"
                  autoComplete="tel"
                  value={val('phone')}
                  onChange={(e) => set('phone', e.target.value)}
                  className={inputCls(errors.phone)}
                  placeholder="+90 5XX XXX XX XX"
                />
              </div>
              {loggedIn && <p className="sm:col-span-2 text-xs text-gold">{t('loggedInAs')}</p>}
              {loggedIn && !profile?.marketing_opt_in && (
                <label className="sm:col-span-2 flex items-start gap-3 text-sm cursor-pointer text-white">
                  <input
                    type="checkbox"
                    checked={Boolean(answers.marketing)}
                    onChange={(e) => set('marketing', e.target.checked)}
                    className="mt-1 accent-[#C9A84C]"
                  />
                  <span>{t('marketing')}</span>
                </label>
              )}
            </div>
          )}

          {current.type === 'account' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-white mb-1.5">{t('emailLabel')}</label>
                <p className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white">{val('email')}</p>
              </div>
              <div>
                <label className="block text-xs text-white mb-1.5">{t('passwordLabel')} *</label>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={answers.password || ''}
                  onChange={(e) => set('password', e.target.value)}
                  className={inputCls(errors.password)}
                />
                <p className="text-xs text-white mt-1.5">{t('passwordHint')}</p>
              </div>
              <label className={`flex items-start gap-3 text-sm cursor-pointer ${errors.consent ? 'text-red-300' : 'text-white'}`}>
                <input
                  type="checkbox"
                  checked={Boolean(answers.consent)}
                  onChange={(e) => set('consent', e.target.checked)}
                  className="mt-1 accent-[#C9A84C]"
                />
                <span>
                  {t('consent')}{' '}
                  <a href={localePath(locale, 'gizlilik')} target="_blank" rel="noopener" className="text-gold underline">
                    {t('privacyLink')}
                  </a>
                </span>
              </label>
              <label className="flex items-start gap-3 text-sm cursor-pointer text-white">
                <input
                  type="checkbox"
                  checked={Boolean(answers.marketing)}
                  onChange={(e) => set('marketing', e.target.checked)}
                  className="mt-1 accent-[#C9A84C]"
                />
                <span>{t('marketing')}</span>
              </label>
              <p className="text-sm text-white">
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
          className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm text-white hover:text-white disabled:opacity-0 disabled:pointer-events-none transition-colors"
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
          ) : isLast ? (
            <>
              {current.type === 'account' ? t('submit') : t('submitLoggedIn')}
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
