'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/providers/AuthProvider';
import AdminLayout from '@/components/admin/AdminLayout';
import { KeyRound, ShieldCheck, ShieldOff } from 'lucide-react';

const card = { background: '#151521', border: '1px solid #1E1E2E' };
const field = { background: '#0B0B11', border: '1px solid #1E1E2E' };

function PasswordSection({ email }) {
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [msg, setMsg] = useState(null);
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setMsg(null);
    if (pw.length < 10) return setMsg({ ok: false, text: 'Şifre en az 10 karakter olmalı.' });
    if (pw !== pw2) return setMsg({ ok: false, text: 'Şifreler aynı değil.' });
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setSaving(false);
    if (error) {
      setMsg({ ok: false, text: 'Şifre kaydedilemedi. Authenticator açıksa oturumu kapatıp kodla tekrar girin.' });
    } else {
      setPw('');
      setPw2('');
      setMsg({ ok: true, text: `Şifre kaydedildi. Artık ${email} ve bu şifreyle giriş yapabilirsiniz.` });
    }
  };

  return (
    <section className="rounded-xl p-5" style={card}>
      <h2 className="flex items-center gap-2 text-base font-semibold text-white mb-1">
        <KeyRound className="w-4 h-4 text-[#C9A84C]" />
        Giriş şifresi
      </h2>
      <p className="text-sm text-[#9A9AAA] mb-4">
        Kullanıcı adınız e-posta adresiniz: <span className="text-white">{email}</span>
      </p>
      <form onSubmit={submit} className="space-y-3 max-w-sm">
        <input
          type="password"
          autoComplete="new-password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          placeholder="Yeni şifre (en az 10 karakter)"
          aria-label="Yeni şifre"
          className="w-full rounded-lg px-3 py-2.5 text-sm text-white outline-none placeholder:text-[#6A6A7A]"
          style={field}
        />
        <input
          type="password"
          autoComplete="new-password"
          value={pw2}
          onChange={(e) => setPw2(e.target.value)}
          placeholder="Yeni şifre (tekrar)"
          aria-label="Yeni şifre tekrar"
          className="w-full rounded-lg px-3 py-2.5 text-sm text-white outline-none placeholder:text-[#6A6A7A]"
          style={field}
        />
        {msg && (
          <p className={`text-sm ${msg.ok ? 'text-green-400' : 'text-red-400'}`} role="status">
            {msg.text}
          </p>
        )}
        <button
          type="submit"
          disabled={saving || !pw}
          className="px-4 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50"
          style={{ background: '#C9A84C', color: '#0B0B11' }}
        >
          {saving ? 'Kaydediliyor…' : 'Şifreyi kaydet'}
        </button>
      </form>
    </section>
  );
}

