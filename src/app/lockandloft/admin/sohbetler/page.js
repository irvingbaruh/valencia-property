'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import AdminLayout from '@/components/admin/AdminLayout';
import { MessageSquare, Trash2, Mail, Phone, UserRound, AlertTriangle } from 'lucide-react';

const fmt = (d) => new Date(d).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

const PROVIDERS = [
  { id: 'anthropic', name: 'Anthropic (Claude Haiku)', note: 'Ana sağlayıcı' },
  { id: 'deepseek', name: 'DeepSeek', note: 'Yedek; veriler AB dışına (Çin dahil) gidebilir' },
];

function ProviderBox() {
  const [provider, setProvider] = useState('anthropic');
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);
  const load = useCallback(async () => {
    const { data } = await supabase.from('site_settings').select('key,value').in('key', ['chat_provider', 'chat_status']);
    const m = Object.fromEntries((data || []).map((r) => [r.key, r.value]));
    setProvider(m.chat_provider?.provider || 'anthropic');
    setStatus(m.chat_status || null);
  }, []);
  useEffect(() => { load(); }, [load]);
  const choose = async (id) => {
    if (id === provider) return;
    setBusy(true);
    const { error } = await supabase.from('site_settings').upsert({ key: 'chat_provider', value: { provider: id }, is_public: false, updated_at: new Date().toISOString() });
    if (error) alert('Kaydedilemedi: ' + error.message); else setProvider(id);
    setBusy(false);
  };
  const dismiss = async () => {
    await supabase.from('site_settings').upsert({ key: 'chat_status', value: { error: false, at: new Date().toISOString() }, is_public: false, updated_at: new Date().toISOString() });
    load();
  };
  return (
    <div className="bg-[#151521] border border-[#2A2A3A] rounded-2xl p-4 mb-5">
      {status?.error && (
        <div className="flex items-start gap-3 mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-sm text-red-200">
          <AlertTriangle size={18} className="shrink-0 mt-0.5" />
          <div className="flex-1">
            <b>Asistan şu an yanıt veremiyor.</b> {status.provider === 'anthropic' ? 'Anthropic' : status.provider === 'deepseek' ? 'DeepSeek' : status.provider} hata verdi (kod {status.status}), {status.at ? fmt(status.at) : ''}. Kredi bitmiş ya da anahtar geçersiz olabilir. Aşağıdan diğer sağlayıcıya geçebilirsiniz.
            {status.detail ? <div className="text-xs opacity-70 mt-1 break-words">{status.detail}</div> : null}
          </div>
          <button onClick={dismiss} className="text-xs underline shrink-0">Uyarıyı kapat</button>
        </div>
      )}
      <div className="text-sm text-white font-medium mb-2">Sohbet asistanı sağlayıcısı</div>
      <div className="flex flex-wrap gap-2">
        {PROVIDERS.map((p) => (
          <button key={p.id} disabled={busy} onClick={() => choose(p.id)}
            className={`text-left px-4 py-2.5 rounded-xl border text-sm transition-colors ${provider === p.id ? 'border-[#C9A84C] bg-[#C9A84C]/10 text-white' : 'border-[#2A2A3A] text-[#C8C8D4] hover:border-[#C9A84C]/50'}`}>
            <div className="font-medium">{p.name}{provider === p.id ? ' · seçili' : ''}</div>
            <div className="text-xs text-[#9A9AAA]">{p.note}</div>
          </button>
        ))}
      </div>
      <p className="text-xs text-[#9A9AAA] mt-3">Anthropic kredisi bitince DeepSeek'e geçin, kredi yenilenince geri alın. Değişiklik bir dakika içinde geçerli olur. DeepSeek için Supabase'te DEEPSEEK_API_KEY tanımlı olmalı. Hata olursa yöneticilere e-posta gider (en sık 3 saatte bir).</p>
    </div>
  );
}

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
        <ProviderBox />
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
