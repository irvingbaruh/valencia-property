'use client';

import { useLocale } from 'next-intl';
import { Check } from 'lucide-react';
import { benefits } from '@/lib/memberBenefits';
import { useAuth } from '@/components/providers/AuthProvider';

// What a free membership includes; shown under the sign-in / sign-up form to visitors.
export default function MemberBenefitsList() {
  const locale = useLocale();
  const { user, loading } = useAuth();
  const b = benefits(locale);
  if (loading || user) return null;
  return (
    <section className="bg-soft px-4 pb-24 -mt-12">
      <div className="max-w-2xl mx-auto">
        <h2 className="font-serif text-2xl text-dark mb-1">{b.title}</h2>
        <p className="text-text-muted mb-5">{b.intro}</p>
        <ul className="space-y-3">
          {b.items.map(([h, t]) => (
            <li key={h} className="flex gap-3">
              <Check className="w-5 h-5 text-gold shrink-0 mt-0.5" />
              <div><p className="font-medium text-dark">{h}</p><p className="text-sm text-text-muted">{t}</p></div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