function MfaSection() {
  const [factor, setFactor] = useState(undefined); // undefined = loading, null = none
  const [enroll, setEnroll] = useState(null); // { id, qr, secret }
  const [code, setCode] = useState('');
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase.auth.mfa.listFactors();
    setFactor(data?.totp?.[0] || null);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const start = async () => {
    setBusy(true);
    setMsg(null);
    // drop abandoned, unverified setups so a new one can start
    const { data: all } = await supabase.auth.mfa.listFactors();
    for (const f of all?.all || []) {
      if (f.factor_type === 'totp' && f.status !== 'verified') {
        await supabase.auth.mfa.unenroll({ factorId: f.id });
      }
    }
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp', friendlyName: 'Authenticator' });
    setBusy(false);
    if (error) return setMsg({ ok: false, text: 'Kurulum başlatılamadı. Sayfayı yenileyip tekrar deneyin.' });
    setEnroll({ id: data.id, qr: data.totp.qr_code, secret: data.totp.secret });
  };

  const confirm = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId: enroll.id, code: code.trim() });
    setBusy(false);
    if (error) return setMsg({ ok: false, text: 'Kod hatalı. Uygulamadaki güncel 6 haneli kodu girin.' });
    setEnroll(null);
    setCode('');
    setMsg({ ok: true, text: 'Authenticator açıldı. Bundan sonra girişte kod istenecek.' });
    load();
  };

  const remove = async () => {
    setBusy(true);
    setMsg(null);
    const { error } = await supabase.auth.mfa.unenroll({ factorId: factor.id });
    setBusy(false);
    if (error) return setMsg({ ok: false, text: 'Kapatılamadı. Kodla giriş yapmış bir oturumda tekrar deneyin.' });
    setMsg({ ok: true, text: 'Authenticator kapatıldı.' });
    load();
  };

  return (
    <section className="rounded-xl p-5" style={card}>
      <h2 className="flex items-center gap-2 text-base font-semibold text-white mb-1">
        {factor ? <ShieldCheck className="w-4 h-4 text-green-400" /> : <ShieldOff className="w-4 h-4 text-[#C9A84C]" />}
        Authenticator (iki adımlı doğrulama)
      </h2>

      {factor === undefined && <p className="text-sm text-[#9A9AAA]">Yükleniyor…</p>}

      {factor && !enroll && (
        <div className="space-y-3">
          <p className="text-sm text-green-400">Açık. Girişte şifreden sonra uygulamadaki kod isteniyor.</p>
          <button
            onClick={remove}
            disabled={busy}
            className="px-4 py-2 rounded-lg text-sm text-red-300 disabled:opacity-50"
            style={{ background: 'rgba(220,28,46,0.12)' }}
          >
            Authenticator'ı kapat
          </button>
        </div>
      )}

      {factor === null && !enroll && (
        <div className="space-y-3">
          <p className="text-sm text-[#9A9AAA]">
            Google Authenticator, Microsoft Authenticator, 1Password veya Authy gibi bir uygulama gerekir.
          </p>
          <button
            onClick={start}
            disabled={busy}
            className="px-4 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50"
            style={{ background: '#C9A84C', color: '#0B0B11' }}
          >
            Authenticator kur
          </button>
        </div>
      )}

      {enroll && (
        <form onSubmit={confirm} className="space-y-4 mt-2">
          <p className="text-sm text-[#F5F0E8]">
            1. Uygulamada yeni hesap ekleyip bu QR kodu okutun.
            <br />
            2. Uygulamanın gösterdiği 6 haneli kodu aşağıya yazın.
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={enroll.qr} alt="Authenticator QR kodu" className="w-44 h-44 rounded-lg bg-white p-2" />
          <p className="text-xs text-[#9A9AAA] break-all">
            QR okutamıyorsanız anahtarı elle girin: <span className="text-white select-all">{enroll.secret}</span>
          </p>
          <input
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            placeholder="6 haneli kod"
            aria-label="Authenticator kodu"
            className="w-48 rounded-lg px-3 py-2.5 text-center text-lg tracking-[0.4em] text-white outline-none"
            style={field}
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={busy || code.length !== 6}
              className="px-4 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50"
              style={{ background: '#C9A84C', color: '#0B0B11' }}
            >
              {busy ? 'Doğrulanıyor…' : 'Doğrula ve aç'}
            </button>
            <button type="button" onClick={() => setEnroll(null)} className="px-4 py-2.5 rounded-lg text-sm text-[#9A9AAA] hover:text-white">
              Vazgeç
            </button>
          </div>
        </form>
      )}

      {msg && (
        <p className={`text-sm mt-3 ${msg.ok ? 'text-green-400' : 'text-red-400'}`} role="status">
          {msg.text}
        </p>
      )}
    </section>
  );
}

export default function AdminSecurityPage() {
  const { user } = useAuth();
  return (
    <AdminLayout activeSection="guvenlik">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Güvenlik</h1>
          <p className="text-sm text-[#9A9AAA] mt-1">Yönetim paneline giriş şifresi ve iki adımlı doğrulama</p>
        </div>
        <PasswordSection email={user?.email || ''} />
        <MfaSection />
      </div>
    </AdminLayout>
  );
}
