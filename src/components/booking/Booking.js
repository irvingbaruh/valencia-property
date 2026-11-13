'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocale } from 'next-intl';
import { Video, CalendarClock, Check, ArrowRight, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/providers/AuthProvider';
import { localePath } from '@/lib/routes';
import { trackFunnel } from '@/lib/funnel';
import { bookingText, buildDays, fmtDay, fmtTime, fmtFull, localTime } from '@/lib/bookingText';

const errKey = (m = '') => (/taken/.test(m) ? 'taken' : /already/.test(m) ? 'already' : /slot|closed/.test(m) ? 'slot' : 'other');

// The member's upcoming call, if any, and the day/time picker to book one.
export default function Booking({ onDone }) {
  const locale = useLocale();
  const { user } = useAuth();
  const tx = bookingText(locale);
  const [state, setState] = useState({ loading: true, settings: null, taken: [], mine: null });
  const [dayKey, setDayKey] = useState(null);
  const [slot, setSlot] = useState(null);
  const [channel, setChannel] = useState('meet');
  const [topic, setTopic] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    const [{ data: s }, { data: mine }] = await Promise.all([
      supabase.rpc('booking_slots'),
      user ? supabase.from('appointments').select('*').eq('user_id', user.id).eq('status', 'booked').gt('starts_at', new Date(Date.now() - 3600e3).toISOString()).order('starts_at').limit(1) : Promise.resolve({ data: [] }),
    ]);
    setState({ loading: false, settings: s?.settings || { enabled: false }, taken: s?.taken || [], mine: (mine && mine[0]) || null });
  }, [user]);
  useEffect(() => { load(); }, [load]);

  const days = useMemo(() => buildDays(state.settings, state.taken), [state.settings, state.taken]);
  const day = days.find((d) => d.key === dayKey) || days[0];

  const book = async () => {
    if (!slot || busy) return;
    setBusy(true);
    setError('');
    const { error: e } = await supabase.rpc('book_appointment', { p_starts_at: slot.toISOString(), p_channel: channel, p_topic: topic || null, p_note: note || null, p_lang: locale });
    setBusy(false);
    if (e) {
      setError(tx.err[errKey(e.message)]);
      setSlot(null);
      load();
      return;
    }
    trackFunnel('booking_done', channel);
    setSlot(null);
    await load();
    onDone && onDone();
  };
  const cancel = async () => {
    if (!state.mine || !window.confirm(tx.cancelAsk)) return;
    setBusy(true);
    await supabase.rpc('cancel_my_appointment', { p_id: state.mine.id });
    setBusy(false);
    load();
  };

  if (state.loading) return <div className="dark-card rounded-2xl shadow-sm p-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-[var(--color-gold)]" /></div>;

  if (state.mine) {
    const a = state.mine;
    const mineLocal = localTime(new Date(a.starts_at));
    return (
      <div className="dark-card rounded-2xl shadow-sm p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gold-light text-gold"><Check size={20} /></span>
          <h3 className="text-lg font-serif text-[var(--color-dark)]">{tx.booked}</h3>
        </div>
        <p className="text-xl font-semibold text-[var(--color-dark)]">{fmtFull(a.starts_at, locale)}</p>
        <p className="text-sm text-[var(--color-charcoal)] mt-1">{tx.tz}{mineLocal ? ` ${tx.yours(mineLocal)}.` : ''} · {tx[a.channel] || tx.meet}</p>
        <p className="text-sm text-[var(--color-charcoal)] mt-3">{a.channel === 'whatsapp' ? tx.waNote : a.channel === 'phone' ? tx.phoneNote : a.meeting_url ? tx.bookedText : tx.linkSoon}</p>
        <div className="mt-5 flex flex-wrap gap-3">
          {a.meeting_url && /^https:\/\//.test(a.meeting_url) && (
            <a href={a.meeting_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-gold)] text-[var(--color-dark)] font-semibold px-5 py-3 text-sm hover:opacity-90"><Video size={16} />{tx.join}</a>
          )}
          <button onClick={cancel} disabled={busy} className="rounded-xl border border-gray-200 px-5 py-3 text-sm text-[var(--color-charcoal)] hover:border-red-200 hover:text-red-600 disabled:opacity-50">{tx.cancel}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="dark-card rounded-2xl shadow-sm p-6 sm:p-8">
      <div className="flex items-center gap-3 mb-2">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gold-light text-gold"><Video size={20} /></span>
        <h3 className="text-lg font-serif text-[var(--color-dark)]">{tx.title}</h3>
      </div>
      <p className="text-sm text-[var(--color-charcoal)] mb-5">{tx.sub}</p>

      {!days.length ? <p className="text-sm text-[var(--color-charcoal)]">{tx.closed}</p> : (
        <>
          <p className="text-sm font-medium text-[var(--color-dark)] mb-2">{tx.pickDay}</p>
          <div className="flex gap-2 overflow-x-auto pb-2 [scrollbar-width:thin]">
            {days.map((d) => (
              <button key={d.key} onClick={() => { setDayKey(d.key); setSlot(null); }} aria-pressed={d.key === day.key}
                className={`shrink-0 rounded-xl border px-3.5 py-2.5 text-sm capitalize transition-colors ${d.key === day.key ? 'bg-[var(--color-gold)] border-[var(--color-gold)] text-[var(--color-dark)] font-semibold' : 'border-gray-200 text-[var(--color-dark)] hover:border-[var(--color-gold)]'}`}>
                {fmtDay(d.date, locale)}
              </button>
            ))}
          </div>

          <p className="text-sm font-medium text-[var(--color-dark)] mt-5 mb-2">{tx.pickTime}</p>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
            {day.slots.map((s) => {
              const on = slot && slot.getTime() === s.getTime();
              return (
                <button key={s.getTime()} onClick={() => setSlot(s)} aria-pressed={!!on}
                  className={`rounded-lg border py-2.5 text-sm tabular-nums transition-colors ${on ? 'bg-[var(--color-dark)] border-[var(--color-dark)] text-white font-semibold' : 'border-gray-200 text-[var(--color-dark)] hover:border-[var(--color-gold)]'}`}>
                  {fmtTime(s)}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-[var(--color-charcoal)] mt-2">{tx.tz}{slot && localTime(slot) ? ` ${tx.yours(localTime(slot))}.` : ''}</p>

          {slot && (
            <div className="mt-6 border-t border-gray-100 pt-5 space-y-4">
              <div>
                <p className="text-sm font-medium text-[var(--color-dark)] mb-2">{tx.channel}</p>
                <div className="flex flex-wrap gap-2">
                  {['meet', 'whatsapp'].map((c) => (
                    <button key={c} onClick={() => setChannel(c)} aria-pressed={channel === c}
                      className={`rounded-full border px-4 py-2 text-sm ${channel === c ? 'bg-[var(--color-dark)] border-[var(--color-dark)] text-white' : 'border-gray-200 text-[var(--color-dark)] hover:border-[var(--color-gold)]'}`}>{tx[c]}</button>
                  ))}
                </div>
              </div>
              <label className="block">
                <span className="text-sm font-medium text-[var(--color-dark)]">{tx.topic}</span>
                <select value={topic} onChange={(e) => setTopic(e.target.value)} className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-[var(--color-dark)]">
                  <option value="">—</option>
                  {tx.topics.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-medium text-[var(--color-dark)]">{tx.note}</span>
                <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} maxLength={1000} className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-[var(--color-dark)]" />
              </label>
              <button onClick={book} disabled={busy} className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-gold)] text-[var(--color-dark)] font-semibold px-6 py-3 text-sm hover:opacity-90 disabled:opacity-60">
                {busy ? <><Loader2 className="w-4 h-4 animate-spin" />{tx.booking}</> : <>{tx.confirm} · {fmtDay(slot, locale)} {fmtTime(slot)}</>}
              </button>
            </div>
          )}
        </>
      )}
      {error && <p role="alert" className="mt-4 text-sm text-red-600">{error}</p>}
    </div>
  );
}

// Call-to-action used on public pages: members go straight to the picker, guests to free sign-up first.
export function BookingCta({ ctx = 'page', className = '' }) {
  const locale = useLocale();
  const { user } = useAuth();
  const tx = bookingText(locale);
  const href = user ? `${localePath(locale, 'panel')}?tab=meeting` : `${localePath(locale, 'giris')}?mode=register&from=booking`;
  return (
    <div className={`rounded-2xl border border-gold/40 bg-white p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center gap-4 ${className}`}>
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gold-light text-gold"><CalendarClock size={22} /></span>
      <div className="flex-1">
        <h3 className="font-serif text-xl text-dark">{tx.title}</h3>
        <p className="text-sm text-text-muted mt-1">{tx.sub}</p>
      </div>
      <a href={href} onClick={() => trackFunnel(user ? 'booking_open' : 'invite_click', `booking_${ctx}`)} data-track={`booking_cta_${ctx}`}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-gold text-dark font-semibold px-5 py-3 text-sm hover:bg-gold-hover transition-colors whitespace-nowrap">
        {user ? tx.cta : tx.guestCta}<ArrowRight size={15} />
      </a>
    </div>
  );
}
