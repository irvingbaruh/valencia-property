'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { STAGES } from '@/lib/leads';
import { X, Copy, Check, MessageCircle } from 'lucide-react';

const SITE = 'https://lockandloft.com';
const LANGS = [['tr', 'Türkçe'], ['es', 'Español'], ['en', 'English'], ['de', 'Deutsch']];

// the message that goes to the client together with the login (WhatsApp / SMS / mail), in the client's language
export const messageFor = (lang, name, email, password, kind = 'new') => {
  const first = (name || '').split(' ')[0];
  const url = `${SITE}/${lang}/giris`;
  const R = {
    tr: `Merhaba ${first}, Lock & Loft hesabınız için yeni bir geçici şifre oluşturdum.\n\nGiriş: ${url}\nE-posta: ${email}\nGeçici şifre: ${password}\n\nGirişte kendi şifrenizi belirlemeniz istenecek.`,
    es: `Hola ${first}, he creado una nueva contraseña temporal para su cuenta de Lock & Loft.\n\nAcceso: ${url}\nCorreo: ${email}\nContraseña temporal: ${password}\n\nAl entrar se le pedirá que elija su propia contraseña.`,
    en: `Hi ${first}, I have created a new temporary password for your Lock & Loft account.\n\nSign in: ${url}\nEmail: ${email}\nTemporary password: ${password}\n\nYou will be asked to choose your own password when you sign in.`,
    de: `Hallo ${first}, ich habe ein neues temporäres Passwort für Ihr Lock & Loft-Konto erstellt.\n\nAnmeldung: ${url}\nE-Mail: ${email}\nTemporäres Passwort: ${password}\n\nBeim Login werden Sie gebeten, ein eigenes Passwort zu wählen.`,
  };
  const M = {
    tr: `Merhaba ${first}, Lock & Loft hesabınızı açtım.\n\nGiriş: ${url}\nE-posta: ${email}\nGeçici şifre: ${password}\n\nİlk girişte kendi şifrenizi belirlemeniz istenecek. Her şey için bu hesaptan bana yazabilirsiniz.`,
    es: `Hola ${first}, he creado su cuenta de Lock & Loft.\n\nAcceso: ${url}\nCorreo: ${email}\nContraseña temporal: ${password}\n\nAl entrar por primera vez se le pedirá que elija su propia contraseña.`,
    en: `Hi ${first}, I have set up your Lock & Loft account.\n\nSign in: ${url}\nEmail: ${email}\nTemporary password: ${password}\n\nYou will be asked to choose your own password the first time you sign in.`,
    de: `Hallo ${first}, ich habe Ihr Lock & Loft-Konto angelegt.\n\nAnmeldung: ${url}\nE-Mail: ${email}\nTemporäres Passwort: ${password}\n\nBeim ersten Login werden Sie gebeten, ein eigenes Passwort zu wählen.`,
  };
  const X = kind === 'reset' ? R : M;
  return X[lang] || X.tr;
};

const ERRORS = {
  bad_email: 'E-posta adresi geçersiz.',
  missing_name: 'Ad soyad gerekli.',
  email_exists: 'Bu e-posta ile zaten bir hesap var.',
  forbidden: 'Bu işlem için admin olarak giriş yapmış olmalısınız.',
};

