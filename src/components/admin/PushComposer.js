'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Send, ImagePlus, X, Smartphone } from 'lucide-react';

const inputCls = 'w-full bg-[#0B0B11] border border-[#2A2A3A] rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-[#6A6A7A] focus:border-[#C9A84C] focus:outline-none';
const labelCls = 'text-xs text-[#9A9AAA] mb-1.5 block';
const LINKS = [
  ['/tr/', 'Ana sayfa'],
  ['/tr/mulkler/', 'İlanlar'],
  ['/tr/panel/', 'Üye paneli'],
  ['/tr/panel/?tab=meeting', 'Randevu al'],
  ['', 'Başka bir link'],
];
const ERR = {
  forbidden: 'Bu işlem için admin girişi gerekli.', missing_text: 'Başlık ve mesaj yazın.', bad_url: 'Link / ile başlamalı (örn. /tr/mulkler/) ya da https:// ile.',
  bad_image: 'Görsel linki https:// ile başlamalı.', too_long: 'Mesaj fazla uzun.', not_configured: 'Push ayarı eksik.',
};

async function shrink(file) {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, 1200 / Math.max(bmp.width, bmp.height));
  const c = document.createElement('canvas');
  c.width = Math.round(bmp.width * scale);
  c.height = Math.round(bmp.height * scale);
  c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
  return new Promise((res) => c.toBlob(res, 'image/jpeg', 0.85));
}

