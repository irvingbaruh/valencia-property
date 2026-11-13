'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { Video, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/providers/AuthProvider';
import { bookingText, fmtFull } from '@/lib/bookingText';
import { trackFunnel } from '@/lib/funnel';

// Slim card at the top of the member panel: the upcoming call, or an invitation to book one.
export default function MeetingCard({ onOpen }) {
  const locale = useLocale();
  const { user } = useAuth();
  const tx = bookingText(locale);
  const [st, setSt] = useState(null); // null = loading

  useEffect(() => {
    if (!user) return;
    let alive = true;
    Promise.all([
      supabase.from('appointments').select('starts_at,channel').eq('user_id', user.id).eq('status', 'booked').gt('starts_at', new Date(Date.now() - 3600e3).toISOString()).order('starts_at').limit(1),
      supabase.from('site_settings').select('value').eq('key', 'booking').maybeSingle(),
    ]).then(([a, s]) => alive && setSt({ mine: a.data?.[0] || null, enabled: !!s.data?.value?.enabled }));
    return () => { alive = false; };
  }, [user]);

  if (!st || (!st.mine && !st.enabled)) return null;
  return (
    <button onClick={() => { trackFunnel('booking_open', 'panel'); onOpen(); }} data-track="booking_card_panel"
      className="mb-6 w-full text-left dark-card rounded-2xl shadow-sm p-5 flex items-center gap-4 border border-[var(--color-gold)]/40 hover:border-[var(--color-gold)] transition-colors">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold-light text-gold"><Video size={20} /></span>
      <span className="flex-1 min-w-0">
        <span className="block font-serif text-lg text-[var(--color-dark)]">{st.mine ? tx.booked : tx.title}</span>
        <span className="block text-sm text-[var(--color-charcoal)] mt-0.5">{st.mine ? `${fmtFull(st.mine.starts_at, locale)} · ${tx[st.mine.channel] || tx.meet}` : tx.sub}</span>
      </span>
      <span className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-[var(--color-gold)] whitespace-nowrap">{st.mine ? '' : tx.cta}<ArrowRight size={15} /></span>
    </button>
  );
}
