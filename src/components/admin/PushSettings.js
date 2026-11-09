'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/providers/AuthProvider';

const VAPID_PUBLIC = 'BIptClcjt6sreGecTMgpNdjq94guhUOk6xMk3LkPKunCpJl0JwiV1MnBozM2qEde1tKWcKgV7o5NEnYvSQbSWQo';
const card = { background: '#151521', border: '1px solid #1E1E2E' };
const EVENTS = [
  ['contact_message', 'İletişim mesajı geldi'],
  ['intake', 'Yeni danışmanlık talebi'],
  ['member', 'Yeni üye kaydı'],
  ['document_upload', 'Üye belge yükledi'],
  ['doc_delete_request', 'Belge silme isteği'],
  ['chat_started', 'Biri sohbeti kullandı'],
  ['chat_lead', 'Sohbette iletişim bilgisi bırakıldı'],
  ['digest', 'Günlük özet (her akşam)'],
  ['visit', 'Sitede yeni ziyaretçi (çok sık gelebilir)'],
];
const DEFAULTS = Object.fromEntries(EVENTS.map(([k]) => [k, k !== 'visit']));

const b64ToBytes = (s) => {
  const pad = '='.repeat((4 - (s.length % 4)) % 4);
  const raw = atob((s + pad).replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
};
const deviceLabel = () => {
  const ua = navigator.userAgent;
  const os = /iPhone/.test(ua) ? 'iPhone' : /iPad/.test(ua) ? 'iPad' : /Android/.test(ua) ? 'Android' : /Mac/.test(ua) ? 'Mac' : /Windows/.test(ua) ? 'Windows' : 'Cihaz';
  return `${os} · ${/Edg/.test(ua) ? 'Edge' : /Chrome/.test(ua) ? 'Chrome' : /Safari/.test(ua) ? 'Safari' : 'Tarayıcı'}`;
};
const fmt = (d) => (d ? new Date(d).toLocaleString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—');

export default function PushSettings() {
  const { user } = useAuth();
  const [support, setSupport] = useState('checking'); // checking | ok | install | unsupported
  const [perm, setPerm] = useState('default');
  const [subs, setSubs] = useState([]);
  const [here, setHere] = useState(null); // endpoint of this device's subscription
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const flash = (text, ok = true) => setMsg({ text, ok });

  const load = useCallback(async () => {
    const { data } = await supabase.from('push_subscriptions').select('*').order('created_at');
    setSubs(data || []);
    try {
      const reg = await navigator.serviceWorker.getRegistration('/lockandloft/admin/');
      const s = reg && (await reg.pushManager.getSubscription());
      setHere(s ? s.endpoint : null);
    } catch {
      setHere(null);
    }
  }, []);

  useEffect(() => {
    const ua = navigator.userAgent;
    const ios = /iPhone|iPad|iPod/.test(ua);
    const standalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone;
    const capable = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
    if (ios && !standalone) setSupport('install');
    else if (!capable) setSupport('unsupported');
    else {
      setSupport('ok');
      setPerm(Notification.permission);
      load();
    }
  }, [load]);

  const enable = async () => {
    setBusy(true);
    setMsg(null);
    try {
      const p = await Notification.requestPermission();
      setPerm(p);
      if (p !== 'granted') {
        flash('Bildirim izni verilmedi. Telefon ayarlarından bu uygulama için bildirimlere izin verin.', false);
        return;
      }
      let reg = await navigator.serviceWorker.getRegistration('/lockandloft/admin/');
      if (!reg) reg = await navigator.serviceWorker.register('/lockandloft/admin/sw.js', { scope: '/lockandloft/admin/' });
      await navigator.serviceWorker.ready;
      let sub = await reg.pushManager.getSubscription();
      if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64ToBytes(VAPID_PUBLIC) });
      const j = sub.toJSON();
      const { error } = await supabase.from('push_subscriptions').upsert(
        { user_id: user.id, endpoint: j.endpoint, p256dh: j.keys.p256dh, auth: j.keys.auth, device_label: deviceLabel(), events: DEFAULTS },
        { onConflict: 'endpoint', ignoreDuplicates: false }
      );
      if (error) throw error;
      flash('Bildirimler bu cihazda açıldı.');
      await load();
    } catch (e) {
      flash('Bildirimler açılamadı. Uygulamayı ana ekrandan açtığınızdan emin olun ve tekrar deneyin.', false);
    } finally {
      setBusy(false);
    }
  };

  const remove = async (s) => {
    setBusy(true);
    try {
      if (s.endpoint === here) {
        const reg = await navigator.serviceWorker.getRegistration('/lockandloft/admin/');
        const sub = reg && (await reg.pushManager.getSubscription());
        if (sub) await sub.unsubscribe();
      }
      await supabase.from('push_subscriptions').delete().eq('id', s.id);
      await load();
    } finally {
      setBusy(false);
    }
  };

  const toggle = async (s, key) => {
    const events = { ...DEFAULTS, ...(s.events || {}), [key]: !(s.events || DEFAULTS)[key] };
    setSubs((l) => l.map((x) => (x.id === s.id ? { ...x, events } : x)));
    await supabase.from('push_subscriptions').update({ events }).eq('id', s.id);
  };

  const test = async () => {
    setBusy(true);
    setMsg(null);
    try {
      const { data: sess } = await supabase.auth.getSession();
      const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/push-admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${sess.session.access_token}`, apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY },
        body: JSON.stringify({ kind: 'test' }),
      });
      const j = await res.json();
      if (j.ok && j.sent > 0) flash('Deneme bildirimi gönderildi. Birkaç saniye içinde gelmeli.');
      else if (j.ok) flash('Kayıtlı cihaz bulunamadı. Önce bildirimleri açın.', false);
      else flash('Deneme bildirimi gönderilemedi.', false);
    } catch {
      flash('Deneme bildirimi gönderilemedi.', false);
    } finally {
      setBusy(false);
    }
  };

  const thisSub = subs.find((s) => s.endpoint === here);

  return (
    <div className="space-y-5">
      <section className="rounded-xl p-5 space-y-3" style={card}>
        <h2 className="text-base font-semibold text-white">Telefona uygulama olarak ekle</h2>
        <ol className="list-decimal pl-5 space-y-1.5 text-sm text-[#C8C8D4]">
          <li>iPhone'da bu paneli <b className="text-white">Safari</b> ile açın: lockandloft.com/lockandloft/admin/</li>
          <li>Alttaki <b className="text-white">Paylaş</b> düğmesine, sonra <b className="text-white">Ana Ekrana Ekle</b>'ye dokunun.</li>
          <li>Ana ekrandaki <b className="text-white">L&L Yönetim</b> simgesinden açın ve bir kez giriş yapın. Çıkış yapmadığınız sürece oturum açık kalır.</li>
          <li>Uygulamayı ana ekrandan açıp aşağıdan bildirimleri açın. iPhone'da bildirimler için iOS 16.4 veya üstü gerekir.</li>
        </ol>
      </section>

      <section className="rounded-xl p-5 space-y-4" style={card}>
        <h2 className="text-base font-semibold text-white">Telefon bildirimleri</h2>

        {support === 'checking' && <p className="text-sm text-[#9A9AAA]">Kontrol ediliyor…</p>}
        {support === 'install' && (
          <p className="text-sm text-[#C8C8D4]">Bildirimleri açmak için önce paneli yukarıdaki adımlarla ana ekrana ekleyin ve oradan açın. Safari sekmesinde iPhone bildirim göndermez.</p>
        )}
        {support === 'unsupported' && <p className="text-sm text-[#C8C8D4]">Bu tarayıcı telefon bildirimlerini desteklemiyor.</p>}

        {support === 'ok' && (
          <>
            {!thisSub ? (
              <div>
                <p className="text-sm text-[#C8C8D4] mb-3">Bu cihaza yeni üye, sohbet, form ve belge bildirimleri gönderilir.</p>
                <button onClick={enable} disabled={busy || perm === 'denied'} className="px-5 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50" style={{ background: '#C9A84C', color: '#0B0B11' }}>
                  {busy ? 'Açılıyor…' : 'Bildirimleri bu cihazda aç'}
                </button>
                {perm === 'denied' && <p className="text-xs text-red-400 mt-2">Bildirimler engellenmiş. Telefon ayarlarından bu uygulamaya izin verin.</p>}
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-green-400">Bu cihazda bildirimler açık ({thisSub.device_label}).</p>
                <ul className="space-y-1">
                  {EVENTS.map(([k, label]) => {
                    const on = (thisSub.events || DEFAULTS)[k];
                    return (
                      <li key={k}>
                        <label className="flex items-center justify-between gap-3 py-2 text-sm text-white cursor-pointer">
                          <span>{label}</span>
                          <input type="checkbox" checked={!!on} onChange={() => toggle(thisSub, k)} className="accent-[#C9A84C] w-5 h-5" />
                        </label>
                      </li>
                    );
                  })}
                </ul>
                <div className="flex flex-wrap gap-2">
                  <button onClick={test} disabled={busy} className="px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50" style={{ background: '#C9A84C', color: '#0B0B11' }}>
                    Deneme bildirimi gönder
                  </button>
                  <button onClick={() => remove(thisSub)} disabled={busy} className="px-4 py-2 rounded-lg text-sm text-[#C8C8D4] border border-[#2A2A3C] hover:text-white">
                    Bu cihazda kapat
                  </button>
                </div>
              </div>
            )}
          </>
        )}
        {msg && <p className={`text-sm ${msg.ok ? 'text-green-400' : 'text-red-400'}`} role="status">{msg.text}</p>}
      </section>

      {subs.length > 0 && (
        <section className="rounded-xl p-5" style={card}>
          <h2 className="text-base font-semibold text-white mb-3">Kayıtlı cihazlarım</h2>
          <ul className="divide-y divide-[#1E1E2E]">
            {subs.map((s) => (
              <li key={s.id} className="py-2.5 flex items-center justify-between gap-3 text-sm">
                <span className="text-white">
                  {s.device_label || 'Cihaz'}
                  {s.endpoint === here && <span className="ml-2 text-[11px] text-[#C9A84C]">bu cihaz</span>}
                  <span className="block text-[11px] text-[#6A6A7A]">Son bildirim: {fmt(s.last_ok_at)}</span>
                </span>
                <button onClick={() => remove(s)} disabled={busy} className="text-xs text-red-400 hover:text-red-300">Kaldır</button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
