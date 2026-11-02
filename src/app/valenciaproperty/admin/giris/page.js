'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { Lock, Mail, LogOut } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const { user, profile, loading, isAdmin, signIn, signOut } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Already signed in as admin → straight to the dashboard
  useEffect(() => {
    if (!loading && user && isAdmin) {
      router.replace('/valenciaproperty/admin/dashboard/');
    }
  }, [loading, user, isAdmin, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    const { error: err } = await signIn(email.trim(), password);
    setSubmitting(false);
    if (err) setError('E-posta veya şifre hatalı.');
  };

  const signedInNotAdmin = !loading && user && profile && !isAdmin;

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#0B0B11', color: '#F5F0E8' }}>
      <div className="w-full max-w-sm rounded-2xl p-8" style={{ background: '#151521', border: '1px solid #1E1E2E' }}>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-bold" style={{ background: '#DC1C2E' }}>
            VP
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white">Yönetim Paneli</h1>
            <p className="text-xs text-[#9A9AAA]">Valencia Property</p>
          </div>
        </div>

        {signedInNotAdmin ? (
          <div className="space-y-4">
            <p className="text-sm text-[#F5F0E8]">
              <span className="font-medium">{user.email}</span> hesabının yönetici yetkisi yok.
            </p>
            <button
              onClick={() => signOut()}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium text-white"
              style={{ background: '#1E1E2E' }}
            >
              <LogOut className="w-4 h-4" />
              Çıkış yap, başka hesapla dene
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block">
              <span className="text-xs text-[#9A9AAA]">E-posta</span>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6A6A7A]" />
                <input
                  type="email"
                  required
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg text-sm text-white outline-none focus:ring-2 focus:ring-[#C9A84C]/50"
                  style={{ background: '#0B0B11', border: '1px solid #1E1E2E' }}
                />
              </div>
            </label>
            <label className="block">
              <span className="text-xs text-[#9A9AAA]">Şifre</span>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6A6A7A]" />
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg text-sm text-white outline-none focus:ring-2 focus:ring-[#C9A84C]/50"
                  style={{ background: '#0B0B11', border: '1px solid #1E1E2E' }}
                />
              </div>
            </label>
            {error && <p className="text-sm text-red-400" role="alert">{error}</p>}
            <button
              type="submit"
              disabled={submitting || loading}
              className="w-full py-2.5 rounded-lg text-sm font-semibold disabled:opacity-60"
              style={{ background: '#C9A84C', color: '#0B0B11' }}
            >
              {submitting ? 'Giriş yapılıyor…' : 'Giriş yap'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
