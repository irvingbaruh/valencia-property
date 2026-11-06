'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import AdminLayout from '@/components/admin/AdminLayout';
import { Plus, Edit3, Trash2, Eye, EyeOff, X, Save, ExternalLink, ImagePlus } from 'lucide-react';

const LANGS = [
  { k: 'tr', label: 'Türkçe' }, { k: 'es', label: 'İspanyolca' }, { k: 'en', label: 'İngilizce' }, { k: 'de', label: 'Almanca' },
];
const TOPICS = [['realestate', 'Gayrimenkul'], ['economy', 'Ekonomi'], ['rates', 'Faiz'], ['legal', 'Hukuk']];
const EMPTY = {
  title_tr: '', title_es: '', title_en: '', title_de: '', summary_tr: '', summary_es: '', summary_en: '', summary_de: '',
  topic: 'realestate', source_name: '', source_url: '', data_date: '', status: 'draft', image_url: '',
};

async function shrink(file) {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
  const c = document.createElement('canvas');
  c.width = Math.round(bmp.width * scale);
  c.height = Math.round(bmp.height * scale);
  c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
  return new Promise((res) => c.toBlob(res, 'image/jpeg', 0.85));
}
const inputCls = 'w-full bg-[#0B0B11] border border-[#2A2A3A] rounded-lg px-3 py-2 text-sm text-white placeholder:text-[#6A6A7A] focus:border-[#C9A84C] focus:outline-none';
const labelCls = 'text-xs text-[#9A9AAA] mb-1.5 block';

