'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import AdminLayout from '@/components/admin/AdminLayout';
import { Plus, Edit3, Trash2, Eye, EyeOff, X, Save } from 'lucide-react';

const LANGS = [{ k: 'tr', label: 'Türkçe' }, { k: 'es', label: 'İspanyolca' }, { k: 'en', label: 'İngilizce' }, { k: 'de', label: 'Almanca' }];
const CITIES = [['both', 'Valencia + Alicante'], ['valencia', 'Valencia'], ['alicante', 'Alicante']];
const MONTHS = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
const EMPTY = {
  city: 'both', mode: 'recurring', recurring_month: 1, start_date: '', end_date: '',
  title_tr: '', title_es: '', title_en: '', title_de: '', summary_tr: '', summary_es: '', summary_en: '', summary_de: '',
  date_label_tr: '', date_label_es: '', date_label_en: '', date_label_de: '', source_name: '', source_url: '', status: 'published',
};
const inputCls = 'w-full bg-[#0B0B11] border border-[#2A2A3A] rounded-lg px-3 py-2 text-sm text-white placeholder:text-[#6A6A7A] focus:border-[#C9A84C] focus:outline-none';
const labelCls = 'text-xs text-[#9A9AAA] mb-1.5 block';

function Editor({ row, onClose, onSaved }) {
  const [f, setF] = useState(() => (row
    ? { ...EMPTY, ...Object.fromEntries(Object.entries(row).map(([k, v]) => [k, v ?? ''])), mode: row.recurring_month ? 'recurring' : 'dated', recurring_month: row.recurring_month || 1 }
    : EMPTY));
  const [lang, setLang] = useState('tr');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));

  const save = async (status) => {
    if (!f.title_tr.trim() || !f.summary_tr.trim()) { setErr('Türkçe başlık ve özet zorunlu.'); return; }
    if (f.mode === 'dated' && !f.start_date) { setErr('Başlangıç tarihi seçin.'); return; }
    if (status === 'published') {
      const missing = LANGS.filter((l) => !f[`title_${l.k}`].trim() || !f[`summary_${l.k}`].trim()).map((l) => l.label);
      if (missing.length && !confirm(`Eksik diller: ${missing.join(', ')}. Bu dillerde Türkçe/İngilizce metin gösterilir. Yine de yayınlansın mı?`)) return;
    }
    setBusy(true); setErr('');
    const payload = {
      city: f.city,
      recurring_month: f.mode === 'recurring' ? Number(f.recurring_month) : null,
      start_date: f.mode === 'dated' ? f.start_date : null,
      end_date: f.mode === 'dated' && f.end_date ? f.end_date : null,
      status, source_name: f.source_name, source_url: f.source_url,
    };
    for (const l of LANGS) for (const b of ['title', 'summary', 'date_label']) payload[`${b}_${l.k}`] = f[`${b}_${l.k}`];
    if (!row) payload.origin = 'manual';
    const q = row ? supabase.from('city_events').update(payload).eq('id', row.id) : supabase.from('city_events').insert(payload);
    const { error } = await q;
    setBusy(false);
    if (error) setErr(error.message); else onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 backdrop-blur-sm overflow-y-auto p-4">
      <div className="bg-[#151521] border border-[#2A2A3A] rounded-2xl w-full max-w-2xl my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2A2A3A]">
          <h2 className="text-white font-semibold">{row ? 'Etkinliği düzenle' : 'Yeni etkinlik'}</h2>
          <button onClick={onClose} className="text-[#9A9AAA] hover:text-white"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Şehir</label>
              <select className={inputCls} value={f.city} onChange={(e) => set('city', e.target.value)}>{CITIES.map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
            </div>
            <div>
              <label className={labelCls}>Zamanlama</label>
              <select className={inputCls} value={f.mode} onChange={(e) => set('mode', e.target.value)}>
                <option value="recurring">Her yıl aynı ay</option><option value="dated">Belirli tarih</option>
              </select>
            </div>
            {f.mode === 'recurring' ? (
              <div>
                <label className={labelCls}>Ay</label>
                <select className={inputCls} value={f.recurring_month} onChange={(e) => set('recurring_month', e.target.value)}>{MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}</select>
              </div>
            ) : (
              <>
                <div><label className={labelCls}>Başlangıç</label><input type="date" className={inputCls} value={f.start_date} onChange={(e) => set('start_date', e.target.value)} /></div>
                <div><label className={labelCls}>Bitiş (tek gün ise boş)</label><input type="date" className={inputCls} value={f.end_date} onChange={(e) => set('end_date', e.target.value)} /></div>
              </>
            )}
          </div>
          <div className="flex gap-1 border-b border-[#2A2A3A]">
            {LANGS.map((l) => (
              <button key={l.k} onClick={() => setLang(l.k)}
                className={`px-3 py-2 text-sm -mb-px border-b-2 ${lang === l.k ? 'border-[#C9A84C] text-white' : 'border-transparent text-[#9A9AAA]'}`}>
                {l.label}{f[`title_${l.k}`] && f[`summary_${l.k}`] ? ' ✓' : ''}
              </button>
            ))}
          </div>
          <div><label className={labelCls}>Başlık ({lang.toUpperCase()})</label><input className={inputCls} value={f[`title_${lang}`]} onChange={(e) => set(`title_${lang}`, e.target.value)} /></div>
          <div><label className={labelCls}>Tarih yazısı ({lang.toUpperCase()}) — örn. “20-24 Haziran”</label><input className={inputCls} value={f[`date_label_${lang}`]} onChange={(e) => set(`date_label_${lang}`, e.target.value)} /></div>
          <div><label className={labelCls}>Özet ({lang.toUpperCase()}) — 1-3 cümle</label><textarea rows={4} className={inputCls} value={f[`summary_${lang}`]} onChange={(e) => set(`summary_${lang}`, e.target.value)} /></div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className={labelCls}>Kaynak adı</label><input className={inputCls} value={f.source_name} onChange={(e) => set('source_name', e.target.value)} placeholder="Ajuntament de València…" /></div>
            <div><label className={labelCls}>Kaynak linki</label><input className={inputCls} value={f.source_url} onChange={(e) => set('source_url', e.target.value)} placeholder="https://…" /></div>
          </div>
          {err && <div className="text-sm text-[#DC1C2E]">{err}</div>}
        </div>
        <div className="flex flex-wrap justify-end gap-3 px-6 py-4 border-t border-[#2A2A3A]">
          <button onClick={onClose} className="px-4 py-2 text-sm text-[#9A9AAA] hover:text-white">İptal</button>
          <button disabled={busy} onClick={() => save('hidden')} className="inline-flex items-center gap-2 px-4 py-2 bg-[#1E1E2E] text-white rounded-lg text-sm"><Save size={15} /> Gizli kaydet</button>
          <button disabled={busy} onClick={() => save('published')} className="inline-flex items-center gap-2 px-4 py-2 bg-[#C9A84C] text-black rounded-lg text-sm font-semibold"><Eye size={15} /> Yayınla</button>
        </div>
      </div>
    </div>
  );
}

