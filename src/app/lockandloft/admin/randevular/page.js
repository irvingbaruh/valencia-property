'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import AdminLayout, { ADMIN_BASE } from '@/components/admin/AdminLayout';
import { CalendarClock, Video, Check, X, Save, UserX, ExternalLink } from 'lucide-react';

const card = { background: '#151521', border: '1px solid #1E1E2E' };
const inner = { background: '#0B0B11', border: '1px solid #1E1E2E' };
const input = 'w-full rounded-lg px-3 py-2 text-sm text-white placeholder:text-[#6A6A7A] outline-none focus:ring-2 focus:ring-[#C9A84C]/50';
const DAYS = [[1, 'Pzt'], [2, 'Sal'], [3, 'Çar'], [4, 'Per'], [5, 'Cum'], [6, 'Cmt'], [7, 'Paz']];
const STATUS = { booked: ['Planlandı', '#C9A84C'], done: ['Yapıldı', '#22C55E'], cancelled: ['İptal', '#9A9AAA'], no_show: ['Gelmedi', '#F87171'] };
const CH = { meet: 'Google Meet', whatsapp: 'WhatsApp görüntülü', phone: 'Telefon' };
const DEFAULTS = { enabled: true, days: [1, 2, 3, 4, 5], start: '10:00', end: '18:00', slot: 30, notice_h: 24, max_days: 21 };
const fmt = (d) => new Date(d).toLocaleString('tr-TR', { timeZone: 'Europe/Madrid', weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
const digits = (v) => String(v || '').replace(/\D/g, '');

function Row({ a, who, defaultUrl, onChanged }) {
  const [url, setUrl] = useState(a.meeting_url || '');
  const [note, setNote] = useState(a.admin_note || '');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const st = STATUS[a.status] || STATUS.booked;
  const past = new Date(a.starts_at).getTime() < Date.now();
  const update = async (patch) => {
    setBusy(true);
    setErr('');
    const { error } = await supabase.from('appointments').update(patch).eq('id', a.id);
    setBusy(false);
    if (error) setErr('Kaydedilemedi.'); else onChanged();
  };
  const saveLink = () => {
    const v = url.trim();
    if (v && !/^https:\/\//.test(v)) { setErr('Bağlantı https:// ile başlamalı.'); return; }
    update({ meeting_url: v || null, admin_note: note.trim() || null });
  };
  const wa = digits(who?.whatsapp_phone || who?.phone);

  return (
    <li className="rounded-xl p-4 space-y-3" style={inner}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-white font-semibold">{fmt(a.starts_at)} <span className="text-xs font-normal text-[#6A6A7A]">İspanya saati · {a.duration_min} dk</span></p>
          <p className="text-sm text-[#9A9AAA] mt-0.5">
            <Link href={`${ADMIN_BASE}/uyeler/detay/?id=${a.user_id}`} className="text-white hover:text-[#C9A84C] underline-offset-2 hover:underline">{who?.full_name || who?.email || 'Üye'}</Link>
            {who?.email ? ` · ${who.email}` : ''} · {CH[a.channel] || a.channel}{a.lang ? ` · ${a.lang.toUpperCase()}` : ''}
          </p>
          {a.topic && <p className="text-sm text-white mt-1">{a.topic}</p>}
          {a.note && <p className="text-sm text-[#9A9AAA] mt-1 whitespace-pre-wrap">“{a.note}”</p>}
        </div>
        <span className="text-xs font-medium px-2.5 py-1 rounded-full shrink-0" style={{ background: `${st[1]}20`, color: st[1] }}>{st[0]}{a.status === 'cancelled' && a.cancelled_by === 'member' ? ' (üye)' : ''}</span>
      </div>

      {a.status === 'booked' && (
        <>
          {a.channel === 'meet' && (
            <div className="flex flex-col sm:flex-row gap-2">
              <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Görüşme bağlantısı (https://meet.google.com/…)" className={input} style={card} aria-label="Görüşme bağlantısı" />
              {!url && defaultUrl && <button onClick={() => setUrl(defaultUrl)} className="shrink-0 rounded-lg px-3 py-2 text-sm text-[#C9A84C] hover:bg-white/5" style={{ border: '1px solid #1E1E2E' }}>Varsayılanı kullan</button>}
            </div>
          )}
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Kendinize not (üye görmez)" className={input} style={card} aria-label="Admin notu" />
          <div className="flex flex-wrap gap-2">
            <button onClick={saveLink} disabled={busy} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium bg-[#C9A84C] text-[#0B0B11] disabled:opacity-50"><Save className="w-4 h-4" />{a.channel === 'meet' ? 'Kaydet ve üyeye bildir' : 'Kaydet'}</button>
            {a.meeting_url && <a href={a.meeting_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-white hover:bg-white/5" style={{ border: '1px solid #1E1E2E' }}><Video className="w-4 h-4" />Görüşmeyi aç</a>}
            {wa && <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-white hover:bg-white/5" style={{ border: '1px solid #1E1E2E' }}><ExternalLink className="w-4 h-4" />WhatsApp</a>}
            {past && <button onClick={() => update({ status: 'done' })} disabled={busy} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-[#22C55E] hover:bg-[#22C55E]/10" style={{ border: '1px solid #1E1E2E' }}><Check className="w-4 h-4" />Yapıldı</button>}
            {past && <button onClick={() => update({ status: 'no_show' })} disabled={busy} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-[#F87171] hover:bg-[#F87171]/10" style={{ border: '1px solid #1E1E2E' }}><UserX className="w-4 h-4" />Gelmedi</button>}
            {!past && <button onClick={() => window.confirm('Randevu iptal edilsin mi? Üyeye bildirim gider.') && update({ status: 'cancelled' })} disabled={busy} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-[#9A9AAA] hover:text-red-400 hover:bg-red-500/10" style={{ border: '1px solid #1E1E2E' }}><X className="w-4 h-4" />İptal et</button>}
          </div>
        </>
      )}
      {err && <p className="text-sm text-red-400">{err}</p>}
    </li>
  );
}

export default function AdminAppointmentsPage() {
  const [rows, setRows] = useState(null);
  const [people, setPeople] = useState({});
  const [cfg, setCfg] = useState(DEFAULTS);
  const [priv, setPriv] = useState({ meet_url: '' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [tab, setTab] = useState('upcoming');

  const load = useCallback(async () => {
    const [a, s] = await Promise.all([
      supabase.from('appointments').select('*').order('starts_at', { ascending: false }).limit(200),
      supabase.from('site_settings').select('key, value').in('key', ['booking', 'booking_private']),
    ]);
    const list = a.data || [];
    setRows(list);
    const byKey = Object.fromEntries((s.data || []).map((r) => [r.key, r.value]));
    if (byKey.booking) setCfg({ ...DEFAULTS, ...byKey.booking });
    if (byKey.booking_private) setPriv({ meet_url: byKey.booking_private.meet_url || '' });
    const ids = [...new Set(list.map((r) => r.user_id))];
    if (ids.length) {
      const { data: p } = await supabase.from('profiles_with_email').select('id, full_name, email, phone, whatsapp_phone').in('id', ids);
      setPeople(Object.fromEntries((p || []).map((x) => [x.id, x])));
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  const saveCfg = async () => {
    setMsg('');
    if (!cfg.days.length) { setMsg('En az bir gün seçin.'); return; }
    if (cfg.start >= cfg.end) { setMsg('Bitiş saati başlangıçtan sonra olmalı.'); return; }
    if (priv.meet_url && !/^https:\/\//.test(priv.meet_url)) { setMsg('Varsayılan bağlantı https:// ile başlamalı.'); return; }
    setSaving(true);
    const now = new Date().toISOString();
    const clean = { enabled: !!cfg.enabled, days: [...cfg.days].sort(), start: cfg.start, end: cfg.end, slot: Number(cfg.slot) || 30, notice_h: Number(cfg.notice_h) || 0, max_days: Number(cfg.max_days) || 21 };
    const r1 = await supabase.from('site_settings').upsert({ key: 'booking', value: clean, is_public: true, updated_at: now });
    const r2 = await supabase.from('site_settings').upsert({ key: 'booking_private', value: { meet_url: priv.meet_url.trim() }, is_public: false, updated_at: now });
    setSaving(false);
    setMsg(r1.error || r2.error ? 'Kaydedilemedi.' : 'Kaydedildi.');
  };
  const toggleDay = (d) => setCfg((c) => ({ ...c, days: c.days.includes(d) ? c.days.filter((x) => x !== d) : [...c.days, d] }));

  const now = Date.now();
  const upcoming = (rows || []).filter((r) => r.status === 'booked' && new Date(r.starts_at).getTime() > now - 2 * 3600e3).reverse();
  const older = (rows || []).filter((r) => !upcoming.includes(r));
  const shown = tab === 'upcoming' ? upcoming : older;

  return (
    <AdminLayout activeSection="randevular">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>Randevular</h1>
          <p className="text-sm text-[#9A9AAA] mt-1">Üyelerin panelden aldığı görüntülü ön görüşmeler. Yeni randevuda ve görüşmeden 1 saat önce telefonunuza bildirim gelir.</p>
        </div>

        <section className="rounded-xl p-5 space-y-4" style={card}>
          <div className="flex gap-2">
            {[['upcoming', `Yaklaşan (${upcoming.length})`], ['older', `Geçmiş ve iptal (${older.length})`]].map(([k, l]) => (
              <button key={k} onClick={() => setTab(k)} className="px-4 py-2 rounded-lg text-sm font-medium" style={tab === k ? { background: 'rgba(201,168,76,0.15)', color: '#C9A84C' } : { border: '1px solid #1E1E2E', color: '#9A9AAA' }}>{l}</button>
            ))}
          </div>
          {rows === null ? <div className="h-24 rounded-xl animate-pulse" style={inner} />
            : shown.length === 0 ? <p className="text-sm text-[#9A9AAA] py-6 text-center"><CalendarClock className="w-8 h-8 mx-auto mb-2 text-[#6A6A7A]" />{tab === 'upcoming' ? 'Yaklaşan randevu yok.' : 'Kayıt yok.'}</p>
            : <ul className="space-y-3">{shown.map((a) => <Row key={a.id} a={a} who={people[a.user_id]} defaultUrl={priv.meet_url} onChanged={load} />)}</ul>}
        </section>

        <section className="rounded-xl p-5 space-y-4" style={card}>
          <h2 className="text-base font-semibold text-white">Uygun saatler</h2>
          <label className="flex items-center gap-3 text-sm text-white">
            <input type="checkbox" checked={!!cfg.enabled} onChange={(e) => setCfg({ ...cfg, enabled: e.target.checked })} className="w-4 h-4 accent-[#C9A84C]" />
            Çevrim içi randevu açık
          </label>
          <div>
            <p className="text-xs text-[#9A9AAA] mb-2">Günler</p>
            <div className="flex flex-wrap gap-2">
              {DAYS.map(([d, l]) => (
                <button key={d} onClick={() => toggleDay(d)} aria-pressed={cfg.days.includes(d)} className="px-3 py-2 rounded-lg text-sm" style={cfg.days.includes(d) ? { background: 'rgba(201,168,76,0.15)', color: '#C9A84C' } : { border: '1px solid #1E1E2E', color: '#9A9AAA' }}>{l}</button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <label className="block"><span className="text-xs text-[#9A9AAA]">Başlangıç</span><input type="time" value={cfg.start} onChange={(e) => setCfg({ ...cfg, start: e.target.value })} className={`${input} mt-1`} style={{ ...inner, colorScheme: 'dark' }} /></label>
            <label className="block"><span className="text-xs text-[#9A9AAA]">Bitiş</span><input type="time" value={cfg.end} onChange={(e) => setCfg({ ...cfg, end: e.target.value })} className={`${input} mt-1`} style={{ ...inner, colorScheme: 'dark' }} /></label>
            <label className="block"><span className="text-xs text-[#9A9AAA]">Görüşme süresi</span>
              <select value={cfg.slot} onChange={(e) => setCfg({ ...cfg, slot: Number(e.target.value) })} className={`${input} mt-1`} style={inner}>{[15, 20, 30, 45, 60].map((n) => <option key={n} value={n}>{n} dk</option>)}</select></label>
            <label className="block"><span className="text-xs text-[#9A9AAA]">En erken (saat sonra)</span><input type="number" min="0" max="168" value={cfg.notice_h} onChange={(e) => setCfg({ ...cfg, notice_h: e.target.value })} className={`${input} mt-1`} style={inner} /></label>
            <label className="block"><span className="text-xs text-[#9A9AAA]">En geç (gün sonra)</span><input type="number" min="1" max="90" value={cfg.max_days} onChange={(e) => setCfg({ ...cfg, max_days: e.target.value })} className={`${input} mt-1`} style={inner} /></label>
          </div>
          <label className="block"><span className="text-xs text-[#9A9AAA]">Varsayılan Google Meet bağlantınız (yalnız siz görürsünüz; randevuya tek tıkla eklenir)</span>
            <input value={priv.meet_url} onChange={(e) => setPriv({ meet_url: e.target.value })} placeholder="https://meet.google.com/…" className={`${input} mt-1`} style={inner} /></label>
          <p className="text-xs text-[#6A6A7A]">Saatler İspanya saatiyledir; üye kendi saatini de görür. Dolu saatler başkasına gösterilmez. Tatil günleri için o günü geçici olarak kapatabilir ya da kendi adınıza bir randevu açtırabilirsiniz.</p>
          <div className="flex items-center gap-3">
            <button onClick={saveCfg} disabled={saving} className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium bg-[#C9A84C] text-[#0B0B11] disabled:opacity-50"><Save className="w-4 h-4" />Kaydet</button>
            {msg && <span className="text-sm text-[#9A9AAA]" role="status">{msg}</span>}
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}