export default function NewMemberModal({ onClose, onCreated }) {
  const [f, setF] = useState({ full_name: '', email: '', phone: '', lang: 'tr', stage: 'won' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState('');
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    const { data, error: err } = await supabase.functions.invoke('admin-create-member', { body: f });
    setSaving(false);
    let code = data?.error;
    if (!code && err) {
      try { code = (await err.context.json())?.error; } catch {}
    }
    if (!data?.ok) return setError(ERRORS[code] || 'Üye açılamadı, lütfen tekrar deneyin.');
    setResult({ ...data, text: messageFor(f.lang, f.full_name, data.email, data.password) });
    onCreated?.();
  };

  const copy = async (key, value) => {
    try { await navigator.clipboard.writeText(value); setCopied(key); setTimeout(() => setCopied(''), 1800); } catch {}
  };

  const digits = f.phone.replace(/\D/g, '');
  const input = 'w-full rounded-lg px-3 py-2.5 text-sm text-white outline-none';
  const box = { background: '#0B0B11', border: '1px solid #1E1E2E' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl p-6 max-h-[90vh] overflow-y-auto" style={{ background: '#151521', border: '1px solid #1E1E2E' }}>
        <button onClick={onClose} className="absolute top-4 right-4 text-[#9A9AAA] hover:text-white"><X className="w-5 h-5" /></button>
        <h2 className="text-lg font-bold text-white mb-1">{result ? 'Üye açıldı' : 'Yeni üye ekle'}</h2>

        {!result ? (
          <form onSubmit={submit} className="space-y-3 mt-4">
            <p className="text-xs text-[#9A9AAA]">Sistem otomatik bir geçici şifre üretir. Üye ilk girişte kendi şifresini belirler.</p>
            {error && <div className="rounded-lg p-3 text-sm" style={{ background: 'rgba(248,113,113,0.12)', color: '#F87171' }}>{error}</div>}
            <label className="block text-xs text-[#9A9AAA]">Ad soyad
              <input required value={f.full_name} onChange={set('full_name')} className={`${input} mt-1`} style={box} />
            </label>
            <label className="block text-xs text-[#9A9AAA]">E-posta (giriş adresi)
              <input required type="email" value={f.email} onChange={set('email')} className={`${input} mt-1`} style={box} />
            </label>
            <label className="block text-xs text-[#9A9AAA]">Telefon (ülke koduyla, örn. +905321234567)
              <input value={f.phone} onChange={set('phone')} inputMode="tel" className={`${input} mt-1`} style={box} />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-xs text-[#9A9AAA]">Dil
                <select value={f.lang} onChange={set('lang')} className={`${input} mt-1`} style={box}>
                  {LANGS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                </select>
              </label>
              <label className="block text-xs text-[#9A9AAA]">Aşama
                <select value={f.stage} onChange={set('stage')} className={`${input} mt-1`} style={box}>
                  {STAGES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                </select>
              </label>
            </div>
            <button type="submit" disabled={saving} className="w-full py-2.5 rounded-lg text-sm font-semibold disabled:opacity-60" style={{ background: '#C9A84C', color: '#0B0B11' }}>
              {saving ? 'Açılıyor…' : 'Üyeyi aç'}
            </button>
          </form>
        ) : (
          <div className="space-y-4 mt-4">
            <div className="rounded-lg p-4" style={box}>
              <p className="text-xs text-[#9A9AAA]">E-posta</p>
              <p className="text-sm text-white mb-3">{result.email}</p>
              <p className="text-xs text-[#9A9AAA]">Geçici şifre (bu pencere kapanınca bir daha gösterilmez)</p>
              <div className="flex items-center gap-2 mt-1">
                <code className="text-lg font-semibold tracking-wide" style={{ color: '#C9A84C' }}>{result.password}</code>
                <button onClick={() => copy('pw', result.password)} className="text-[#9A9AAA] hover:text-white" aria-label="Şifreyi kopyala">
                  {copied === 'pw' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <p className="text-xs text-[#9A9AAA] mb-1">Üyeye gidecek mesaj</p>
              <pre className="whitespace-pre-wrap text-sm text-white rounded-lg p-3" style={box}>{result.text}</pre>
            </div>
            <div className="flex flex-wrap gap-2">
              {digits.length >= 8 && (
                <a href={`https://wa.me/${digits}?text=${encodeURIComponent(result.text)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold" style={{ background: '#25D366', color: '#0B0B11' }}>
                  <MessageCircle className="w-4 h-4" /> WhatsApp ile gönder
                </a>
              )}
              <button onClick={() => copy('msg', result.text)} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white" style={box}>
                {copied === 'msg' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} Mesajı kopyala
              </button>
              <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-[#9A9AAA] hover:text-white">Kapat</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
