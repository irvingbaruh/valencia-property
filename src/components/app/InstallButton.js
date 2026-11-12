'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Download } from 'lucide-react';
import { isIos, isStandalone } from '@/lib/memberPush';
import { getInstallPrompt, onInstallPrompt } from '@/components/app/SiteApp';
import InstallSteps from '@/components/app/InstallSteps';

// "Add to your phone" button. Android/Chrome installs directly; iPhone shows the Share-menu guide.
export default function InstallButton({ className = '' }) {
  const t = useTranslations('memberApp');
  const [state, setState] = useState('hidden'); // hidden | install | ios
  const [guide, setGuide] = useState(false);

  useEffect(() => {
    const refresh = () => {
      if (isStandalone()) setState('hidden');
      else if (getInstallPrompt()) setState('install');
      else if (isIos()) setState('ios');
      else setState('hidden');
    };
    refresh();
    return onInstallPrompt(refresh);
  }, []);

  if (state === 'hidden') return null;

  const click = async () => {
    const p = getInstallPrompt();
    if (p) {
      p.prompt();
      try { await p.userChoice; } catch {}
    } else {
      setGuide(true);
    }
  };

  return (
    <>
      <button type="button" onClick={click} className={className || 'inline-flex items-center gap-2 rounded-lg border border-[#C9A84C]/60 px-3.5 py-2 text-sm text-white hover:bg-[#C9A84C] hover:text-[#0B0B11] transition-colors'}>
        <Download size={15} /> {t('installBtn')}
      </button>
      {guide && <InstallSteps onClose={() => setGuide(false)} />}
    </>
  );
}
