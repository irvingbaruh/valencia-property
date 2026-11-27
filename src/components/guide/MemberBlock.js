'use client';

import { useLocale } from 'next-intl';
import { Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { localePath } from '@/lib/routes';
import { trackFunnel } from '@/lib/funnel';

const TXT = {
  tr: { text: 'Bu araç ücretsiz üyelere açık.', join: 'Ücretsiz üye ol' },
  es: { text: 'Esta herramienta es para miembros gratuitos.', join: 'Crear cuenta gratis' },
  en: { text: 'This tool is open to free members.', join: 'Join free' },
  de: { text: 'Dieses Tool steht kostenlosen Mitgliedern offen.', join: 'Kostenlos registrieren' },
};

// Shows the tool to members; guests get a short invitation card in its place (the tool itself is not rendered for them).
export default function MemberBlock({ id, title, children }) {
  const locale = useLocale();
  const { user, loading } = useAuth();
  if (user) return children;
  const x = TXT[locale] || TXT.tr;
  return (
    <div className="rounded-2xl border border-gold/50 bg-white p-6 flex flex-col sm:flex-row sm:items-center gap-4">
      <Lock className="text-gold shrink-0" size={26} />
      <div className="flex-1">
        {title && <h2 className="font-serif text-xl text-dark mb-0.5">{title}</h2>}
        <p className="text-text-muted text-sm">{x.text}</p>
      </div>
      <a href={`${localePath(locale, 'giris')}?mode=register&from=guide_${id}`} onClick={() => trackFunnel('gate_click', `guide_${id}`)}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-gold text-dark font-semibold px-5 py-3 text-sm hover:bg-gold-hover transition-colors whitespace-nowrap">
        {x.join}<ArrowRight size={15} />
      </a>
    </div>
  );
}
