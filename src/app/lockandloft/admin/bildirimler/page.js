'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import AdminLayout, { ADMIN_BASE } from '@/components/admin/AdminLayout';
import { Mail, Phone, MessageCircle, Check, ClipboardList, UserPlus } from 'lucide-react';

const card = { background: '#151521', border: '1px solid #1E1E2E' };
const inner = { background: '#0B0B11', border: '1px solid #1E1E2E' };
const TABS = [
  ['messages', 'İletişim mesajları'],
  ['intakes', 'Danışmanlık talepleri'],
  ['members', 'Yeni üyeler'],
];
const LANG = { tr: 'Türkçe', es: 'Español', en: 'English', de: 'Deutsch' };
const fmt = (d) =>
  d ? new Date(d).toLocaleString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
const waLink = (phone) => `https://wa.me/${String(phone || '').replace(/\D/g, '')}`;

function Inbox() {
  const [tab, setTab] = useState('messages');
  const [messages, setMessages] = useState([]);
  const [intakes, setIntakes] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showHandled, setShowHandled] = useState(false);

  const load = useCallback(async () => {
    const [m, i, p] = await Promise.all([
      supabase.from('contact_messages').select('*').order('created_at', { ascending: false }).limit(200),
      supabase.from('client_intake').select('id, user_id, submitted_at, created_at, answers, lang').order('created_at', { ascending: false }).limit(50),
      supabase.from('profiles_with_email').select('*').order('created_at', { ascending: false }).limit(50),
    ]);
    setMessages(m.data || []);
    const profiles = p.data || [];
    setMembers(profiles);
    const byId = Object.fromEntries(profiles.map((x) => [x.id, x]));
    const missing = [...new Set((i.data || []).map((r) => r.user_id).filter((id) => !byId[id]))];
    if (missing.length) {
      const { data } = await supabase.from('profiles_with_email').select('*').in('id', missing);
      (data || []).forEach((x) => (byId[x.id] = x));
    }
    setIntakes((i.data || []).map((r) => ({ ...r, member: byId[r.user_id] })));
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const toggleHandled = async (msg) => {
    await supabase.from('contact_messages').update({ is_handled: !msg.is_handled }).eq('id', msg.id);
    load();
  };

  const open = messages.filter((m) => !m.is_handled);
  const list = showHandled ? messages : open;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-white">Bildirimler</h1>
        <p className="text-sm text-[#9A9AAA] mt-1">Sitenizden gelen mesajlar, danışmanlık talepleri ve yeni üyeler.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`px-3.5 py-2 rounded-lg text-sm transition-colors ${tab === id ? 'text-[#C9A84C]' : 'text-[#9A9AAA] hover:text-white'}`}
            style={tab === id ? { background: 'rgba(201,168,76,0.15)' } : inner}
          >
            {label}
            {id === 'messages' && open.length > 0 && (
              <span className="ml-2 text-xs px-1.5 py-0.5 rounded-full bg-[#DC1C2E] text-white">{open.length}</span>
            )}
          </button>
        ))}
      </div>

      <section className="rounded-xl p-5" style={card}>
        {loading ? (
          <p className="text-sm text-[#9A9AAA]">Yükleniyor…</p>
        ) : tab === 'messages' ? (
          <>
            <label className="flex items-center gap-2 text-xs text-[#9A9AAA] mb-4 cursor-pointer w-fit">
              <input type="checkbox" checked={showHandled} onChange={(e) => setShowHandled(e.target.checked)} className="accent-[#C9A84C]" />
              İşlenenleri de göster
            </label>
            {list.length === 0 ? (
              <p className="text-sm text-[#9A9AAA]">Yeni mesaj yok.</p>
            ) : (
              <ul className="space-y-3">
                {list.map((m) => (
                  <li key={m.id} className="rounded-lg px-4 py-4" style={inner}>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white">
                          {m.name} {m.lang && <span className="text-[11px] text-[#6A6A7A] font-normal">• {LANG[m.lang] || m.lang}</span>}
                        </p>
                        <p className="text-[11px] text-[#6A6A7A]">{fmt(m.created_at)}</p>
                      </div>
                      <button
                        onClick={() => toggleHandled(m)}
                        className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full ${m.is_handled ? 'bg-[#22C55E]/15 text-[#22C55E]' : 'border border-[#C9A84C]/50 text-[#C9A84C] hover:bg-[#C9A84C]/10'}`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        {m.is_handled ? 'İşlendi' : 'İşlendi olarak işaretle'}
                      </button>
                    </div>
                    <p className="text-sm text-white/80 mt-3 whitespace-pre-wrap break-words">{m.message}</p>
                    <div className="flex flex-wrap gap-4 mt-3 text-xs">
                      <a href={`mailto:${m.email}`} className="flex items-center gap-1.5 text-[#C9A84C] hover:underline">
                        <Mail className="w-3.5 h-3.5" />
                        {m.email}
                      </a>
                      {m.phone && (
                        <>
                          <a href={`tel:${m.phone}`} className="flex items-center gap-1.5 text-[#9A9AAA] hover:text-white">
                            <Phone className="w-3.5 h-3.5" />
                            {m.phone}
                          </a>
                          <a href={waLink(m.phone)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[#22C55E] hover:underline">
                            <MessageCircle className="w-3.5 h-3.5" />
                            WhatsApp
                          </a>
                        </>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : tab === 'intakes' ? (
          intakes.length === 0 ? (
            <p className="text-sm text-[#9A9AAA]">Henüz danışmanlık talebi yok.</p>
          ) : (
            <ul className="space-y-2">
              {intakes.map((r) => (
                <li key={r.id} className="rounded-lg px-4 py-3 flex flex-wrap items-center gap-3" style={inner}>
                  <ClipboardList className="w-4 h-4 text-[#9A9AAA] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <Link href={`${ADMIN_BASE}/uyeler/detay/?id=${r.user_id}`} className="text-sm text-white hover:text-[#C9A84C]">
                      {r.member?.full_name || r.member?.email || 'Üye'}
                    </Link>
                    <p className="text-[11px] text-[#6A6A7A]">
                      {fmt(r.submitted_at || r.created_at)}
                      {r.answers?.budget ? ` • Bütçe: ${r.answers.budget}` : ''}
                    </p>
                  </div>
                  <Link href={`${ADMIN_BASE}/uyeler/detay/?id=${r.user_id}`} className="text-xs text-[#C9A84C] hover:underline">
                    Talebi aç
                  </Link>
                </li>
              ))}
            </ul>
          )
        ) : members.length === 0 ? (
          <p className="text-sm text-[#9A9AAA]">Henüz üye yok.</p>
        ) : (
          <ul className="space-y-2">
            {members.map((p) => (
              <li key={p.id} className="rounded-lg px-4 py-3 flex flex-wrap items-center gap-3" style={inner}>
                <UserPlus className="w-4 h-4 text-[#9A9AAA] shrink-0" />
                <div className="flex-1 min-w-0">
                  <Link href={`${ADMIN_BASE}/uyeler/detay/?id=${p.id}`} className="text-sm text-white hover:text-[#C9A84C]">
                    {p.full_name || p.email}
                  </Link>
                  <p className="text-[11px] text-[#6A6A7A]">
                    {fmt(p.created_at)}
                    {p.preferred_language ? ` • ${LANG[p.preferred_language] || p.preferred_language}` : ''}
                    {p.source === 'consultation_form' ? ' • Danışmanlık formundan' : ''}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default function AdminNotificationsPage() {
  return (
    <AdminLayout activeSection="bildirimler">
      <Inbox />
    </AdminLayout>
  );
}
