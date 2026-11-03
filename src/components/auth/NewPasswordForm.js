'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { supabase } from '@/lib/supabase';
import { Lock } from 'lucide-react';
import { localePath } from '@/lib/routes';

// Landing page of the reset link in the "forgot password" e-mail.
// Supabase signs the visitor in with a short-lived recovery session; here they choose the new password.
export default function NewPasswordForm() {
  const t = useTranslations('auth');
  const locale = useLocale();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') setReady(true);
    });
    // the link carries the session in the URL; give the client a moment to read it
    const timer = setTimeout(async () => {
      const { data } = await supabase.auth.getSession();
      if (cancelled) return;
      if (data.session) setReady(true);
      else setInvalid(true);
    }, 1500);
    return () => {
      cancelled = true;
      clearTimeout(timer);
      sub.subscription.unsubscribe();
    };
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) return setError(t('passwordTooShort'));
    setSaving(true);
    const { error: err } = await supabase.auth.updateUser({ password });
    setSaving(false);
    if (err) return setError(t('errorGeneric'));
    setDone(true);
    setTimeout(() => router.push(localePath(locale, 'panel')), 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-24 bg-[var(--color-soft)]">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-serif text-[var(--color-dark)] mb-6 text-center">{t('newPasswordTitle')}</h1>

        {done ? (
          <p className="text-center text-[var(--color-charcoal)]">{t('passwordUpdated')}</p>
        ) : invalid && !ready ? (
          <div className="text-center space-y-4">
            <p className="text-[var(--color-charcoal)]">{t('linkInvalid')}</p>
            <a href={localePath(locale, 'giris')} className="text-[var(--color-gold)] font-semibold hover:underline">
              {t('backToLogin')}
            </a>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            {error && <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3">{error}</div>}
            <div>
              <label htmlFor="new-password" className="block text-sm font-medium text-[var(--color-charcoal)] mb-1.5">
                {t('newPassword')}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="new-password"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)] outline-none transition-colors"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={saving || !ready}
              className="w-full py-3 bg-[var(--color-gold)] text-white font-semibold rounded-xl hover:bg-[var(--color-gold)]/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? '...' : t('savePassword')}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
