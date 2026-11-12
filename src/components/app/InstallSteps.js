'use client';

import { useTranslations } from 'next-intl';
import { X } from 'lucide-react';

// Step-by-step guide for iPhone, where the browser has no install button.
export default function InstallSteps({ onClose }) {
  const t = useTranslations('memberApp');
  const steps = [t('iosStep1'), t('iosStep2'), t('iosStep3'), t('iosStep4')];
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-3" onClick={onClose} role="dialog" aria-modal="true" aria-label={t('iosTitle')}>
      <div className="w-full max-w-sm rounded-2xl bg-white text-[#14141E] p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3 mb-4">
          <h2 className="text-lg font-serif font-semibold">{t('iosTitle')}</h2>
          <button onClick={onClose} className="p-1 text-gray-500" aria-label={t('close')}><X size={18} /></button>
        </div>
        <ol className="list-decimal pl-5 space-y-2 text-sm leading-relaxed">
          {steps.map((s) => <li key={s}>{s}</li>)}
        </ol>
        <p className="text-xs text-gray-500 mt-4">{t('iosNote')}</p>
        <button onClick={onClose} className="mt-5 w-full rounded-xl bg-[#14141E] text-white text-sm font-medium py-3">{t('close')}</button>
      </div>
    </div>
  );
}
