'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import AdminLayout from '@/components/admin/AdminLayout';
import { MessageSquare, Trash2, Mail, Phone, UserRound } from 'lucide-react';

const fmt = (d) => new Date(d).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

export default function ChatsAdmin() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [onlyLeads, setOnlyLeads] = useState(false);
  const [sel, setSel] = useState(null);
  const [msgs, setMsgs] = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('chat_sessions').select('*').order('created_at', { ascending: false }).limit(200);
    setRows(data || []);
    setLoading(false);
    const id = new URLSearchParams(window.location.search).get('id');
    if (id) { const s = (data || []).find((r) => r.id === id); if (s) setSel(s); }
  }, []);
  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!sel) { setMsgs([]); return; }
    supabase.from('chat_messages').select('*').eq('session_id', sel.id).order('created_at').then(({ data }) => setMsgs(data || []));
  }, [sel]);

  const remove = async (s) => {
    if (!confirm('Bu konuşma kalıcı olarak silinsin mi?')) return;
    await supabase.from('chat_messages').delete().eq('session_id', s.id);
    await supabase.from('chat_sessions').delete().eq('id', s.id);
    setSel(null);
    load();
  };

  const shown = rows.filter((r) => (onlyLeads ? r.lead_at : true));
  const leads = rows.filter((r) => r.lead_at).length;

  return (
    <AdminLayout activeSection="sohbetler">
      <div className="p-6 lg:p-8">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-white">Sohbetler</h1>
            <p className="text-sm text-[#9A9AAA] mt-1">{rows.length} konuşma · {leads} iletişim talebi</p>
          </div>
          <label className="flex items-center gap-2 text-sm text-[#C8C8D4] cursor-pointer">
            <input type="checkbox" checked={onlyLeads} onChange={(e) => setOnlyLeads(e.target.checked)} />
            Sadece iletişim bırakanlar
          </label>
        </div>

        <div className="grid lg:grid-cols-[360px_1fr] gap-4">
          <div className="bg-[#151521] border border-[#2A2A3A] rounded-2xl overflow-hidden max-h-[75vh] overflow-y-auto">
            {loading && <div className="p-6 text-sm text-[#9A9AAA]">Yükleniyor…</div>}
            {!loading && shown.length === 0 && <div className="p-6 text-sm text-[#9A9AAA]">Henüz konuşma yok.</div>}
            {shown.map((r) => (
              <button key={r.id} onClick={() => setSel(r)} className={`w-full text-left px-4 py-3 border-b border-[#2A2A3A] hover:bg-[#1C1C2B] ${sel?.id === r.id ? 'bg-[#1C1C2B]' : ''}`}>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-white truncate">{r.contact_name || r.first_message || '(boş)'}</span>
                  <span className="text-[11px] text-[#6A6A7A] shrink-0">{fmt(r.created_at)}</span>
                </div>
                <div className="flex items-center gap-2 mt-1 text-[11px] text-[#9A9AAA]">
                  <span className="uppercase">{r.language}</span>
                  <span>{r.message_count} mesaj</span>
                  {r.lead_at && <span className="text-[#C9A84C]">iletişim bıraktı</span>}
                </div>
              </button>
            ))}
          </div>

          <div className="bg-[#151521] border border-[#2A2A3A] rounded-2xl p-5 max-h-[75vh] overflow-y-auto">
            {!sel && (
              <div className="text-sm text-[#9A9AAA] flex items-center gap-2"><MessageSquare size={16} /> Soldan bir konuşma seçin.</div>
            )}
            {sel && (
              <>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="space-y-1 text-sm text-[#C8C8D4]">
                    {sel.lead_at ? (
                      <>
                        <div className="flex items-center gap-2 text-white"><UserRound size={14} /> {sel.contact_name}</div>
                        {sel.contact_email && <div className="flex items-center gap-2"><Mail size={14} /> <a className="underline" href={`mailto:${sel.contact_email}`}>{sel.contact_email}</a></div>}
                        {sel.contact_phone && <div className="flex items-center gap-2"><Phone size={14} /> <a className="underline" href={`tel:${sel.contact_phone}`}>{sel.contact_phone}</a></div>}
                        {sel.contact_note && <div className="text-[#9A9AAA]">Not: {sel.contact_note}</div>}
                      </>
                    ) : (
                      <div className="text-[#9A9AAA]">İletişim bilgisi bırakılmadı · {fmt(sel.created_at)}</div>
                    )}
                  </div>
                  <button onClick={() => remove(sel)} className="text-[#E5848F] hover:text-red-400 p-1" title="Sil"><Trash2 size={16} /></button>
                </div>
                <div className="space-y-2">
                  {msgs.map((m) => (
                    <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] rounded-xl px-3 py-2 text-sm whitespace-pre-wrap break-words ${m.role === 'user' ? 'bg-[#C9A84C] text-[#0B0B11]' : 'bg-[#0B0B11] text-[#E5E5EC] border border-[#2A2A3A]'}`}>
                        {m.content}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