function Editor({ row, onClose, onSaved }) {
  const [f, setF] = useState(() => (row ? { ...EMPTY, ...Object.fromEntries(Object.entries(row).map(([k, v]) => [k, v ?? ''])) } : EMPTY));
  const [lang, setLang] = useState('tr');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [up, setUp] = useState(false);
  const upload = async (file) => {
    if (!file) return;
    setUp(true); setErr('');
    try {
      const blob = await shrink(file);
      const path = `notes/${crypto.randomUUID()}.jpg`;
      const { error } = await supabase.storage.from('properties').upload(path, blob, { contentType: 'image/jpeg' });
      if (error) throw error;
      set('image_url', supabase.storage.from('properties').getPublicUrl(path).data.publicUrl);
    } catch (e) { setErr(e.message || 'Yükleme başarısız'); }
    setUp(false);
  };
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));

  const save = async (status) => {
    if (!f.title_tr.trim() || !f.summary_tr.trim()) { setErr('Türkçe başlık ve özet zorunlu.'); return; }
    if (status === 'published') {
      const missing = LANGS.filter((l) => !f[`title_${l.k}`].trim() || !f[`summary_${l.k}`].trim()).map((l) => l.label);
      if (missing.length && !confirm(`Eksik diller: ${missing.join(', ')}. Bu dillerde Türkçe/İngilizce metin gösterilir. Yine de yayınlansın mı?`)) return;
      if (!f.source_url.trim() && !confirm('Kaynak linki yok. Yine de yayınlansın mı?')) return;
    }
    setBusy(true); setErr('');
    const payload = {
      title_tr: f.title_tr, title_es: f.title_es, title_en: f.title_en, title_de: f.title_de,
      summary_tr: f.summary_tr, summary_es: f.summary_es, summary_en: f.summary_en, summary_de: f.summary_de,
      image_url: f.image_url || '', topic: f.topic, source_name: f.source_name, source_url: f.source_url, data_date: f.data_date || null, status,
    };
    const q = row ? supabase.from('market_notes').update(payload).eq('id', row.id) : supabase.from('market_notes').insert(payload);
    const { error } = await q;
    setBusy(false);
    if (error) setErr(error.message); else onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 backdrop-blur-sm overflow-y-auto p-4">
      <div className="bg-[#151521] border border-[#2A2A3A] rounded-2xl w-full max-w-2xl my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2A2A3A]">
          <h2 className="text-white font-semibold">{row ? 'Notu düzenle' : 'Yeni not'}</h2>
          <button onClick={onClose} className="text-[#9A9AAA] hover:text-white"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-5">
          <div className="flex gap-1 border-b border-[#2A2A3A]">
            {LANGS.map((l) => (
              <button key={l.k} onClick={() => setLang(l.k)}
                className={`px-3 py-2 text-sm -mb-px border-b-2 ${lang === l.k ? 'border-[#C9A84C] text-white' : 'border-transparent text-[#9A9AAA]'}`}>
                {l.label}{f[`title_${l.k}`] && f[`summary_${l.k}`] ? ' ✓' : ''}
              </button>
            ))}
          </div>
          <div>
            <label className={labelCls}>Başlık ({lang.toUpperCase()})</label>
            <input className={inputCls} value={f[`title_${lang}`]} onChange={(e) => set(`title_${lang}`, e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Özet ({lang.toUpperCase()}) — kısa, 2-4 cümle</label>
            <textarea rows={6} className={inputCls} value={f[`summary_${lang}`]} onChange={(e) => set(`summary_${lang}`, e.target.value)} />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Konu</label>
              <select className={inputCls} value={f.topic} onChange={(e) => set('topic', e.target.value)}>
                {TOPICS.map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Veri tarihi</label>
              <input type="date" className={inputCls} value={f.data_date} onChange={(e) => set('data_date', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Kaynak adı</label>
              <input className={inputCls} value={f.source_name} onChange={(e) => set('source_name', e.target.value)} placeholder="INE, Banco de España…" />
            </div>
            <div>
              <label className={labelCls}>Kaynak linki</label>
              <input className={inputCls} value={f.source_url} onChange={(e) => set('source_url', e.target.value)} placeholder="https://…" />
            </div>
          </div>
          <div>
            <label className={labelCls}>Görsel (boş bırakırsan konuya uygun hazır görsel kullanılır)</label>
            <div className="flex items-center gap-3">
              {f.image_url && <img src={f.image_url} alt="" className="w-24 h-16 object-cover rounded-lg" />}
              <label className="inline-flex items-center gap-2 px-3 py-2 bg-[#1E1E2E] text-white rounded-lg text-sm cursor-pointer">
                <ImagePlus size={15} /> {up ? 'Yükleniyor…' : f.image_url ? 'Değiştir' : 'Görsel yükle'}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => upload(e.target.files?.[0])} />
              </label>
              {f.image_url && <button onClick={() => set('image_url', '')} className="text-xs text-[#9A9AAA] hover:text-white">Kaldır</button>}
            </div>
          </div>
          {err && <div className="text-sm text-[#DC1C2E]">{err}</div>}
        </div>
        <div className="flex flex-wrap justify-end gap-3 px-6 py-4 border-t border-[#2A2A3A]">
          <button onClick={onClose} className="px-4 py-2 text-sm text-[#9A9AAA] hover:text-white">İptal</button>
          <button disabled={busy} onClick={() => save('draft')} className="inline-flex items-center gap-2 px-4 py-2 bg-[#1E1E2E] text-white rounded-lg text-sm"><Save size={15} /> Taslak kaydet</button>
          <button disabled={busy} onClick={() => save('published')} className="inline-flex items-center gap-2 px-4 py-2 bg-[#C9A84C] text-black rounded-lg text-sm font-semibold"><Eye size={15} /> Yayınla</button>
        </div>
      </div>
    </div>
  );
}

export default function AdminPiyasaPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('all');
  const [editor, setEditor] = useState(undefined);
  const [del, setDel] = useState(null);
  const [msg, setMsg] = useState('');

  const load = useCallback(async () => {
    const { data } = await supabase.from('market_notes').select('*').order('created_at', { ascending: false });
    setRows(data || []);
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);
  const flash = (m) => { setMsg(m); setTimeout(() => setMsg(''), 4000); };

  const toggle = async (r) => {
    const next = r.status === 'published' ? 'draft' : 'published';
    const { error } = await supabase.from('market_notes').update({ status: next }).eq('id', r.id);
    if (error) flash(error.message); else load();
  };
  const remove = async (r) => {
    const { error } = await supabase.from('market_notes').delete().eq('id', r.id);
    setDel(null);
    if (error) flash(error.message); else setRows((rs) => rs.filter((x) => x.id !== r.id));
  };
  const list = useMemo(() => rows.filter((r) => status === 'all' || r.status === status), [rows, status]);

  return (
    <AdminLayout activeSection="piyasa">
      <div className="p-6 lg:p-8 max-w-5xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-white">Piyasa Notları</h1>
            <p className="text-sm text-[#9A9AAA] mt-1">{rows.filter((r) => r.status === 'published').length} yayında · {rows.filter((r) => r.status === 'draft').length} taslak</p>
          </div>
          <button onClick={() => setEditor(null)} className="inline-flex items-center gap-2 px-4 py-2 bg-[#C9A84C] text-black rounded-lg text-sm font-semibold"><Plus size={16} /> Yeni not</button>
        </div>
        <div className="mb-5">
          <select className={inputCls + ' !w-auto'} value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">Tümü</option><option value="draft">Taslak</option><option value="published">Yayında</option>
          </select>
        </div>
        {msg && <div className="mb-4 px-4 py-2.5 rounded-lg bg-[#C9A84C]/15 text-[#C9A84C] text-sm">{msg}</div>}
        {loading ? <div className="py-20 text-center text-[#9A9AAA]">Yükleniyor…</div> : list.length === 0 ? (
          <div className="py-20 text-center text-[#9A9AAA]">Not yok.</div>
        ) : (
          <div className="space-y-3">
            {list.map((r) => {
              const done = LANGS.filter((l) => r[`title_${l.k}`] && r[`summary_${l.k}`]).length;
              return (
                <div key={r.id} className="flex items-center gap-4 p-4 rounded-xl border border-[#2A2A3A] bg-[#151521]">
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-medium truncate">{r.title_tr}</div>
                    <div className="text-xs text-[#9A9AAA] mt-1 truncate">
                      {TOPICS.find(([k]) => k === r.topic)?.[1]} · {r.source_name || 'kaynak yok'} · veri: {r.data_date || '—'} · diller {done}/4
                    </div>
                  </div>
                  {r.source_url && <a href={r.source_url} target="_blank" rel="noopener noreferrer" title="Kaynağı aç" className="text-[#6A6A7A] hover:text-white"><ExternalLink size={16} /></a>}
                  <button onClick={() => toggle(r)} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${r.status === 'published' ? 'bg-[#22C55E]/15 text-[#22C55E]' : 'bg-[#1E1E2E] text-[#9A9AAA]'}`}>
                    {r.status === 'published' ? <Eye size={14} /> : <EyeOff size={14} />} {r.status === 'published' ? 'Yayında' : 'Taslak'}
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
            <h3 className="text-white font-semibold mb-2">Notu sil</h3>
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