function Schedule() {
  const [cfg, setCfg] = useState({ enabled: true, day: 1, hour: 9, push: true });
  const [msg, setMsg] = useState('');
  useEffect(() => {
    supabase.from('site_settings').select('value').eq('key', 'monthly_events').maybeSingle().then(({ data }) => { if (data?.value) setCfg((c) => ({ ...c, ...data.value })); });
  }, []);
  const save = async () => {
    const value = { enabled: !!cfg.enabled, push: !!cfg.push, day: Math.min(Math.max(Number(cfg.day) || 1, 1), 28), hour: Math.min(Math.max(Number(cfg.hour) || 0, 0), 23) };
    const { error } = await supabase.from('site_settings').upsert({ key: 'monthly_events', value, is_public: false, updated_at: new Date().toISOString() });
    setMsg(error ? error.message : 'Kaydedildi'); setTimeout(() => setMsg(''), 3000);
  };
  return (
    <div className="mb-6 p-4 rounded-xl border border-[#2A2A3A] bg-[#151521]">
      <div className="text-white font-medium mb-1">“Bu ay Valencia’da” bülteni</div>
      <p className="text-xs text-[#9A9AAA] mb-3">Her ayın seçili gününde, İspanya saatiyle seçili saatte; o aya denk gelen yayındaki etkinlikler e-posta ve (açıksa) bildirim olarak üyelere gider. Ay başına bir kez gönderilir.</p>
      <div className="flex flex-wrap items-end gap-4">
        <label className="flex items-center gap-2 text-sm text-white"><input type="checkbox" checked={!!cfg.enabled} onChange={(e) => setCfg({ ...cfg, enabled: e.target.checked })} /> Açık</label>
        <label className="flex items-center gap-2 text-sm text-white"><input type="checkbox" checked={cfg.push !== false} onChange={(e) => setCfg({ ...cfg, push: e.target.checked })} /> Bildirim de gönder</label>
        <div><span className={labelCls}>Ayın günü (1-28)</span><input type="number" min="1" max="28" className={inputCls + ' !w-24'} value={cfg.day} onChange={(e) => setCfg({ ...cfg, day: e.target.value })} /></div>
        <div><span className={labelCls}>Saat (0-23)</span><input type="number" min="0" max="23" className={inputCls + ' !w-24'} value={cfg.hour} onChange={(e) => setCfg({ ...cfg, hour: e.target.value })} /></div>
        <button onClick={save} className="px-4 py-2 bg-[#C9A84C] text-black rounded-lg text-sm font-semibold">Kaydet</button>
        {msg && <span className="text-sm text-[#C9A84C]">{msg}</span>}
      </div>
    </div>
  );
}

