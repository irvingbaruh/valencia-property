'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import AdminLayout from '@/components/admin/AdminLayout';
import {
  Search, Plus, Edit3, Trash2, Star, Eye, EyeOff, X, Save, ImagePlus, ChevronLeft, ChevronRight, ExternalLink, Loader2, Download, GripVertical,
} from 'lucide-react';
import {
  DndContext, closestCenter, PointerSensor, TouchSensor, KeyboardSensor, useSensor, useSensors,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove, useSortable, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const LANGS = [
  { k: 'tr', label: 'Türkçe' },
  { k: 'es', label: 'İspanyolca' },
  { k: 'en', label: 'İngilizce' },
  { k: 'de', label: 'Almanca' },
];
const TYPES = [
  ['apartment', 'Daire'], ['house', 'Müstakil ev'], ['villa', 'Villa'],
  ['land', 'Arsa'], ['commercial', 'Ticari'], ['other', 'Çok birimli / diğer'],
];
const EMPTY = {
  title_tr: '', title_es: '', title_en: '', title_de: '',
  description_tr: '', description_es: '', description_en: '', description_de: '',
  property_type: 'apartment', price: '', currency: 'EUR',
  bedrooms: '', bathrooms: '', area_sqm: '', land_sqm: '',
  city: '', region: '', neighborhood: '', external_url: '', images: [],
};
const num = (v) => (v === '' || v == null ? null : Number(v));
const eur = (v) => (v == null ? '—' : new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v));

// Shrink photos in the browser before upload (max 1800px, JPEG) to keep storage and page weight low.
async function shrink(file) {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, 1800 / Math.max(bmp.width, bmp.height));
  const c = document.createElement('canvas');
  c.width = Math.round(bmp.width * scale);
  c.height = Math.round(bmp.height * scale);
  c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
  return new Promise((res) => c.toBlob(res, 'image/jpeg', 0.85));
}

// Starred (featured) listings always come first; inside each group the manual order (sort_order) decides.
const orderRows = (rs) => [...rs].sort((a, b) =>
  (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0)
  || (a.sort_order ?? 1e9) - (b.sort_order ?? 1e9)
  || String(b.created_at).localeCompare(String(a.created_at)));

// One listing row that can be picked up by its grip and dropped between two others (mouse, finger or keyboard).
function SortableRow({ id, enabled, children }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id, disabled: !enabled });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 20 : undefined, position: 'relative' }}
      className={isDragging ? 'opacity-90 shadow-2xl shadow-black/60 rounded-xl' : ''}
    >
      {children(enabled ? (
        <button
          type="button"
          {...attributes}
          {...listeners}
          title="Sürüklemek için tutun"
          aria-label="Sırayı değiştirmek için sürükleyin"
          style={{ touchAction: 'none' }}
          className="shrink-0 -ml-1 p-1.5 rounded-md text-[#6A6A7A] hover:text-white hover:bg-white/5 cursor-grab active:cursor-grabbing"
        >
          <GripVertical size={18} />
        </button>
      ) : <span className="w-7 shrink-0" />)}
    </div>
  );
}

const inputCls = 'w-full bg-[#0B0B11] border border-[#2A2A3A] rounded-lg px-3 py-2 text-sm text-white placeholder:text-[#6A6A7A] focus:border-[#C9A84C] focus:outline-none';
const labelCls = 'text-xs text-[#9A9AAA] mb-1.5 block';

function Field({ label, children, className = '' }) {
  return (
    <div className={className}>
      <label className={labelCls}>{label}</label>
      {children}
    </div>
  );
}

