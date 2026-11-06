'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const TEXT = {
  tr: { title: 'E-posta aboneliği', working: 'İşleniyor…', done: 'Aboneliğiniz iptal edildi. Artık bülten e-postası göndermeyeceğiz.', already: 'Bu bağlantıyla abonelik zaten kapalı ya da bağlantı geçersiz.', error: 'Bir sorun oluştu. Lütfen daha sonra tekrar deneyin.', back: 'Ana sayfaya dön' },
  es: { title: 'Suscripción por correo', working: 'Procesando…', done: 'Su suscripción se ha cancelado. No le enviaremos más boletines.', already: 'La suscripción ya estaba desactivada o el enlace no es válido.', error: 'Se ha producido un error. Inténtelo de nuevo más tarde.', back: 'Volver al inicio' },
  en: { title: 'Email subscription', working: 'Working…', done: 'You have been unsubscribed. We will not send you any more newsletters.', already: 'This subscription was already off, or the link is not valid.', error: 'Something went wrong. Please try again later.', back: 'Back to home' },
  de: { title: 'E-Mail-Abonnement', working: 'Wird verarbeitet…', done: 'Sie wurden abgemeldet. Wir senden Ihnen keine Newsletter mehr.', already: 'Das Abonnement war bereits beendet oder der Link ist ungültig.', error: 'Es ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.', back: 'Zur Startseite' },
};

export default function UnsubscribePage() {
  const [lang, setLang] = useState('en');
  const [state, setState] = useState('working');

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const l = q.get('l');
    const token = q.get('t');
    const lg = TEXT[l] ? l : 'en';
    setLang(lg);
    if (!token || !/^[0-9a-f-]{36}$/i.test(token)) {
      setState('already');
      return;
    }
    supabase.rpc('unsubscribe_marketing', { p_token: token }).then(({ data, error }) => {
      setState(error ? 'error' : data ? 'done' : 'already');
    });
  }, []);

  const t = TEXT[lang];
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#F7F7F5] px-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm p-8 text-center">
        <h1 className="text-2xl font-serif text-[#0B0B11] mb-4">{t.title}</h1>
        <p className="text-[#444] mb-6">{t[state]}</p>
        <a href={`/${lang}/`} className="inline-block px-5 py-2.5 rounded-xl bg-[#0B0B11] text-white text-sm font-medium">
          {t.back}
        </a>
      </div>
    </main>
  );
}