export default function AdminTakvimPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState('all');
  const [editor, setEditor] = useState(undefined);
  const [del, setDel] = useState(null);
  const [msg, setMsg] = useState('');

  const load = useCallback(async () => {
    const { data } = await supabase.from('city_events').select('*');
    setRows(data || []);
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);
  const flash = (m) => { setMsg(m); setTimeout(() => setMsg(''), 4000); };
  const monthOf = (r) => (r.recurring_month ? r.recurring_month : new Date(`${r.start_date}T12:00:00`).getMonth() + 1);

  const toggle = async (r) => {
    const next = r.status === 'published' ? 'hidden' : 'published';
    const { error } = await supabase.from('city_events').update({ status: next }).eq('id', r.id);
    if (error) flash(error.message); else load();
  };
  const remove = async (r) => {
    const { error } = await supabase.from('city_events').delete().eq('id', r.id);
    setDel(null);
    if (error) flash(error.message); else setRows((rs) => rs.filter((x) => x.id !== r.id));
  };
  const list = useMemo(() => rows.filter((r) => month === 'all' || monthOf(r) === Number(month)).sort((a, b) => monthOf(a) - monthOf(b) || (a.start_date || '').localeCompare(b.start_date || '')), [rows, month]);

  return (
    <AdminLayout activeSection="takvim">
      <div className="p-6 lg:p-8 max-w-5xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-white">Şehir Takvimi</h1>
            <p className="text-sm text-[#9A9AAA] mt-1">Üye rehberindeki takvim sayfası ve aylık bülten bu listeden beslenir. {rows.filter((r) => r.status === 'published').length} yayında · {rows.filter((r) => r.status !== 'published').length} gizli</p>
          </div>
          <button onClick={() => setEditor(null)} className="inline-flex items-center gap-2 px-4 py-2 bg-[#C9A84C] text-black rounded-lg text-sm font-semibold"><Plus size={16} /> Yeni etkinlik</button>
        </div>
        <Schedule />
        <div className="mb-5">
          <select className={inputCls + ' !w-auto'} value={month} onChange={(e) => setMonth(e.target.value)}>
            <option value="all">Tüm aylar</option>{MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
          </select>
        </div>
        {msg && <div className="mb-4 px-4 py-2.5 rounded-lg bg-[#C9A84C]/15 text-[#C9A84C] text-sm">{msg}</div>}
        {loading ? <div className="py-20 text-center text-[#9A9AAA]">Yükleniyor…</div> : list.length === 0 ? (
          <div className="py-20 text-center text-[#9A9AAA]">Etkinlik yok.</div>
        ) : (
          <div className="space-y-3">
            {list.map((r) => {
              const done = LANGS.filter((l) => r[`title_${l.k}`] && r[`summary_${l.k}`]).length;
              return (
                <div key={r.id} className="flex items-center gap-4 p-4 rounded-xl border border-[#2A2A3A] bg-[#151521]">
                  <div className="w-20 shrink-0 text-sm text-[#C9A84C]">{MONTHS[monthOf(r) - 1]}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-medium truncate">{r.title_tr}</div>
                    <div className="text-xs text-[#9A9AAA] mt-1 truncate">
                      {CITIES.find(([k]) => k === r.city)?.[1]} · {r.recurring_month ? 'her yıl' : `${r.start_date}${r.end_date ? ` → ${r.end_date}` : ''}`} · diller {done}/4
                    </div>
                  </div>
                  <button onClick={() => toggle(r)} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${r.status === 'published' ? 'bg-[#22C55E]/15 text-[#22C55E]' : 'bg-[#1E1E2E] text-[#9A9AAA]'}`}>
                    {r.status === 'published' ? <Eye size={14} /> : <EyeOff size={14} />} {r.status === 'published' ? 'Yayında' : 'Gizli'}
                  </button>
                  <button title="Düzenle" onClick={() => setEditor(r)} className="text-[#9A9AAA] hover:text-white"><Edit3 size={17} /></button>
                  <button title="Sil" onClick={() => setDel(r)} className="text-[#9A9AAA] hover:text-[#DC1C2E]"><Trash2 size={17} /></button>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {editor !== undefined && <Editor row={editor} onClose={() => setEditor(undefined)} onSaved={() => { setEditor(undefined); load(); }} />}
      {del && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-[#151521] border border-[#2A2A3A] rounded-2xl p-6 max-w-sm mx-4">
            <h3 className="text-white font-semibold mb-2">Etkinliği sil</h3>
            <p className="text-sm text-[#9A9AAA] mb-6">“{del.title_tr}” kalıcı olarak silinecek.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDel(null)} className="px-4 py-2 text-sm text-[#9A9AAA] hover:text-white">İptal</button>
              <button onClick={() => remove(del)} className="px-4 py-2 bg-[#DC1C2E] rounded-lg text-sm text-white font-medium">Sil</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