function Editor({ row, onClose, onSaved }) {
  const isNew = !row;
  const [id] = useState(() => row?.id || crypto.randomUUID());
  const [f, setF] = useState(() => (row ? { ...EMPTY, ...Object.fromEntries(Object.entries(row).map(([k, v]) => [k, v ?? (k === 'images' ? [] : '')])) } : EMPTY));
  const [lang, setLang] = useState('tr');
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState('');
  const [importing, setImporting] = useState(false);
  const [note, setNote] = useState('');
  const [meta, setMeta] = useState(null); // extra fields from an import (external_id, coordinates, features)
  const [publish, setPublish] = useState(false);
  const [needSource, setNeedSource] = useState(false); // server could not open the RE/MAX page: paste its source instead
  const [srcHtml, setSrcHtml] = useState('');
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));

  const addPhotos = async (files) => {
    setUploading(true); setErr('');
    try {
      const urls = [];
      for (const file of Array.from(files)) {
        const blob = await shrink(file);
        const path = `${id}/${Date.now()}-${Math.random().toString(36).slice(2, 7)}.jpg`;
        const { error } = await supabase.storage.from('properties').upload(path, blob, { contentType: 'image/jpeg', cacheControl: '31536000' });
        if (error) throw error;
        urls.push(supabase.storage.from('properties').getPublicUrl(path).data.publicUrl);
      }
      set('images', [...f.images, ...urls]);
    } catch (e) { setErr('Fotoğraf yüklenemedi: ' + e.message); }
    setUploading(false);
  };
  const importFromUrl = async (useSource = false) => {
    const url = f.external_url.trim();
    if (!url) { setErr('Önce RE/MAX ilan linkini yapıştırın.'); return; }
    if (f.images.length || f.title_tr.trim()) {
      if (!confirm('Formdaki mevcut bilgilerin üzerine yazılacak. Devam edilsin mi?')) return;
    }
    setImporting(true); setErr(''); setNote('');
    try {
      const { data, error } = await supabase.functions.invoke('listing-import', { body: { url, id, ...(useSource && srcHtml.length > 2000 ? { html: srcHtml } : {}) } });
      let code = data?.error || '';
      let det = data?.detail;
      if (!code && error) {
        try { const j = await error.context?.json?.(); code = j?.error || error.message || ''; det = j?.detail; } catch { code = error.message || ''; }
      }
      if (error || !data?.ok) {
        // the server could not open or read the page: let the admin paste the page source instead
        if (code === 'fetch_failed' || code === 'parse_failed') setNeedSource(true);
        if (code === 'parse_failed') {
          const seen = det && typeof det === 'object' ? ` (sunucunun aldığı sayfa: "${det.title || 'başlıksız'}", ${det.len} karakter)` : '';
          throw new Error(`Sayfadan ilan bilgisi okunamadı${seen}. Aşağıya sayfa kaynağını yapıştırıp devam edebilirsiniz.`);
        }
        throw new Error(code === 'unsupported_url' ? 'RE/MAX ilan linki gerekli: remax.com/…/residential/property/… ya da remax.es/buscador-de-inmuebles/…'  : code === 'fetch_failed' ? 'RE/MAX sayfasına sunucudan ulaşılamadı. Aşağıya sayfa kaynağını yapıştırıp devam edebilirsiniz.' : 'İçe aktarma başarısız: ' + code);
      }
      setNeedSource(false); setSrcHtml('');
      const x = data.fields;
      setF((p) => ({
        ...p,
        external_url: x.external_url || p.external_url, property_type: x.property_type || p.property_type,
        price: x.price ?? '', bedrooms: x.bedrooms ?? '', bathrooms: x.bathrooms ?? '', area_sqm: x.area_sqm ?? '', land_sqm: x.land_sqm ?? '',
        city: x.city || '', region: x.region || '', images: x.images || [],
        title_tr: x.title_tr || '', title_es: x.title_es || '', title_en: x.title_en || '', title_de: x.title_de || '',
        description_tr: x.description_tr || '', description_es: x.description_es || '', description_en: x.description_en || '', description_de: x.description_de || '',
      }));
      setMeta({ external_id: x.external_id, latitude: x.latitude, longitude: x.longitude, features: x.features });
      setPublish(!data.duplicate);
      const msgs = [`${(x.images || []).length} fotoğraf aktarıldı`];
      if (!data.ai) msgs.push('Metinler otomatik çevrilemedi; İngilizce kaynak metin ve başlık taslağı dolduruldu, diğer dilleri kendiniz doldurun');
      if (data.available === false) msgs.push('Dikkat: RE/MAX bu ilanı satılmış/yayında değil olarak gösteriyor');
      if (data.duplicate) msgs.push(`Bu ilan zaten sitede var ("${data.duplicate.title_tr}"). Yine de kaydederseniz kopyası oluşur`);
      setNote(msgs.join('. ') + '. Kaydetmeden önce metinleri ve rakamları kontrol edin.');
    } catch (e) { setErr(e.message); }
    setImporting(false);
  };
  const move = (i, d) => {
    const a = [...f.images]; const j = i + d;
    if (j < 0 || j >= a.length) return;
    [a[i], a[j]] = [a[j], a[i]]; set('images', a);
  };
  const makeCover = (i) => { const a = [...f.images]; const [x] = a.splice(i, 1); set('images', [x, ...a]); };
  const removePhoto = (i) => set('images', f.images.filter((_, n) => n !== i));

  const save = async () => {
    if (!f.title_tr.trim()) { setErr('Türkçe başlık zorunlu.'); return; }
    setBusy(true); setErr('');
    const payload = {
      title_tr: f.title_tr.trim(), title_es: f.title_es || null, title_en: f.title_en || null, title_de: f.title_de || null,
      description_tr: f.description_tr || null, description_es: f.description_es || null, description_en: f.description_en || null, description_de: f.description_de || null,
      property_type: f.property_type, price: num(f.price), currency: f.currency || 'EUR',
      bedrooms: num(f.bedrooms), bathrooms: num(f.bathrooms), area_sqm: num(f.area_sqm), land_sqm: num(f.land_sqm),
      city: f.city || null, region: f.region || null, neighborhood: f.neighborhood || null,
      external_url: f.external_url.trim() || null,
      images: f.images, cover_image: f.images[0] || null,
    };
    let error;
    if (isNew) {
      ({ error } = await supabase.from('properties').insert({ id, ...payload, listing_type: 'sale', source: 'manual', is_active: false }));
    } else {
      ({ error } = await supabase.from('properties').update(payload).eq('id', id));
    }
    setBusy(false);
    if (error) { setErr(error.message); return; }
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 backdrop-blur-sm overflow-y-auto py-8">
      <div className="bg-[#151521] border border-[#2A2A3A] rounded-2xl w-full max-w-3xl mx-4 shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-[#2A2A3A]">
          <h2 className="text-lg font-semibold text-white">{isNew ? 'Yeni İlan' : 'İlanı Düzenle'}</h2>
          <button onClick={onClose} className="text-[#9A9AAA] hover:text-white"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          <Field label="RE/MAX ilan linki (isteğe bağlı)">
            <div className="flex gap-2">
              <input className={inputCls} value={f.external_url} onChange={(e) => set('external_url', e.target.value)} placeholder="remax.com/…/residential/property/… ya da remax.es/buscador-de-inmuebles/…" />
              {isNew && (
                <button type="button" onClick={() => importFromUrl(false)} disabled={importing || uploading || !f.external_url.trim()} className="inline-flex items-center gap-2 px-3 py-2 bg-[#C9A84C] text-black rounded-lg text-sm font-semibold whitespace-nowrap disabled:opacity-50">
                  {importing ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />} {importing ? 'Çekiliyor…' : 'Linkten çek'}
                </button>
              )}
              {f.external_url ? <a href={f.external_url} target="_blank" rel="noreferrer" className="px-3 py-2 bg-[#1E1E2E] border border-[#2A2A3A] rounded-lg text-[#9A9AAA] hover:text-white"><ExternalLink size={16} /></a> : null}
            </div>
            <p className="text-[11px] text-[#6A6A7A] mt-1">{isNew ? 'RE/MAX ilanıysa linki yapıştırıp "Linkten çek"e basın; fotoğraflar, bilgiler ve 4 dilde metin otomatik dolar. Kendi bulduğunuz bir evse bu alanı boş bırakıp aşağıyı elle doldurun.' : 'Sadece sizin için not; sitede gösterilmez.'}</p>
            {importing && <p className="text-[11px] text-[#C9A84C] mt-1">Fotoğraflar kopyalanıyor ve metinler hazırlanıyor, yarım dakika kadar sürebilir.</p>}
            {note && <p className="text-[11px] text-green-400 mt-1">{note}</p>}
            {needSource && (
              <div className="mt-3 rounded-lg p-3 border border-[#2A2A3A] bg-[#0B0B11]">
                <p className="text-xs text-[#C9C9D4] mb-2">Sayfayı tarayıcıda açın, sağ tıklayıp "Sayfa kaynağını görüntüle"yi seçin, tümünü kopyalayın (Ctrl+A, Ctrl+C) ve buraya yapıştırın.</p>
                <textarea className={`${inputCls} h-20 font-mono text-[11px]`} value={srcHtml} onChange={(e) => setSrcHtml(e.target.value)} placeholder="Sayfa kaynağı (&lt;html …)" aria-label="Sayfa kaynağı" />
                <button type="button" onClick={() => importFromUrl(true)} disabled={importing || srcHtml.length < 2000} className="mt-2 inline-flex items-center gap-2 px-3 py-2 bg-[#C9A84C] text-black rounded-lg text-sm font-semibold disabled:opacity-50">
                  {importing ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />} Kaynaktan çek
                </button>
              </div>
            )}
          </Field>

          {/* Photos */}
          <div>
            <label className={labelCls}>Fotoğraflar (ilk fotoğraf kapak olur)</label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {f.images.map((src, i) => (
                <div key={src} className="relative group rounded-lg overflow-hidden border border-[#2A2A3A] aspect-[4/3] bg-[#0B0B11]">
                  <img src={src} alt="" className="w-full h-full object-cover" />
                  {i === 0 && <span className="absolute top-1 left-1 px-1.5 py-0.5 text-[10px] bg-[#C9A84C] text-black rounded font-semibold">Kapak</span>}
                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/70 px-1 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button type="button" onClick={() => move(i, -1)} className="text-white p-1"><ChevronLeft size={14} /></button>
                    <button type="button" onClick={() => makeCover(i)} title="Kapak yap" className="text-white p-1"><Star size={14} /></button>
                    <button type="button" onClick={() => removePhoto(i)} title="Sil" className="text-[#DC1C2E] p-1"><Trash2 size={14} /></button>
                    <button type="button" onClick={() => move(i, 1)} className="text-white p-1"><ChevronRight size={14} /></button>
                  </div>
                </div>
              ))}
              <label className="aspect-[4/3] rounded-lg border-2 border-dashed border-[#2A2A3A] hover:border-[#C9A84C] flex flex-col items-center justify-center gap-1 text-[#9A9AAA] cursor-pointer text-xs">
                {uploading ? <Loader2 size={18} className="animate-spin" /> : <ImagePlus size={18} />}
                {uploading ? 'Yükleniyor…' : 'Fotoğraf ekle'}
                <input type="file" accept="image/*" multiple className="hidden" disabled={uploading} onChange={(e) => { if (e.target.files?.length) addPhotos(e.target.files); e.target.value = ''; }} />
              </label>
            </div>
          </div>

          {/* Text per language */}
          <div>
            <div className="flex gap-1 mb-3">
              {LANGS.map((l) => {
                const filled = f[`title_${l.k}`] && f[`description_${l.k}`];
                return (
                  <button key={l.k} type="button" onClick={() => setLang(l.k)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${lang === l.k ? 'border-[#C9A84C] text-[#C9A84C] bg-[#C9A84C]/10' : 'border-[#2A2A3A] text-[#9A9AAA]'}`}>
                    {l.label} {filled ? '✓' : ''}
                  </button>
                );
              })}
            </div>
            <Field label={`Başlık (${LANGS.find((l) => l.k === lang).label})${lang === 'tr' ? ' *' : ''}`}>
              <input className={inputCls} value={f[`title_${lang}`]} onChange={(e) => set(`title_${lang}`, e.target.value)} />
            </Field>
            <Field label="Açıklama" className="mt-3">
              <textarea rows={7} className={inputCls} value={f[`description_${lang}`]} onChange={(e) => set(`description_${lang}`, e.target.value)} />
            </Field>
            <p className="text-[11px] text-[#6A6A7A] mt-1">Boş bırakılan dilde sitede Türkçe → İngilizce → İspanyolca sırasıyla mevcut metin gösterilir.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Field label="Tür" className="col-span-2">
              <select className={inputCls} value={f.property_type} onChange={(e) => set('property_type', e.target.value)}>
                {TYPES.map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </Field>
            <Field label="Fiyat (€)"><input type="number" className={inputCls} value={f.price} onChange={(e) => set('price', e.target.value)} /></Field>
            <Field label="Oda"><input type="number" className={inputCls} value={f.bedrooms} onChange={(e) => set('bedrooms', e.target.value)} /></Field>
            <Field label="Banyo"><input type="number" className={inputCls} value={f.bathrooms} onChange={(e) => set('bathrooms', e.target.value)} /></Field>
            <Field label="Yapı m²"><input type="number" className={inputCls} value={f.area_sqm} onChange={(e) => set('area_sqm', e.target.value)} /></Field>
            <Field label="Arsa m²"><input type="number" className={inputCls} value={f.land_sqm} onChange={(e) => set('land_sqm', e.target.value)} /></Field>
            <Field label="Semt / mahalle"><input className={inputCls} value={f.neighborhood} onChange={(e) => set('neighborhood', e.target.value)} /></Field>
            <Field label="Şehir"><input className={inputCls} value={f.city} onChange={(e) => set('city', e.target.value)} /></Field>
            <Field label="Bölge (il)"><input className={inputCls} value={f.region} onChange={(e) => set('region', e.target.value)} placeholder="Valencia / Alicante" /></Field>
          </div>
          {isNew && (
            <label className="flex items-center gap-2 text-sm text-[#C8C8D4] cursor-pointer">
              <input type="checkbox" checked={publish} onChange={(e) => setPublish(e.target.checked)} /> Kaydedince sitede yayınla
            </label>
          )}
          {err && <p className="text-sm text-[#DC1C2E]">{err}</p>}
        </div>
        <div className="flex justify-end gap-3 p-5 border-t border-[#2A2A3A]">
          <button onClick={onClose} className="px-4 py-2 text-sm text-[#9A9AAA] hover:text-white">İptal</button>
          <button onClick={save} disabled={busy || uploading || importing} className="inline-flex items-center gap-2 px-5 py-2 bg-[#C9A84C] text-black rounded-lg text-sm font-semibold disabled:opacity-50">
            {busy ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Kaydet
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminIlanlarPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('all');
  const [editor, setEditor] = useState(undefined); // undefined closed, null new, row edit
  const [del, setDel] = useState(null);
  const [msg, setMsg] = useState('');

  // Only the first load shows the spinner; later refreshes swap data in place so the scroll position stays.
  const load = useCallback(async () => {
    const { data } = await supabase.from('properties').select('*');
    setRows(orderRows(data || []));
    setLoading(false);
  }, []);
  const patchRow = (id, patch) => setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  useEffect(() => { load(); }, [load]);

  const flash = (m) => { setMsg(m); setTimeout(() => setMsg(''), 4000); };
  const featuredCount = rows.filter((r) => r.is_featured).length;

  // Saves the whole order in one call (position 1 = first). On failure the list is reloaded from the server.
  const saveOrder = async (next) => {
    setRows(next);
    const { error } = await supabase.rpc('set_property_order', { ids: next.map((x) => x.id) });
    if (error) { flash('Sıralama kaydedilemedi: ' + error.message); load(); }
  };
  // A listing that changes group (starred / unstarred) goes to the top of its new group.
  const regroup = (id, patch) => {
    const moved = { ...rows.find((x) => x.id === id), ...patch };
    const rest = rows.filter((x) => x.id !== id);
    const featured = rest.filter((x) => x.is_featured);
    const others = rest.filter((x) => !x.is_featured);
    return moved.is_featured ? [moved, ...featured, ...others] : [...featured, moved, ...others];
  };

  const toggleActive = async (r) => {
    if (!r.is_active && (!r.title_tr || !r.price)) { flash('Yayına almak için başlık ve fiyat gerekli.'); return; }
    const patch = r.is_active ? { is_active: false, is_featured: false } : { is_active: true };
    const { error } = await supabase.from('properties').update(patch).eq('id', r.id);
    if (error) { flash(error.message); return; }
    if (r.is_featured && patch.is_featured === false) saveOrder(regroup(r.id, patch)); else patchRow(r.id, patch);
  };
  const toggleFeatured = async (r) => {
    if (!r.is_featured && !r.is_active) { flash('Seçkin yapmak için önce ilanı aktif edin.'); return; }
    const patch = { is_featured: !r.is_featured };
    const { error } = await supabase.from('properties').update(patch).eq('id', r.id);
    if (error) { flash(error.message.includes('En fazla 3') ? 'En fazla 3 seçkin konut olabilir. Önce birinin yıldızını kaldırın.' : error.message); return; }
    saveOrder(regroup(r.id, patch));
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const onDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const from = rows.findIndex((x) => x.id === active.id);
    const to = rows.findIndex((x) => x.id === over.id);
    if (from < 0 || to < 0) return;
    if (!!rows[from].is_featured !== !!rows[to].is_featured) {
      flash('Seçkin evler kendi arasında, diğerleri kendi arasında sıralanır. Bir evi seçkin yapmak için yıldızına tıklayın.');
      return;
    }
    saveOrder(arrayMove(rows, from, to));
  };
  const remove = async (r) => {
    if (r.images?.length) {
      const paths = r.images.map((u) => u.split('/object/public/properties/')[1]).filter(Boolean);
      if (paths.length) await supabase.storage.from('properties').remove(paths);
    }
    const { error } = await supabase.from('properties').delete().eq('id', r.id);
    setDel(null);
    if (error) flash(error.message); else setRows((rs) => rs.filter((x) => x.id !== r.id));
  };

  const canDrag = !q.trim() && status === 'all';
  const list = useMemo(() => rows.filter((r) => {
    if (status === 'active' && !r.is_active) return false;
    if (status === 'passive' && r.is_active) return false;
    if (status === 'featured' && !r.is_featured) return false;
    const s = q.toLowerCase();
    return !s || [r.title_tr, r.city, r.neighborhood, r.region, r.external_id].some((v) => v && String(v).toLowerCase().includes(s));
  }), [rows, q, status]);

  return (
    <AdminLayout activeSection="ilanlar">
      <div className="p-6 lg:p-8 max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-white">İlanlar</h1>
            <p className="text-sm text-[#9A9AAA] mt-1">{rows.filter((r) => r.is_active).length} aktif · {rows.length} toplam · Seçkin {featuredCount}/3</p>
          </div>
          <button onClick={() => setEditor(null)} className="inline-flex items-center gap-2 px-4 py-2 bg-[#C9A84C] text-black rounded-lg text-sm font-semibold"><Plus size={16} /> Yeni ilan</button>
        </div>

        <div className="flex flex-wrap gap-3 mb-5">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6A6A7A]" />
            <input className={inputCls + ' pl-9'} placeholder="Başlık, şehir, ilan no…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <select className={inputCls + ' !w-auto'} value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">Tümü</option><option value="active">Aktif</option><option value="passive">Pasif</option><option value="featured">Seçkin</option>
          </select>
        </div>

        {msg && <div className="mb-4 px-4 py-2.5 rounded-lg bg-[#C9A84C]/15 text-[#C9A84C] text-sm">{msg}</div>}

        {loading ? <div className="py-20 text-center text-[#9A9AAA]">Yükleniyor…</div> : list.length === 0 ? (
          <div className="py-20 text-center text-[#9A9AAA]">Henüz ilan yok. “Yeni ilan” ile ekleyin.</div>
        ) : (
          <>
          <p className="mb-3 text-xs text-[#6A6A7A]">
            {canDrag
              ? 'Sırayı değiştirmek için evin solundaki tutamaçtan tutup iki ev arasına bırakın. Yıldızlı evler her zaman en üsttedir (en fazla 3).'
              : 'Sürükleyerek sıralamak için arama ve filtreyi temizleyin (liste "Tümü" olmalı).'}
          </p>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={list.map((r) => r.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {list.map((r) => {
              const langsDone = LANGS.filter((l) => r[`title_${l.k}`] && r[`description_${l.k}`]).length;
              return (
                <SortableRow key={r.id} id={r.id} enabled={canDrag}>
                {(grip) => (
                <div className={`flex items-center gap-3 p-3 rounded-xl border bg-[#151521] ${r.is_featured ? 'border-[#C9A84C]/50' : 'border-[#2A2A3A]'}`}>
                  {grip}
                  <div className="w-24 h-16 rounded-lg overflow-hidden bg-[#0B0B11] shrink-0">
                    {(r.cover_image || r.images?.[0]) && <img src={r.cover_image || r.images[0]} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-medium truncate">{r.title_tr}</div>
                    <div className="text-xs text-[#9A9AAA] truncate">
                      {[r.neighborhood, r.city, r.region].filter(Boolean).join(', ') || '—'} · {eur(r.price)} · {r.bedrooms ? r.bedrooms + ' oda · ' : ''}{r.area_sqm ? r.area_sqm + ' m²' : ''}
                    </div>
                    <div className="text-[11px] text-[#6A6A7A] mt-0.5">{r.images?.length || 0} foto · diller {langsDone}/4{r.source_status === 'sold' ? ' · RE/MAX: satıldı' : ''}</div>
                  </div>
                  <button title="Seçkin" onClick={() => toggleFeatured(r)} className={r.is_featured ? 'text-[#C9A84C]' : 'text-[#6A6A7A] hover:text-white'}>
                    <Star size={18} fill={r.is_featured ? '#C9A84C' : 'none'} />
                  </button>
                  <button onClick={() => toggleActive(r)} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${r.is_active ? 'bg-[#22C55E]/15 text-[#22C55E]' : 'bg-[#1E1E2E] text-[#9A9AAA]'}`}>
                    {r.is_active ? <Eye size={14} /> : <EyeOff size={14} />} {r.is_active ? 'Aktif' : 'Pasif'}
                  </button>
                  <button title="Düzenle" onClick={() => setEditor(r)} className="text-[#9A9AAA] hover:text-white"><Edit3 size={17} /></button>
                  <button title="Sil" onClick={() => setDel(r)} className="text-[#9A9AAA] hover:text-[#DC1C2E]"><Trash2 size={17} /></button>
                </div>
                )}
                </SortableRow>
              );
            })}
          </div>
          </SortableContext>
          </DndContext>
          </>
        )}
      </div>

      {editor !== undefined && <Editor row={editor} onClose={() => setEditor(undefined)} onSaved={() => { setEditor(undefined); load(); }} />}

      {del && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-[#151521] border border-[#2A2A3A] rounded-2xl p-6 max-w-sm mx-4">
            <h3 className="text-white font-semibold mb-2">İlanı sil</h3>
            <p className="text-sm text-[#9A9AAA] mb-6">“{del.title_tr}” ve fotoğrafları kalıcı olarak silinecek. Sadece yayından kaldırmak için “Pasif” yapın.</p>
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
