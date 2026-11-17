'use client';

import { useState } from 'react';
import { Check, BellOff } from 'lucide-react';
import { supabase } from '@/lib/supabase';

// One-tap answers for a member who is waiting for a reply: "done" logs an outbound contact (the red flag
// goes and the daily reminder stops), "snooze" hides the reminder for a few days.
export default function LeadQuick({ id, onChanged, size = 'sm' }) {
  const [busy, setBusy] = useState('');
  const [err, setErr] = useState(false);
  const go = async (e, action) => {
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;
    setBusy(action);
    setErr(false);
    const { error } = await supabase.rpc('admin_lead_quick', { p_user: id, p_action: action, p_days: 3 });
    setBusy('');
    if (error) setErr(true);
    else onChanged?.(id, action);
  };
  const pad = size === 'sm' ? 'px-2.5 py-1.5 text-xs' : 'px-3 py-2 text-sm';
  return (
    <span className="inline-flex flex-wrap items-center gap-2" onClick={(e) => e.stopPropagation()}>
      <button type="button" onClick={(e) => go(e, 'done')} disabled={!!busy} className={`inline-flex items-center gap-1.5 rounded-lg font-medium disabled:opacity-60 ${pad}`} style={{ background: 'rgba(34,197,94,0.15)', color: '#22C55E' }}>
        <Check className="w-3.5 h-3.5" />{busy === 'done' ? 'Kaydediliyor…' : 'Dönüş yaptım'}
      </button>
      <button type="button" onClick={(e) => go(e, 'snooze')} disabled={!!busy} className={`inline-flex items-center gap-1.5 rounded-lg disabled:opacity-60 ${pad}`} style={{ border: '1px solid #1E1E2E', color: '#9A9AAA' }}>
        <BellOff className="w-3.5 h-3.5" />{busy === 'snooze' ? 'Kaydediliyor…' : '3 gün ertele'}
      </button>
      {err && <span className="text-xs text-red-400">Kaydedilemedi</span>}
    </span>
  );
}
