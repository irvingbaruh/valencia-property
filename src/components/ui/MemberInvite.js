'use client';

import { useEffect } from 'react';
import { useLocale } from 'next-intl';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { localePath } from '@/lib/routes';
import { gt } from '@/lib/growthText';
import { trackFunnel } from '@/lib/funnel';

// A quiet invitation to join, shown to visitors who are not signed in, right where a member benefit would help them.
// context = where it sits (for the funnel report); kind = which copy to use (listing | cost | roi).
export default function MemberInvite({ context, kind = 'listing', className = '' }) {
  const locale = useLocale();
  const { user, loading } = useAuth();
  const show = !loading && !user;
  useEffect(() => {
    if (show) trackFunnel('invite_view', context);
  }, [show, context]);
  if (!show) return null;
  const g = gt(locale).invite;
  const c = g[kind] || g.listing;
  return (
    <div className={`rounded-2xl border border-gold/40 bg-white p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4 ${className}`}>
      <Sparkles className="text-gold shrink-0" size={24} />
      <div className="flex-1">
        <p className="font-serif text-lg text-dark mb-0.5">{c.title}</p>
        <p className="text-sm text-text-muted">{c.text}</p>
      </div>
      <a
        href={`${localePath(locale, 'giris')}?mode=register&from=${context}`}
        onClick={() => trackFunnel('invite_click', context)}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-gold text-dark font-semibold px-5 py-3 text-sm hover:bg-gold-hover transition-colors whitespace-nowrap"
      >
        {g.join}
        <ArrowRight size={15} />
      </a>
    </div>
  );
}
