'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { getMailChoice, setMailChoice, subscribeMailChoice } from '@/lib/mailChoice';

// Floating check box on the pages where the admin starts services / stages / documents for a member.
// Unchecked = only the panel notification (and the phone push, if the member has the app). Checked = the e-mail goes too, once.
const PAGES = /\/admin\/(uyeler|hizmetler|dosyalar)/;

export default function MailChoiceBar() {
  const path = usePathname() || '';
  const [on, setOn] = useState(false);
  useEffect(() => subscribeMailChoice(setOn), []);
  // switch it off when moving to another page, so a forgotten tick never mails anyone later
  useEffect(() => { if (getMailChoice()) setMailChoice(false); }, [path]);
  if (!PAGES.test(path)) return null;
  return (
    <label
      className={`fixed bottom-4 left-4 z-[60] flex max-w-[calc(100vw-2rem)] cursor-pointer select-none items-center gap-3 rounded-xl border px-4 py-3 text-sm shadow-lg transition-colors ${
        on ? 'border-[#C9A84C] bg-[#C9A84C] text-[#0B0B11]' : 'border-[#2A2A3C] bg-[#151521] text-white'
      }`}
      style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
    >
      <input
        type="checkbox"
        checked={on}
        onChange={(e) => setMailChoice(e.target.checked)}
        className="h-5 w-5 shrink-0 accent-[#0B0B11]"
      />
      <span className="leading-snug">
        <span className="block font-semibold">Bu bildirimi üyeye e-posta ile de gönder</span>
        <span className={`block text-xs ${on ? 'text-[#0B0B11]/80' : 'text-[#9A9AAA]'}`}>
          {on ? 'Sıradaki işlem için e-posta da gider, sonra kendiliğinden kapanır.' : 'İşaretlemezseniz yalnızca panel bildirimi (ve varsa uygulama bildirimi) gider.'}
        </span>
      </span>
    </label>
  );
}
