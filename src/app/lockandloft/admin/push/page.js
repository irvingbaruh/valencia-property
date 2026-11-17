'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import AdminLayout from '@/components/admin/AdminLayout';
import MessagingTabs from '@/components/admin/MessagingTabs';
import PushComposer from '@/components/admin/PushComposer';
import { SEGMENTS, channelOptions, stageOptions, matchSegment } from '@/lib/segments';
import { Bell, Search, X, Check, Users } from 'lucide-react';

const card = { background: '#151521', border: '1px solid #1E1E2E' };
const sel = 'bg-[#0B0B11] border border-[#2A2A3A] rounded-lg px-3 py-2 text-sm text-white focus:border-[#C9A84C] focus:outline-none';
const fmt = (d) => new Date(d).toLocaleString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
const chip = (on) => (on ? { background: 'rgba(201,168,76,0.15)', color: '#C9A84C' } : { border: '1px solid #1E1E2E', color: '#9A9AAA' });

export default function AdminPushPage() {
  const [leads, setLeads] = useState([]);
  const [history, setHistory] = useState([]);
  const [mode, setMode] = useState('segment'); // segment | users
  const [on, setOn] = useState([]);
  const [channel, setChannel] = useState('');
  const [stage, setStage] = useState('');
  const [lang, setLang] = useState('tr');
  const [picked, setPicked] = useState([]);
  const [search, setSearch] = useState('');

  const loadHistory = useCallback(() => supabase.from('push_broadcasts').select('id, title, sent, failed, created_at').order('created_at', { ascending: false }).limit(15).then(({ data }) => setHistory(data || [])), []);
  useEffect(() => {
    supabase.rpc('admin_leads').then(({ data }) => setLeads(data || []));
    loadHistory();
  }, [loadHistory]);

  const filtered = on.length > 0 || !!channel || !!stage;
  const matched = useMemo(() => matchSegment(leads, { on, channel, stage }), [leads, on, channel, stage]);
  const chosen = mode === 'segment' ? matched : leads.filter((l) => picked.includes(l.id));
  const reachable = chosen.filter((l) => l.has_push);
  const found = useMemo(() => {
    const q = search.trim().toLowerCase();
    return leads.filter((l) => !picked.includes(l.id) && (!q || (l.full_name || '').toLowerCase().includes(q) || (l.email || '').toLowerCase().includes(q))).slice(0, 8);
  }, [leads, search, picked]);
  const toggle = (k) => setOn((a) => (a.includes(k) ? a.filter((x) => x !== k) : [...a, k]));

  const audience = {
    mode: mode === 'segment' && !filtered ? 'all' : 'users',
    ids: chosen.map((l) => l.id),
    lang: lang === 'tr' ? 'tr' : 'all',
    blocked: reachable.length === 0 ? (chosen.length === 0 ? 'Seçime uyan üye yok.' : 'Seçilen üyelerin hiçbirinde bildirim açık değil.') : null,
    who: `bildirimi açık ${reachable.length} üyeye`,
    button: `${reachable.length} üyeye gönder`,
  };

  return (
    <AdminLayout activeSection="mailing">
      <div className="max-w-5xl">
        <h1 className="text-2xl font-serif text-white mb-1">Mailing ve Push</h1>
        <p className="text-sm text-[#9A9AAA] mb-5">Üyelerin telefonuna bildirim gönderin. Uygulamayı kuran ve bildirimi açık bırakan üyelere ulaşır.</p>
        <MessagingTabs active="push" />

        <div className="grid lg:grid-cols-[1.4fr_1fr] gap-6">
          <div className="space-y-6">
            <section className="rounded-xl p-5" style={card}>
              <h2 className="flex items-center gap-2 text-base font-semibold text-white mb-4"><Users className="w-4 h-4 text-[#C9A84C]" />Kime</h2>
              <div className="flex gap-2 mb-4">
                <button type="button" onClick={() => setMode('segment')} className="px-3 py-1.5 rounded-lg text-xs font-medium" style={chip(mode === 'segment')}>Gruba göre</button>
                <button type="button" onClick={() => setMode('users')} className="px-3 py-1.5 rounded-lg text-xs font-medium" style={chip(mode === 'users')}>Üyeleri tek tek seç</button>
              </div>

              {mode === 'segment' ? (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {SEGMENTS.map(([k, label]) => (
                      <button key={k} type="button" aria-pressed={on.includes(k)} onClick={() => toggle(k)} className="px-3 py-1.5 rounded-lg text-xs font-medium" style={chip(on.includes(k))}>{label}</button>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <label className="text-xs text-[#9A9AAA]">Geldiği kanal
                      <select value={channel} onChange={(e) => setChannel(e.target.value)} className={`${sel} block mt-1`}>
                        <option value="">Hepsi</option>
                        {channelOptions(leads).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                      </select>
                    </label>
                    <label className="text-xs text-[#9A9AAA]">Aşama
                      <select value={stage} onChange={(e) => setStage(e.target.value)} className={`${sel} block mt-1`}>
                        <option value="">Hepsi</option>
                        {stageOptions.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                      </select>
                    </label>
                    {filtered && <button type="button" onClick={() => { setOn([]); setChannel(''); setStage(''); }} className="self-end text-xs text-[#9A9AAA] hover:text-white pb-2.5">Seçimi temizle</button>}
                  </div>
                  <p className="text-[11px] text-[#6A6A7A]">Birden fazla grup seçerseniz üyenin hepsine uyması gerekir. Hiçbir şey seçmezseniz tüm üyelere gider.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {picked.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {picked.map((id) => { const m = leads.find((x) => x.id === id); return (
                        <span key={id} className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs text-white" style={{ background: '#0B0B11', border: '1px solid #2A2A3A' }}>
                          {m?.full_name || m?.email || 'Üye'}{!m?.has_push && <span className="text-[#F87171]" title="Bildirimi kapalı">•</span>}
                          <button type="button" onClick={() => setPicked((p) => p.filter((x) => x !== id))} aria-label="Çıkar"><X className="w-3 h-3 text-[#9A9AAA]" /></button>
                        </span>); })}
                    </div>
                  )}
                  <div className="relative">
                    <Search className="w-4 h-4 text-[#6A6A7A] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Üye ara (ad ya da e-posta)" className="w-full bg-[#0B0B11] border border-[#2A2A3A] rounded-lg pl-9 pr-3 py-2.5 text-sm text-white placeholder:text-[#6A6A7A] focus:border-[#C9A84C] focus:outline-none" />
                  </div>
                  {search.trim() && (
                    <ul className="rounded-lg overflow-hidden" style={{ border: '1px solid #1E1E2E' }}>
                      {found.length === 0 ? <li className="px-3 py-2.5 text-xs text-[#9A9AAA]">Üye bulunamadı.</li> : found.map((m) => (
                        <li key={m.id}>
                          <button type="button" onClick={() => { setPicked((p) => [...p, m.id]); setSearch(''); }} className="w-full flex items-center justify-between gap-3 px-3 py-2.5 text-left hover:bg-white/5">
                            <span className="min-w-0"><span className="block text-sm text-white truncate">{m.full_name || 'İsimsiz'}</span><span className="block text-xs text-[#6A6A7A] truncate">{m.email}</span></span>
                            {m.has_push ? <Bell className="w-4 h-4 text-[#C9A84C] shrink-0" aria-label="Bildirimi açık" /> : <span className="text-[11px] text-[#6A6A7A] shrink-0">bildirim kapalı</span>}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              <label className="flex items-center gap-2 mt-4 text-xs text-[#9A9AAA] cursor-pointer">
                <input type="checkbox" checked={lang === 'tr'} onChange={(e) => setLang(e.target.checked ? 'tr' : 'all')} className="w-4 h-4 accent-[#C9A84C]" />
                Sadece Türkçe kullanan üyelere gönder (diğer dillerdeki üyeler Türkçe mesaj almaz)
              </label>
              <p className="mt-4 text-sm text-white" role="status">
                {chosen.length} üye seçili, <span className="text-[#C9A84C]">{reachable.length}</span> tanesinde bildirim açık.
                {chosen.length > 0 && chosen.length <= 6 && <span className="block text-xs text-[#9A9AAA] mt-1">{chosen.map((l) => l.full_name || l.email).join(', ')}</span>}
              </p>
            </section>

            <section className="rounded-xl p-5" style={card}>
              <h2 className="text-base font-semibold text-white mb-4">Mesaj</h2>
              <PushComposer audience={audience} onSent={loadHistory} />
            </section>
          </div>

          <aside>
            <section className="rounded-xl" style={card}>
              <h2 className="text-sm font-semibold text-white px-5 pt-5 pb-3">Son gönderilenler</h2>
              {history.length === 0 ? <p className="px-5 pb-5 text-xs text-[#9A9AAA]">Henüz mesaj gönderilmedi.</p> : (
                <ul>
                  {history.map((h) => (
                    <li key={h.id} className="px-5 py-3" style={{ borderTop: '1px solid #1E1E2E' }}>
                      <p className="text-sm text-white truncate">{h.title}</p>
                      <p className="text-xs text-[#9A9AAA] mt-0.5 flex items-center gap-1.5"><Check className="w-3 h-3 text-green-400" />{h.sent} cihaz{h.failed ? `, ${h.failed} başarısız` : ''} · {fmt(h.created_at)}</p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </aside>
        </div>
      </div>
    </AdminLayout>
  );
}
