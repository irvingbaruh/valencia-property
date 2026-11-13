'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Flame, Clock, CalendarClock, ChevronRight } from 'lucide-react';
import { ADMIN_BASE } from '@/components/admin/AdminLayout';
import { scoreTone, leadReasons, needsAttention, waitingDays, channelLabel } from '@/lib/leads';

const card = { background: '#151521', border: '1px solid #1E1E2E' };
const fmt = (d) => new Date(d).toLocaleString('tr-TR', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
const recentlyContacted = (l) => l.last_contact_at && Date.now() - new Date(l.last_contact_at).getTime() < 5 * 864e5;

function Row({ l, right }) {
  const tone = scoreTone(l.score);
  return (
    <Link href={`${ADMIN_BASE}/uyeler/detay/?id=${l.id}`} className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 transition-colors">
      <span className="w-10 text-center text-sm font-semibold py-1 rounded-full tabular-nums shrink-0" style={{ background: tone.bg, color: tone.color }}>{l.score}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-white truncate">{l.full_name || l.email || 'İsimsiz üye'}{l.channel ? <span className="ml-2 text-xs font-normal text-[#6A6A7A]">{channelLabel(l.channel)}</span> : null}</span>
        <span className="block text-xs text-[#9A9AAA] truncate">{leadReasons(l).slice(0, 3).join(' · ') || 'Yeni üye'}</span>
      </span>
      {right}
      <ChevronRight className="w-4 h-4 text-[#6A6A7A] shrink-0" />
    </Link>
  );
}

// Dashboard: who to call this week, who has been waiting for an answer, and the next video calls.
export default function LeadBoard() {
  const [leads, setLeads] = useState(null);
  const [appts, setAppts] = useState([]);

  useEffect(() => {
    supabase.rpc('admin_leads').then(({ data }) => setLeads(data || []));
    supabase.from('appointments').select('id, user_id, starts_at, channel, topic').eq('status', 'booked').gt('starts_at', new Date(Date.now() - 3600e3).toISOString()).order('starts_at').limit(5)
      .then(({ data }) => setAppts(data || []));
  }, []);

  if (!leads) return <div className="rounded-xl h-40 animate-pulse mb-8" style={{ background: '#151521' }} />;
  const open = leads.filter((l) => !['won', 'lost'].includes(l.stage));
  const waiting = open.filter(needsAttention).sort((a, b) => waitingDays(b) - waitingDays(a));
  const toCall = open.filter((l) => l.score >= 10 && !needsAttention(l) && !recentlyContacted(l)).slice(0, 5);
  const byId = Object.fromEntries(leads.map((l) => [l.id, l]));

  return (
    <div className="grid lg:grid-cols-2 gap-4 mb-8">
      <section className="rounded-xl" style={card}>
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #1E1E2E' }}>
          <h2 className="flex items-center gap-2 text-base font-semibold text-white"><Flame className="w-4 h-4 text-[#C9A84C]" />Bu hafta aranacaklar</h2>
          <span className="text-xs text-[#6A6A7A]">en sıcak 5 üye</span>
        </div>
        <div className="p-2">
          {toCall.length === 0 ? <p className="text-center text-sm text-[#9A9AAA] py-8">Şu an öne çıkan üye yok. Üyeler favori ekledikçe, arama kaydettikçe ve form doldurdukça burada sıralanır.</p>
            : toCall.map((l) => <Row key={l.id} l={l} />)}
        </div>
      </section>

      <section className="rounded-xl" style={card}>
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #1E1E2E' }}>
          <h2 className="flex items-center gap-2 text-base font-semibold text-white"><Clock className="w-4 h-4 text-[#F87171]" />Dönüş bekleyenler{waiting.length ? ` (${waiting.length})` : ''}</h2>
          <Link href={`${ADMIN_BASE}/uyeler/?f=followup`} className="text-xs font-medium hover:underline" style={{ color: '#C9A84C' }}>Tümü</Link>
        </div>
        <div className="p-2">
          {waiting.length === 0 ? <p className="text-center text-sm text-[#9A9AAA] py-8">Bekleyen kimse yok. Form, randevu ya da mesajdan sonra 3 gün içinde iletişim kaydı girilmezse üye burada görünür.</p>
            : waiting.slice(0, 5).map((l) => <Row key={l.id} l={l} right={<span className="text-xs font-medium px-2 py-1 rounded-full shrink-0" style={{ background: 'rgba(248,113,113,0.15)', color: '#F87171' }}>{l.followup_due ? 'Bugün ara' : `${waitingDays(l)} gün`}</span>} />)}
        </div>
      </section>

      {appts.length > 0 && (
        <section className="rounded-xl lg:col-span-2" style={card}>
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #1E1E2E' }}>
            <h2 className="flex items-center gap-2 text-base font-semibold text-white"><CalendarClock className="w-4 h-4 text-[#C9A84C]" />Yaklaşan görüşmeler</h2>
            <Link href={`${ADMIN_BASE}/randevular/`} className="text-xs font-medium hover:underline" style={{ color: '#C9A84C' }}>Randevular</Link>
          </div>
          <ul className="p-2">
            {appts.map((a) => (
              <li key={a.id}>
                <Link href={`${ADMIN_BASE}/randevular/`} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 rounded-lg hover:bg-white/5">
                  <span className="text-sm font-medium text-white">{fmt(a.starts_at)}</span>
                  <span className="text-sm text-[#9A9AAA]">{byId[a.user_id]?.full_name || byId[a.user_id]?.email || 'Üye'}</span>
                  <span className="text-xs text-[#6A6A7A]">{a.channel === 'whatsapp' ? 'WhatsApp' : a.channel === 'phone' ? 'Telefon' : 'Google Meet'}{a.topic ? ` · ${a.topic}` : ''}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
