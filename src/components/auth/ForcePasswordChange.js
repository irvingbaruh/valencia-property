'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Lock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/providers/AuthProvider';

// Members whose account an admin opened get a temporary password (user_metadata.must_change_password).
// Until they choose their own, this full-screen step covers the site.
export default function ForcePasswordChange() {
  const t = useTranslations('auth');
  const { user, signOut } = useAuth();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  if (!user || done || user.user_metadata?.must_change_password !== true) return null;

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) return setError(t('passwordTooShort'));
    setSaving(true);
    const { error: err } = await supabase.auth.updateUser({ password, data: { must_change_password: false } });
    setSaving(false);
    if (err) return setError(t('errorGeneric'));
    setDone(true);
  };

  return (
    <div className="fixed inset-0 z-[200] overflow-y-auto bg-[var(--color-soft)]">
      <div className="min-h-full flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-2xl font-serif text-[var(--color-dark)] mb-3 text-center">{t('forceTitle')}</h1>
          <p className="text-sm text-[var(--color-charcoal)] text-center mb-6">{t('forceIntro')}</p>
          <form onSubmit={submit} className="space-y-4">
            {error && <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3">{error}</div>}
            <div>
              <label htmlFor="force-password" className="block text-sm font-medium text-[var(--color-charcoal)] mb-1.5">{t('newPassword')}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="force-password"
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
            <button type="submit" disabled={saving} className="w-full py-3 bg-[var(--color-gold)] text-white font-semibold rounded-xl hover:bg-[var(--color-gold)]/90 transition-colors disabled:opacity-60">
              {saving ? '...' : t('savePassword')}
            </button>
            <button type="button" onClick={() => signOut()} className="w-full text-sm text-gray-500 hover:underline">{t('logout')}</button>
          </form>
        </div>
      </div>
    </div>
  );
}
