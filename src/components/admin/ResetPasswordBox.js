'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { messageFor } from '@/components/admin/NewMemberModal';
import { KeyRound, Copy, Check, MessageCircle } from 'lucide-react';

const ERRORS = {
  cannot_reset_admin: 'Admin hesaplarının şifresi buradan sıfırlanamaz.',
  cannot_reset_self: 'Kendi şifrenizi buradan sıfırlayamazsınız.',
  forbidden: 'Bu işlem için admin olarak giriş yapmış olmalısınız.',
};

// Gives a member a new temporary password (they must choose their own at the next sign-in).
export default function ResetPasswordBox({ member }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [res, setRes] = useState(null);
  const [copied, setCopied] = useState('');
  if (!member || member.role === 'admin') return null;

  const run = async () => {
    if (!window.confirm(`${member.full_name || 'Bu üye'} için yeni geçici şifre üretilsin mi? Eski şifresi artık çalışmaz.`)) return;
    setBusy(true);
    setError('');
    const { data, error: err } = await supabase.functions.invoke('admin-reset-member-password', { body: { id: member.id } });
    setBusy(false);
    let code = data?.error;
    if (!code && err) { try { code = (await err.context.json())?.error; } catch {} }
    if (!data?.ok) return setError(ERRORS[code] || 'Şifre üretilemedi, lütfen tekrar deneyin.');
    const lang = member.preferred_language || 'tr';
    setRes({ ...data, text: messageFor(lang, member.full_name, data.email, data.password, 'reset') });
  };
  const copy = async (k, v) => { try { await navigator.clipboard.writeText(v); setCopied(k); setTimeout(() => setCopied(''), 1800); } catch {} };
  const digits = String(member.whatsapp_phone || member.phone || '').replace(/\D/g, '');
  const box = { background: '#0B0B11', border: '1px solid #1E1E2E' };

  return (
    <div className="rounded-lg p-4" style={box}>
      <p className="text-sm font-medium text-white mb-1">Yeni geçici şifre</p>
      <p className="text-xs text-[#9A9AAA] mb-3">Üye şifresini unuttuysa ya da ilk şifre ulaşmadıysa: yeni bir geçici şifre üretilir, üye girişte kendi şifresini belirler.</p>
      {error && <p className="text-sm mb-2" style={{ color: '#F87171' }}>{error}</p>}
      {!res ? (
        <button onClick={run} disabled={busy} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-60" style={{ border: '1px solid #1E1E2E' }}>
          <KeyRound className="w-4 h-4 text-[#C9A84C]" /> {busy ? 'Üretiliyor…' : 'Yeni geçici şifre üret'}
        </button>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <code className="text-lg font-semibold tracking-wide" style={{ color: '#C9A84C' }}>{res.password}</code>
            <button onClick={() => copy('pw', res.password)} className="text-[#9A9AAA] hover:text-white" aria-label="Şifreyi kopyala">{copied === 'pw' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}</button>
          </div>
          <p className="text-xs text-[#9A9AAA]">Bu şifre bir daha gösterilmez.</p>
          <pre className="whitespace-pre-wrap text-sm text-white rounded-lg p-3" style={{ background: '#151521', border: '1px solid #1E1E2E' }}>{res.text}</pre>
          <div className="flex flex-wrap gap-2">
            {digits.length >= 8 && (
              <a href={`https://wa.me/${digits}?text=${encodeURIComponent(res.text)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold" style={{ background: '#25D366', color: '#0B0B11' }}><MessageCircle className="w-4 h-4" /> WhatsApp ile gönder</a>
            )}
            <button onClick={() => copy('msg', res.text)} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ border: '1px solid #1E1E2E' }}>{copied === 'msg' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} Mesajı kopyala</button>
          </div>
        </div>
      )}
    </div>
  );
}