// The message form shared by the Push page and the member card.
// audience: { mode: 'all'|'users', ids, lang: 'tr'|'all', count (members who will get it), who (words for the confirm box), blocked (reason it cannot be sent) }
export default function PushComposer({ audience, onSent }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [preset, setPreset] = useState('/tr/');
  const [custom, setCustom] = useState('');
  const [image, setImage] = useState('');
  const [busy, setBusy] = useState('');
  const [up, setUp] = useState(false);
  const [msg, setMsg] = useState(null);
  const url = preset === '' ? custom.trim() : preset;

  const upload = async (file) => {
    if (!file) return;
    setUp(true); setMsg(null);
    try {
      const blob = await shrink(file);
      const path = `push/${crypto.randomUUID()}.jpg`;
      const { error } = await supabase.storage.from('properties').upload(path, blob, { contentType: 'image/jpeg', cacheControl: '31536000' });
      if (error) throw error;
      setImage(supabase.storage.from('properties').getPublicUrl(path).data.publicUrl);
    } catch (e) { setMsg({ ok: false, text: e.message || 'Görsel yüklenemedi.' }); }
    setUp(false);
  };

  const send = async (preview) => {
    setMsg(null);
    if (!title.trim() || !body.trim()) { setMsg({ ok: false, text: 'Başlık ve mesaj yazın.' }); return; }
    if (!preview) {
      if (audience.blocked) { setMsg({ ok: false, text: audience.blocked }); return; }
      if (!window.confirm(`Bu mesaj ${audience.who} gönderilecek ve geri alınamaz. Gönderilsin mi?`)) return;
    }
    setBusy(preview ? 'preview' : 'send');
    try {
      const { data: sess } = await supabase.auth.getSession();
      const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/push-broadcast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${sess.session.access_token}`, apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY },
        body: JSON.stringify({ title, body, url: url || '/', image, preview, audience: { mode: audience.mode, ids: audience.ids || [], lang: audience.lang } }),
      });
      const j = await res.json();
      if (!res.ok || !j.ok) setMsg({ ok: false, text: ERR[j.error] || 'Gönderilemedi. Lütfen tekrar deneyin.' });
      else if (preview) setMsg(j.sent > 0 ? { ok: true, text: 'Deneme bildirimi telefonunuza gönderildi.' } : { ok: false, text: 'Sizin cihazınızda açık bildirim bulunamadı. Admin uygulamasında ya da üye panelinde bildirimi açın.' });
      else {
        const extra = [j.skippedOff ? `${j.skippedOff} cihaz duyuruları kapatmış` : '', j.skippedLang ? `${j.skippedLang} cihaz Türkçe dışı` : '', j.failed ? `${j.failed} gönderilemedi` : ''].filter(Boolean).join(', ');
        setMsg({ ok: j.sent > 0, text: j.sent > 0 ? `${j.sent} cihaza gönderildi${extra ? ` (${extra})` : ''}.` : `Gönderilemedi${extra ? `: ${extra}` : '.'}` });
        if (j.sent > 0) { onSent?.(j, { title, body }); setTitle(''); setBody(''); setImage(''); }
      }
    } catch { setMsg({ ok: false, text: 'Gönderilemedi. Lütfen tekrar deneyin.' }); }
    setBusy('');
  };

  return (
    <div className="space-y-5">
      <div>
        <label className={labelCls}>Başlık</label>
        <input value={title} maxLength={65} onChange={(e) => setTitle(e.target.value)} placeholder="Örn. Valencia'da yeni fırsat" className={inputCls} />
        <p className="text-[11px] text-[#6A6A7A] mt-1">{title.length}/65</p>
      </div>
      <div>
        <label className={labelCls}>Mesaj</label>
        <textarea value={body} maxLength={240} rows={3} onChange={(e) => setBody(e.target.value)} placeholder="Kısa ve net yazın. İlk satırlar bildirimde görünür." className={inputCls} />
        <p className="text-[11px] text-[#6A6A7A] mt-1">{body.length}/240</p>
      </div>
      <div>
        <span className={labelCls}>Dokununca açılacak sayfa</span>
        <div className="flex flex-wrap gap-2">
          {LINKS.map(([v, l]) => (
            <button key={l} type="button" onClick={() => setPreset(v)} className="px-3 py-1.5 rounded-lg text-xs font-medium" style={preset === v ? { background: 'rgba(201,168,76,0.15)', color: '#C9A84C' } : { border: '1px solid #1E1E2E', color: '#9A9AAA' }}>{l}</button>
          ))}
        </div>
        {preset === '' && <input value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="https://youtu.be/... ya da /tr/blog/" className={`${inputCls} mt-3`} />}
        <p className="text-[11px] text-[#6A6A7A] mt-2">Video göndermek için YouTube ya da Instagram linkini buraya yapıştırın; kapak resmini aşağıya ekleyin.</p>
      </div>
      <div>
        <span className={labelCls}>Görsel (isteğe bağlı)</span>
        {image ? (
          <div className="flex items-center gap-3">
            <img src={image} alt="" className="h-16 w-28 object-cover rounded-lg" />
            <button type="button" onClick={() => setImage('')} className="inline-flex items-center gap-1.5 text-xs text-[#9A9AAA] hover:text-white"><X className="w-3.5 h-3.5" />Kaldır</button>
          </div>
        ) : (
          <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm text-white cursor-pointer hover:bg-white/5" style={{ border: '1px dashed #2A2A3A' }}>
            <ImagePlus className="w-4 h-4 text-[#C9A84C]" />{up ? 'Yükleniyor…' : 'Görsel yükle'}
            <input type="file" accept="image/*" className="sr-only" onChange={(e) => upload(e.target.files?.[0])} />
          </label>
        )}
        <p className="text-[11px] text-[#6A6A7A] mt-2">Yatay (2:1) görsel en iyisi. Android'de bildirimin altında büyük görünür; iPhone görseli göstermez.</p>
      </div>

      <div className="rounded-2xl p-3.5" style={{ background: '#0B0B11', border: '1px solid #2A2A3A' }} aria-label="Önizleme">
        <div className="flex items-start gap-3">
          <img src="/brand/app-192.png" alt="" width={36} height={36} className="rounded-lg shrink-0" />
          <div className="min-w-0">
            <p className="text-[11px] text-[#6A6A7A]">Lock & Loft · şimdi</p>
            <p className="text-sm font-semibold text-white break-words">{title || 'Başlık'}</p>
            <p className="text-sm text-[#C9C9D4] break-words">{body || 'Mesajınız burada görünür.'}</p>
          </div>
        </div>
        {image && <img src={image} alt="" className="mt-3 w-full rounded-lg object-cover aspect-[2/1]" />}
      </div>

      {audience.blocked && <p className="text-sm text-[#F87171]">{audience.blocked}</p>}
      {msg && <p className={`text-sm ${msg.ok ? 'text-green-400' : 'text-red-400'}`} role="status">{msg.text}</p>}
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={() => send(true)} disabled={!!busy} className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm text-white hover:bg-white/5 disabled:opacity-60" style={{ border: '1px solid #2A2A3A' }}>
          <Smartphone className="w-4 h-4" />{busy === 'preview' ? 'Gönderiliyor…' : 'Önce bana gönder'}
        </button>
        <button type="button" onClick={() => send(false)} disabled={!!busy || !!audience.blocked} className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold disabled:opacity-60" style={{ background: '#C9A84C', color: '#0B0B11' }}>
          <Send className="w-4 h-4" />{busy === 'send' ? 'Gönderiliyor…' : audience.button || 'Gönder'}
        </button>
      </div>
    </div>
  );
}
