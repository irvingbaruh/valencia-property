'use client';
import { useTranslations } from 'next-intl';
import ScrollReveal from '@/components/ui/ScrollReveal';

export default function PartnerStrip() {
  const t = useTranslations('partnerStrip');
  return (
    <ScrollReveal className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-2">
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-5 text-center">
        <span className="text-sm text-text-muted">{t('text')}</span>
        <img src="/brand/remax-logo.png" alt="RE/MAX" width={120} height={33} className="h-8 w-auto" loading="lazy" />
      </div>
    </ScrollReveal>
  );
}
