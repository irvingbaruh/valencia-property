'use client';

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Flame, Compass, StickyNote, MessagesSquare, Pin, Trash2, Phone, Mail, MessageCircle, CalendarClock, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { channelLabel, CHANNEL_COLOR, STAGES, scoreTone, leadReasons, needsAttention, waitingDays, COMM_CHANNELS } from '@/lib/leads';

const card = { background: '#151521', border: '1px solid #1E1E2E' };
const inner = { background: '#0B0B11', border: '1px solid #1E1E2E' };
const input = 'w-full rounded-lg px-3 py-2 text-sm text-white placeholder:text-[#6A6A7A] outline-none focus:ring-2 focus:ring-[#C9A84C]/50';
const fmt = (d) => (d ? new Date(d).toLocaleString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—');
const digits = (v) => String(v || '').replace(/\D/g, '');
const nowLocal = () => { const d = new Date(Date.now() - new Date().getTimezoneOffset() * 60000); return d.toISOString().slice(0, 16); };

// Sales side of a member card: warmth, source, pipeline stage, follow-up date, private notes and contact history.
export default function LeadPanel({ member }) {
  const id = member.id;
  const [lead, setLead] = useState(null);
  const [notes, setNotes] = useState([]);
  const [log, setLog] = useState([]);
  const [appts, setAppts] = useState([]);
  const [me, setMe] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [entry, setEntry] = useState({ channel: 'whatsapp', direction: 'outbound', summary: '', contact_date: nowLocal() });
  const [state, setState] = useState({ stage: 'new', follow_up_at: '', follow_up_note: '' });
  const [busy, setBusy] = useState('');
  const [err, setErr] = useState('');

  const load = useCallback(async () => {
    const [l, n, c, a, u] = await Promise.all([
      supabase.rpc('admin_leads'),
      supabase.from('internal_notes').select('id, content, is_pinned, created_at').eq('user_id', id).order('is_pinned', { ascending: false }).order('created_at', { ascending: false }),
      supabase.from('communication_log').select('id, channel, direction, summary, contact_date').eq('user_id', id).order('contact_date', { ascending: false }).limit(50),
      supabase.from('appointments').select('id, starts_at, channel, status, topic').eq('user_id', id).order('starts_at', { ascending: false }).limit(5),
      supabase.auth.getUser(),
    ]);
    const mine = (l.data || []).find((x) => x.id === id) || null;
    setLead(mine);
    if (mine) setState({ stage: mine.stage || 'new', follow_up_at: mine.follow_up_at || '', follow_up_note: mine.follow_up_note || '' });
    setNotes(n.data || []);
    setLog(c.data || []);
    setAppts(a.data || []);
    setMe(u.data?.user?.id || null);
  }, [id]);
  useEffect(() => { load(); }, [load]);

  const run = async (key, fn) => {
    setBusy(key);
    setErr('');
    const { error } = await fn();
    setBusy('');
    if (error) setErr('Kaydedilemedi. Lütfen tekrar deneyin.');
    else await load();
  };
  const saveState = (patch) => {
    const next = { ...state, ...patch };
    setState(next);
    return run('state', () => supabase.from('lead_state').upsert({ user_id: id, stage: next.stage, follow_up_at: next.follow_up_at || null, follow_up_note: next.follow_up_note || null, updated_at: new Date().toISOString(), updated_by: me }));
  };
  const addNote = () => noteText.trim() && run('note', async () => {
    const r = await supabase.from('internal_notes').insert({ user_id: id, content: noteText.trim().slice(0, 4000), created_by: me });
    if (!r.error) setNoteText('');
    return r;
  });
  const addEntry = () => entry.summary.trim() && run('log', async () => {
    const r = await supabase.from('communication_log').insert({ user_id: id, channel: entry.channel, direction: entry.direction, summary: entry.summary.trim().slice(0, 2000), contact_date: new Date(entry.contact_date || Date.now()).toISOString(), logged_by: me });
    if (!r.error) setEntry((e) => ({ ...e, summary: '', contact_date: nowLocal() }));
    return r;
  });

  const a = member.attribution || {};
  const tone = lead ? scoreTone(lead.score) : null;
  const wa = digits(member.whatsapp_phone || member.phone);

  return (
    <>
      <section className="rounded-xl p-5 space-y-5" style={card}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="flex items-center gap-2 text-base font-semibold text-white"><Flame className="w-4 h-4 text-[#C9A84C]" />Satış takibi</h2>
            {lead ? (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold px-2.5 py-1 rounded-full" style={{ background: tone.bg, color: tone.color }}>{tone.label} · {lead.score} puan</span>
                {needsAttention(lead) && <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ background: 'rgba(248,113,113,0.15)', color: '#F87171' }}>{lead.followup_due ? 'Bugün aranacak' : `${waitingDays(lead)} gündür dönüş bekliyor`}</span>}
                {lead.is_client && <span className="text-xs px-2.5 py-1 rounded-full bg-[#22C55E]/15 text-[#22C55E]">Hizmet alıyor</span>}
              </div>
            ) : <p className="mt-2 text-sm text-[#9A9AAA]">Admin hesapları için puan hesaplanmaz.</p>}
            {lead && <p className="mt-3 text-sm text-[#9A9AAA]">{leadReasons(lead).join(' · ') || 'Henüz bir işaret yok.'}</p>}
          </div>
          <div className="flex gap-2">
            {wa && <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-white bg-[#25D366]/20 hover:bg-[#25D366]/30"><MessageCircle className="w-4 h-4 text-[#25D366]" />WhatsApp</a>}
            {(member.phone || member.whatsapp_phone) && <a href={`tel:${String(member.phone || member.whatsapp_phone).replace(/[^\d+]/g, '')}`} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-white hover:bg-white/5" style={{ border: '1px solid #1E1E2E' }}><Phone className="w-4 h-4" />Ara</a>}
            {member.email && <a href={`mailto:${member.email}`} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-white hover:bg-white/5" style={{ border: '1px solid #1E1E2E' }}><Mail className="w-4 h-4" />E-posta</a>}
          </div>
        </div>

        {lead && (
          <div className="grid sm:grid-cols-3 gap-3">
            <label className="block"><span className="text-xs text-[#9A9AAA]">Aşama</span>
              <select value={state.stage} onChange={(e) => saveState({ stage: e.target.value })} className={`${input} mt-1`} style={inner}>
                {STAGES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
              </select>
            </label>
            <label className="block"><span className="text-xs text-[#9A9AAA]">Şu tarihte tekrar ara</span>
              <input type="date" value={state.follow_up_at || ''} onChange={(e) => saveState({ follow_up_at: e.target.value })} className={`${input} mt-1`} style={{ ...inner, colorScheme: 'dark' }} />
            </label>
            <label className="block"><span className="text-xs text-[#9A9AAA]">Hatırlatma notu</span>
              <input value={state.follow_up_note || ''} onChange={(e) => setState((s) => ({ ...s, follow_up_note: e.target.value }))} onBlur={() => saveState({})} placeholder="Örn. bütçeyi netleştir" className={`${input} mt-1`} style={inner} />
            </label>
          </div>
        )}

        <div className="rounded-lg p-4" style={inner}>
          <p className="flex items-center gap-2 text-sm font-medium text-white mb-2"><Compass className="w-4 h-4 text-[#C9A84C]" />Nereden geldi?</p>
          {member.channel ? (
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-[#9A9AAA]">
              <span>Kanal: <b style={{ color: CHANNEL_COLOR(member.channel) }}>{channelLabel(member.channel)}</b></span>
              {a.camp && <span>Kampanya: <b className="text-white">{a.camp}</b></span>}
              {a.cnt && <span>İçerik: <b className="text-white">{a.cnt}</b></span>}
              {a.ref && <span>Site: <b className="text-white">{a.ref}</b></span>}
              {a.lp && <span>İlk sayfa: <b className="text-white">{a.lp}</b></span>}
              {a.at && <span>İlk ziyaret: <b className="text-white">{fmt(a.at)}</b></span>}
            </div>
          ) : <p className="text-sm text-[#9A9AAA]">Kaynak bilgisi yok (bu özellikten önce kaydolmuş ya da farklı bir cihazdan onaylamış olabilir).{member.source === 'consultation_form' ? ' Kayıt: danışmanlık formu.' : ''}</p>}
        </div>

        {appts.length > 0 && (
          <div>
            <p className="flex items-center gap-2 text-sm font-medium text-white mb-2"><CalendarClock className="w-4 h-4 text-[#C9A84C]" />Görüşmeler</p>
            <ul className="space-y-1 text-sm text-[#9A9AAA]">
              {appts.map((x) => <li key={x.id}>{fmt(x.starts_at)} · {x.channel === 'whatsapp' ? 'WhatsApp' : x.channel === 'phone' ? 'Telefon' : 'Google Meet'}{x.topic ? ` · ${x.topic}` : ''} · <span className="text-white">{{ booked: 'Planlandı', cancelled: 'İptal', done: 'Yapıldı', no_show: 'Gelmedi' }[x.status]}</span></li>)}
            </ul>
          </div>
        )}
        {err && <p className="text-sm text-red-400">{err}</p>}
      </section>

      <div className="grid lg:grid-cols-2 gap-6">
        <section className="rounded-xl p-5" style={card}>
          <h2 className="flex items-center gap-2 text-base font-semibold text-white mb-1"><StickyNote className="w-4 h-4 text-[#C9A84C]" />Notlar</h2>
          <p className="text-xs text-[#6A6A7A] mb-3">Yalnız adminler görür; üyeye gösterilmez.</p>
          <textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} rows={2} placeholder="Not ekleyin…" className={input} style={inner} />
          <button onClick={addNote} disabled={busy === 'note' || !noteText.trim()} className="mt-2 rounded-lg px-4 py-2 text-sm font-medium bg-[#C9A84C] text-[#0B0B11] disabled:opacity-50">Notu kaydet</button>
          <ul className="mt-4 space-y-2">
            {notes.map((n) => (
              <li key={n.id} className="rounded-lg p-3" style={{ ...inner, ...(n.is_pinned ? { borderColor: '#C9A84C66' } : {}) }}>
                <p className="text-sm text-white whitespace-pre-wrap break-words">{n.content}</p>
                <div className="mt-2 flex items-center justify-between text-xs text-[#6A6A7A]">
                  <span>{fmt(n.created_at)}</span>
                  <span className="flex gap-1">
                    <button onClick={() => run('pin', () => supabase.from('internal_notes').update({ is_pinned: !n.is_pinned }).eq('id', n.id))} title={n.is_pinned ? 'Sabitlemeyi kaldır' : 'Üste sabitle'} aria-label={n.is_pinned ? 'Sabitlemeyi kaldır' : 'Üste sabitle'} className={`p-1.5 rounded hover:bg-white/10 ${n.is_pinned ? 'text-[#C9A84C]' : ''}`}><Pin className="w-3.5 h-3.5" /></button>
                    <button onClick={() => window.confirm('Not silinsin mi?') && run('del', () => supabase.from('internal_notes').delete().eq('id', n.id))} title="Notu sil" aria-label="Notu sil" className="p-1.5 rounded hover:bg-red-500/10 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                  </span>
                </div>
              </li>
            ))}
            {notes.length === 0 && <li className="text-sm text-[#9A9AAA]">Henüz not yok.</li>}
          </ul>
        </section>

        <section className="rounded-xl p-5" style={card}>
          <h2 className="flex items-center gap-2 text-base font-semibold text-white mb-1"><MessagesSquare className="w-4 h-4 text-[#C9A84C]" />İletişim geçmişi</h2>
          <p className="text-xs text-[#6A6A7A] mb-3">Her arama ve mesajı buraya yazın. “Biz aradık” kaydı, dönüş bekleyenler listesinden çıkarır.</p>
          <div className="grid grid-cols-2 gap-2">
            <select value={entry.channel} onChange={(e) => setEntry({ ...entry, channel: e.target.value })} className={input} style={inner} aria-label="Kanal">
              {COMM_CHANNELS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
            </select>
            <select value={entry.direction} onChange={(e) => setEntry({ ...entry, direction: e.target.value })} className={input} style={inner} aria-label="Yön">
              <option value="outbound">Biz aradık / yazdık</option>
              <option value="inbound">Üye aradı / yazdı</option>
            </select>
            <input type="datetime-local" value={entry.contact_date} onChange={(e) => setEntry({ ...entry, contact_date: e.target.value })} className={`${input} col-span-2`} style={{ ...inner, colorScheme: 'dark' }} aria-label="Tarih" />
            <textarea value={entry.summary} onChange={(e) => setEntry({ ...entry, summary: e.target.value })} rows={2} placeholder="Ne konuşuldu?" className={`${input} col-span-2`} style={inner} />
          </div>
          <button onClick={addEntry} disabled={busy === 'log' || !entry.summary.trim()} className="mt-2 rounded-lg px-4 py-2 text-sm font-medium bg-[#C9A84C] text-[#0B0B11] disabled:opacity-50">Kaydı ekle</button>
          <ul className="mt-4 space-y-2">
            {log.map((c) => (
              <li key={c.id} className="rounded-lg p-3 flex gap-3" style={inner}>
                {c.direction === 'outbound' ? <ArrowUpRight className="w-4 h-4 mt-0.5 text-[#C9A84C] shrink-0" aria-label="Biz" /> : <ArrowDownLeft className="w-4 h-4 mt-0.5 text-[#3B82F6] shrink-0" aria-label="Üye" />}
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-white whitespace-pre-wrap break-words">{c.summary}</p>
                  <p className="mt-1 text-xs text-[#6A6A7A]">{(COMM_CHANNELS.find(([k]) => k === c.channel) || [, c.channel])[1]} · {fmt(c.contact_date)}</p>
                </div>
                <button onClick={() => window.confirm('Kayıt silinsin mi?') && run('del', () => supabase.from('communication_log').delete().eq('id', c.id))} title="Kaydı sil" aria-label="Kaydı sil" className="self-start p-1.5 rounded text-[#6A6A7A] hover:bg-red-500/10 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
              </li>
            ))}
            {log.length === 0 && <li className="text-sm text-[#9A9AAA]">Henüz kayıt yok.</li>}
          </ul>
        </section>
      </div>
    </>
  );
}
