'use client';

import { useLocale } from 'next-intl';
import { MessageCircle, ArrowRight } from 'lucide-react';
import { localePath } from '@/lib/routes';
import { useContactSettings, waDigits } from '@/lib/siteSettings';
import { useAuth } from '@/components/providers/AuthProvider';

// Call to action used on the guide: WhatsApp and contact form, plus a nudge to join for visitors who are not members yet.
export default function GuideCta({ title, text, whatsapp, form, members, compact = false }) {
  const locale = useLocale();
  const contact = useContactSettings();
  const { user, loading } = useAuth();
  return (
    <div className={`rounded-2xl bg-dark text-white border border-gold/30 ${compact ? 'p-6' : 'p-8 sm:p-10'}`}>
      <h2 className={`font-serif ${compact ? 'text-2xl' : 'text-3xl'} mb-3`}>{title}</h2>
      <p className="text-white/80 max-w-2xl leading-relaxed mb-6">{text}</p>
      <div className="flex flex-wrap gap-3">
        <a href={`https://wa.me/${waDigits(contact.whatsapp)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-gold text-dark font-semibold px-5 py-3 text-sm hover:bg-gold-hover transition-colors">
          <MessageCircle size={16} />{whatsapp}
        </a>
        <a href={localePath(locale, 'iletisim')} className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-5 py-3 text-sm hover:border-gold hover:text-gold transition-colors">
          {form}<ArrowRight size={15} />
        </a>
      </div>
      {!compact && !loading && !user && (
        <a href={`${localePath(locale, 'giris')}?app=1`} className="inline-block mt-6 text-sm text-gold hover:underline">{members}</a>
      )}
    </div>
  );
}
