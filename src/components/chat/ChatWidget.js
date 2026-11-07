'use client';

import { useState, useEffect, useRef } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { MessageCircle, X, Send, Loader2, CheckCircle2 } from 'lucide-react';

const ENDPOINT = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/chat`;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const STORE = 'll_chat_v1';
const CONTACT_SLUG = { tr: 'iletisim', es: 'contacto', en: 'contact', de: 'kontakt' };

async function call(payload) {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: KEY },
    body: JSON.stringify(payload),
  });
  let data = {};
  try { data = await res.json(); } catch (_) { /* ignore */ }
  return { ok: res.ok, status: res.status, data };
}

// Turns same-site URLs in a reply into links; everything else stays plain text.
function Rich({ text }) {
  const parts = text.split(/(https:\/\/lockandloft\.com[^\s)]*)/g);
  return parts.map((p, i) => {
    if (!p.startsWith('https://lockandloft.com')) return <span key={i}>{p}</span>;
    const m = p.match(/^(.*?)([.,;:!?]*)$/);
    return (
      <span key={i}>
        <a href={m[1]} className="underline underline-offset-2 text-[#9A7B2C] break-all">{m[1].replace('https://lockandloft.com', '')}</a>
        {m[2]}
      </span>
    );
  });
}

export default function ChatWidget() {
  const t = useTranslations('chat');
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([]);
  const [sid, setSid] = useState(null);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', note: '' });
  const [formErr, setFormErr] = useState('');
  const [formBusy, setFormBusy] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    try {
      const s = JSON.parse(sessionStorage.getItem(STORE) || 'null');
      if (s) { setMsgs(s.msgs || []); setSid(s.sid || null); setSent(!!s.sent); setShowForm(!!s.showForm && !s.sent); }
    } catch (_) { /* ignore */ }
  }, []);
  useEffect(() => {
    try { sessionStorage.setItem(STORE, JSON.stringify({ msgs, sid, sent, showForm })); } catch (_) { /* ignore */ }
  }, [msgs, sid, sent, showForm]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, [msgs, busy, showForm, open]);

  const fail = (key) => setMsgs((m) => [...m, { role: 'assistant', content: t(key), error: true }]);

  const send = async (text) => {
    const message = (text ?? input).trim();
    if (!message || busy) return;
    setInput('');
    setMsgs((m) => [...m, { role: 'user', content: message }]);
    setBusy(true);
    try {
      const { ok, status, data } = await call({ session_id: sid, message, lang: locale });
      if (data.session_id) setSid(data.session_id);
      if (ok && data.reply) {
        setMsgs((m) => [...m, { role: 'assistant', content: data.reply }]);
        if (data.show_contact && !sent) setShowForm(true);
      } else if (status === 429) fail('limit');
      else fail('unavailable');
    } catch (_) { fail('unavailable'); }
    setBusy(false);
  };

  const submitLead = async (e) => {
    e.preventDefault();
    setFormErr('');
    if (!form.name.trim() || (!form.email.trim() && !form.phone.trim())) { setFormErr(t('formMissing')); return; }
    setFormBusy(true);
    try {
      let id = sid;
      if (!id) {
        // contact requested before any message: open a session with a short opening line
        const r = await call({ message: t('openingLine'), lang: locale });
        id = r.data.session_id || null;
        if (id) setSid(id);
      }
      const { ok, data } = await call({ action: 'lead', session_id: id, lang: locale, ...form });
      if (ok) { setSent(true); setShowForm(false); }
      else setFormErr(data.error === 'email' ? t('formEmail') : t('formError'));
    } catch (_) { setFormErr(t('formError')); }
    setFormBusy(false);
  };

  const suggestions = [t('s1'), t('s2'), t('s3')];
  const contactUrl = `/${locale}/${CONTACT_SLUG[locale]}/`;

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label={t('open')}
          className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full pl-4 pr-5 py-3 text-sm font-medium shadow-xl transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C9A84C]"
          style={{ background: '#0B0B11', color: '#fff', border: '1px solid #C9A84C' }}
        >
          <MessageCircle size={18} color="#C9A84C" />
          {t('launcher')}
        </button>
      )}

      {open && (
        <div
          role="dialog"
          aria-label={t('title')}
          className="fixed z-50 bottom-0 right-0 sm:bottom-5 sm:right-5 w-full sm:w-[380px] h-[100dvh] sm:h-[600px] sm:max-h-[calc(100dvh-40px)] flex flex-col bg-white sm:rounded-2xl shadow-2xl overflow-hidden border border-[#E5E5EA]"
        >
          <div className="flex items-center justify-between px-4 py-3" style={{ background: '#0B0B11' }}>
            <div>
              <div className="text-white text-sm font-semibold">{t('title')}</div>
              <div className="text-[11px]" style={{ color: '#C9A84C' }}>{t('subtitle')}</div>
            </div>
            <button onClick={() => setOpen(false)} aria-label={t('close')} className="text-white/80 hover:text-white p-1">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-[#F6F6F8]" aria-live="polite">
            <Bubble role="assistant">{t('greeting')}</Bubble>
            {msgs.length === 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {suggestions.map((s) => (
                  <button key={s} onClick={() => send(s)} className="text-xs rounded-full border border-[#C9A84C] text-[#6B5A22] bg-white px-3 py-1.5 hover:bg-[#FBF6E6]">
                    {s}
                  </button>
                ))}
              </div>
            )}
            {msgs.map((m, i) => (
              <Bubble key={i} role={m.role}>
                {m.role === 'assistant' ? <Rich text={m.content} /> : m.content}
                {m.error && <> <a href={contactUrl} className="underline text-[#9A7B2C]">{t('contactLink')}</a></>}
              </Bubble>
            ))}
            {busy && (
              <Bubble role="assistant"><span className="inline-flex items-center gap-2 text-[#6A6A7A]"><Loader2 size={14} className="animate-spin" />{t('typing')}</span></Bubble>
            )}

            {showForm && !sent && (
              <form onSubmit={submitLead} className="rounded-xl bg-white border border-[#E5E5EA] p-3 space-y-2">
                <div className="text-sm font-medium text-[#1A1A2E]">{t('formTitle')}</div>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={t('name')} autoComplete="name" className="w-full border border-[#D9D9E0] rounded-lg px-3 py-2 text-sm" />
                <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder={t('email')} type="email" autoComplete="email" className="w-full border border-[#D9D9E0] rounded-lg px-3 py-2 text-sm" />
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder={t('phone')} type="tel" autoComplete="tel" className="w-full border border-[#D9D9E0] rounded-lg px-3 py-2 text-sm" />
                <textarea value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder={t('note')} rows={2} className="w-full border border-[#D9D9E0] rounded-lg px-3 py-2 text-sm" />
                {formErr && <div className="text-xs text-red-600">{formErr}</div>}
                <button disabled={formBusy} className="w-full rounded-lg py-2 text-sm font-medium text-white disabled:opacity-60" style={{ background: '#0B0B11' }}>
                  {formBusy ? '…' : t('formSend')}
                </button>
                <p className="text-[11px] text-[#6A6A7A]">{t('formPrivacy')}</p>
              </form>
            )}
            {sent && (
              <div className="rounded-xl bg-white border border-[#C9A84C] p-3 text-sm text-[#1A1A2E] flex gap-2">
                <CheckCircle2 size={18} color="#2E7D32" className="shrink-0 mt-0.5" />
                <span>{t('formDone')}</span>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className="border-t border-[#E5E5EA] bg-white p-3">
            {!showForm && !sent && msgs.length > 0 && (
              <button onClick={() => setShowForm(true)} className="text-xs text-[#9A7B2C] underline mb-2">{t('talkToHuman')}</button>
            )}
            <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                maxLength={1000}
                placeholder={t('placeholder')}
                aria-label={t('placeholder')}
                className="flex-1 border border-[#D9D9E0] rounded-full px-4 py-2 text-sm focus:outline-none focus:border-[#C9A84C]"
              />
              <button disabled={busy || !input.trim()} aria-label={t('send')} className="rounded-full w-10 h-10 flex items-center justify-center text-white disabled:opacity-40" style={{ background: '#0B0B11' }}>
                <Send size={16} />
              </button>
            </form>
            <p className="text-[10px] leading-snug text-[#8A8A98] mt-2">{t('disclaimer')}</p>
          </div>
        </div>
      )}
    </>
  );
}

function Bubble({ role, children }) {
  const mine = role === 'user';
  return (
    <div className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words ${mine ? 'text-white rounded-br-sm' : 'bg-white text-[#1A1A2E] rounded-bl-sm border border-[#E5E5EA]'}`}
        style={mine ? { background: '#0B0B11' } : undefined}
      >
        {children}
      </div>
    </div>
  );
}
