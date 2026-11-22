'use client';

import { useEffect, useState } from 'react';
import { getMailScope, setMailScope, subscribeMailChoice } from '@/lib/mailChoice';

// Inline check box: "also e-mail the member about this". Put it right next to the Save / Assign / Start button.
// Unticked (default) = only the panel notification (and the phone push if the member has the app).
export default function MailCheck({ scope, label = 'Üyeye e-posta ile de bildir', className = '' }) {
  const [on, setOn] = useState(getMailScope() === scope);
  useEffect(() => {
    setOn(getMailScope() === scope);
    const off = subscribeMailChoice((s) => setOn(s === scope));
    return () => { off(); if (getMailScope() === scope) setMailScope(null); };
  }, [scope]);
  return (
    <label className={`inline-flex cursor-pointer select-none items-center gap-2 text-sm text-[#C8C8D4] ${className}`}>
      <input
        type="checkbox"
        checked={on}
        onChange={(e) => setMailScope(e.target.checked ? scope : null)}
        className="h-4 w-4 shrink-0 accent-[#C9A84C]"
      />
      {label}
    </label>
  );
}
