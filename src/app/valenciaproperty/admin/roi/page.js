'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import AdminLayout from '@/components/admin/AdminLayout';
import { MapPin, Landmark, SlidersHorizontal, Plus, Check, AlertTriangle } from 'lucide-react';

const card = { background: '#151521', border: '1px solid #1E1E2E' };
const field = { background: '#0B0B11', border: '1px solid #1E1E2E' };
const STALE_DAYS = 45;

const slugify = (s) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const ageDays = (d) => (d ? (Date.now() - new Date(d).getTime()) / 86400000 : 0);
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' }) : '—');

function Stamp({ date }) {
  const stale = ageDays(date) > STALE_DAYS;
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] ${stale ? 'text-amber-400' : 'text-[#6A6A7A]'}`}>
      {stale && <AlertTriangle className="w-3 h-3" />}
      {fmtDate(date)}
    </span>
  );
}

function Num({ value, onChange, label, step = 'any', width = 'w-28' }) {
  return (
    <input
      type="number"
      step={step}
      aria-label={label}
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
      className={`${width} rounded-lg px-2.5 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-[#C9A84C]/50 tabular-nums`}
      style={field}
    />
  );
}

function Txt({ value, onChange, label, placeholder, width = 'w-full' }) {
  return (
    <input
      type="text"
      aria-label={label}
      placeholder={placeholder}
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      className={`${width} rounded-lg px-2.5 py-2 text-sm text-white outline-none placeholder:text-[#6A6A7A] focus:ring-2 focus:ring-[#C9A84C]/50`}
      style={field}
    />
  );
}

function SaveBtn({ dirty, saving, saved, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={!dirty || saving}
      className="px-3 py-2 rounded-lg text-sm font-medium disabled:opacity-40 flex items-center gap-1.5 shrink-0"
      style={dirty ? { background: '#C9A84C', color: '#0B0B11' } : { background: '#1E1E2E', color: '#9A9AAA' }}
    >
      {saved && !dirty ? <Check className="w-4 h-4" /> : null}
      {saving ? 'Kaydediliyor…' : saved && !dirty ? 'Kaydedildi' : 'Kaydet'}
    </button>
  );
}

// Generic row state: keeps a local copy and a "dirty" flag per row
function useRows(table, orderBy) {
  const [rows, setRows] = useState([]);
  const [orig, setOrig] = useState({});
  const [state, setState] = useState({});
  const [error, setError] = useState('');
  const pk = table === 'roi_assumptions' ? 'key' : 'id';

  const load = useCallback(async () => {
    const { data, error: err } = await supabase.from(table).select('*').order(orderBy);
    if (err) return setError('Veriler alınamadı.');
    setRows(data || []);
    setOrig(Object.fromEntries((data || []).map((r) => [r[pk], r])));
  }, [table, orderBy, pk]);

  useEffect(() => {
    load();
  }, [load]);

  const edit = (id, patch) => {
    setRows((rs) => rs.map((r) => (r[pk] === id ? { ...r, ...patch } : r)));
    setState((s) => ({ ...s, [id]: { saved: false } }));
  };
  const isDirty = (r) => JSON.stringify(strip(r)) !== JSON.stringify(strip(orig[r[pk]] || {}));
  const strip = ({ updated_at, ...rest }) => rest;

  const save = async (r, valid) => {
    if (!valid(r)) return setError('Eksik veya geçersiz değer var.');
    setError('');
    setState((s) => ({ ...s, [r[pk]]: { saving: true } }));
    const { updated_at, [pk]: _id, ...patch } = r;
    const { error: err } = await supabase.from(table).update(patch).eq(pk, r[pk]);
    setState((s) => ({ ...s, [r[pk]]: err ? {} : { saved: true } }));
    if (err) setError('Kaydedilemedi. Oturumunuzu kontrol edin.');
    else load();
  };

  return { rows, edit, isDirty, save, state, error, setError, reload: load, pk };
}

function DistrictsSection() {
  const { rows, edit, isDirty, save, state, error, setError, reload } = useRows('roi_districts', 'sort_order');
  const [adding, setAdding] = useState(false);

  const valid = (r) => r.name?.trim() && Number(r.ref_price) > 0 && Number(r.ref_rent) > 0;

  const add = async () => {
    setAdding(true);
    const name = `Yeni bölge ${rows.length + 1}`;
    const { error: err } = await supabase.from('roi_districts').insert({
      slug: `${slugify(name)}-${Date.now().toString(36)}`,
      name,
      ref_price: 250000,
      ref_rent: 1200,
      source_note: 'Kaynağı yazın (ör. Idealista, ay/yıl)',
      sort_order: (rows.at(-1)?.sort_order || 0) + 10,
    });
    setAdding(false);
    if (err) setError('Bölge eklenemedi.');
    else reload();
  };

  return (
    <section className="rounded-xl p-5" style={card}>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-1">
        <h2 className="flex items-center gap-2 text-base font-semibold text-white">
          <MapPin className="w-4 h-4 text-[#C9A84C]" />
          Bölgeler: fiyat ve kira
        </h2>
        <button
          onClick={add}
          disabled={adding}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium"
          style={{ background: 'rgba(201,168,76,0.15)', color: '#C9A84C' }}
        >
          <Plus className="w-4 h-4" />
          Bölge ekle
        </button>
      </div>
      <p className="text-sm text-[#9A9AAA] mb-4">
        Her bölge için 2 yatak odalı ortalama dairenin satış fiyatı ve aylık kirası. Hesap makinesi kira/fiyat oranını kullanır. Idealista veya başka bir
        kaynaktan güncelledikçe değerleri değiştirin; sarı tarih {STALE_DAYS} günden eski demektir.
      </p>
      {error && <p className="text-sm text-red-400 mb-3">{error}</p>}
      <div className="space-y-2">
        {rows.map((r) => {
          const yieldPct = r.ref_price > 0 ? ((r.ref_rent * 12) / r.ref_price) * 100 : 0;
          const st = state[r.id] || {};
          return (
            <div key={r.id} className="rounded-lg p-3 flex flex-wrap items-end gap-3" style={{ background: '#0B0B11', border: '1px solid #1E1E2E', opacity: r.is_active ? 1 : 0.55 }}>
              <label className="text-[11px] text-[#9A9AAA] w-44">
                Bölge
                <Txt value={r.name} onChange={(v) => edit(r.id, { name: v })} label="Bölge adı" />
              </label>
              <label className="text-[11px] text-[#9A9AAA]">
                Satış fiyatı (€)
                <Num value={r.ref_price} onChange={(v) => edit(r.id, { ref_price: v })} label="Satış fiyatı" />
              </label>
              <label className="text-[11px] text-[#9A9AAA]">
                Kira (€/ay)
                <Num value={r.ref_rent} onChange={(v) => edit(r.id, { ref_rent: v })} label="Aylık kira" width="w-24" />
              </label>
              <label className="text-[11px] text-[#9A9AAA]">
                €/m² (bilgi)
                <Num value={r.price_per_sqm} onChange={(v) => edit(r.id, { price_per_sqm: v === '' ? null : v })} label="Metrekare fiyatı" width="w-24" />
              </label>
              <div className="text-[11px] text-[#9A9AAA] w-16">
                Brüt verim
                <p className="text-sm text-white tabular-nums mt-2">{yieldPct.toFixed(1)}%</p>
              </div>
              <label className="text-[11px] text-[#9A9AAA] flex-1 min-w-[12rem]">
                Kaynak
                <Txt value={r.source_note} onChange={(v) => edit(r.id, { source_note: v })} label="Kaynak notu" />
              </label>
              <label className="flex items-center gap-1.5 text-xs text-[#9A9AAA] pb-2">
                <input type="checkbox" checked={r.is_active} onChange={(e) => edit(r.id, { is_active: e.target.checked })} />
                Hesap makinesinde göster
              </label>
              <div className="flex flex-col items-end gap-1">
                <Stamp date={r.updated_at} />
                <SaveBtn dirty={isDirty(r)} saving={st.saving} saved={st.saved} onClick={() => save(r, valid)} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function MortgagesSection() {
  const { rows, edit, isDirty, save, state, error, setError, reload } = useRows('roi_mortgages', 'sort_order');
  const [adding, setAdding] = useState(false);

  const valid = (r) => r.name?.trim() && Number(r.rate_pct) >= 0 && Number(r.max_ltv_pct) > 0 && Number(r.max_term_years) > 0;

  const add = async () => {
    setAdding(true);
    const { error: err } = await supabase.from('roi_mortgages').insert({
      name: `Banka adı: ürün (${rows.length + 1})`,
      rate_pct: 4,
      max_ltv_pct: 70,
      max_term_years: 25,
      fee_pct: 1,
      note: 'Teklif tarihi ve koşulları yazın',
      sort_order: (rows.at(-1)?.sort_order || 0) + 10,
    });
    setAdding(false);
    if (err) setError('Kredi eklenemedi.');
    else reload();
  };

  return (
    <section className="rounded-xl p-5" style={card}>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-1">
        <h2 className="flex items-center gap-2 text-base font-semibold text-white">
          <Landmark className="w-4 h-4 text-[#C9A84C]" />
          Banka kredileri (yerleşik olmayanlar)
        </h2>
        <button
          onClick={add}
          disabled={adding}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium"
          style={{ background: 'rgba(201,168,76,0.15)', color: '#C9A84C' }}
        >
          <Plus className="w-4 h-4" />
          Kredi ekle
        </button>
      </div>
      <p className="text-sm text-[#9A9AAA] mb-4">
        Çalıştığınız bankaların gerçek tekliflerini yazın: banka adı, faiz, en yüksek kredi oranı ve vade. Aşağıdaki iki satır örnektir, gerçek teklifle değiştirin.
      </p>
      {error && <p className="text-sm text-red-400 mb-3">{error}</p>}
      <div className="space-y-2">
        {rows.map((r) => {
          const st = state[r.id] || {};
          return (
            <div key={r.id} className="rounded-lg p-3 flex flex-wrap items-end gap-3" style={{ background: '#0B0B11', border: '1px solid #1E1E2E', opacity: r.is_active ? 1 : 0.55 }}>
              <label className="text-[11px] text-[#9A9AAA] w-56">
                Banka / ürün
                <Txt value={r.name} onChange={(v) => edit(r.id, { name: v })} label="Kredi adı" />
              </label>
              <label className="text-[11px] text-[#9A9AAA]">
                Faiz (%)
                <Num value={r.rate_pct} onChange={(v) => edit(r.id, { rate_pct: v })} label="Faiz" width="w-20" step="0.01" />
              </label>
              <label className="text-[11px] text-[#9A9AAA]">
                Kredi oranı (%)
                <Num value={r.max_ltv_pct} onChange={(v) => edit(r.id, { max_ltv_pct: v })} label="En yüksek kredi oranı" width="w-20" />
              </label>
              <label className="text-[11px] text-[#9A9AAA]">
                Vade (yıl)
                <Num value={r.max_term_years} onChange={(v) => edit(r.id, { max_term_years: v })} label="En uzun vade" width="w-20" />
              </label>
              <label className="text-[11px] text-[#9A9AAA]">
                Masraf (%)
                <Num value={r.fee_pct} onChange={(v) => edit(r.id, { fee_pct: v })} label="Açılış masrafı" width="w-20" step="0.1" />
              </label>
              <label className="text-[11px] text-[#9A9AAA] flex-1 min-w-[12rem]">
                Not
                <Txt value={r.note} onChange={(v) => edit(r.id, { note: v })} label="Not" />
              </label>
              <label className="flex items-center gap-1.5 text-xs text-[#9A9AAA] pb-2">
                <input type="checkbox" checked={r.is_active} onChange={(e) => edit(r.id, { is_active: e.target.checked })} />
                Göster
              </label>
              <div className="flex flex-col items-end gap-1">
                <Stamp date={r.updated_at} />
                <SaveBtn dirty={isDirty(r)} saving={st.saving} saved={st.saved} onClick={() => save(r, valid)} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function AssumptionsSection() {
  const { rows, edit, isDirty, save, state, error } = useRows('roi_assumptions', 'sort_order');
  const valid = (r) => r.value !== '' && Number.isFinite(Number(r.value)) && Number(r.value) >= 0;

  return (
    <section className="rounded-xl p-5" style={card}>
      <h2 className="flex items-center gap-2 text-base font-semibold text-white mb-1">
        <SlidersHorizontal className="w-4 h-4 text-[#C9A84C]" />
        Vergi, masraf ve büyüme varsayımları
      </h2>
      <p className="text-sm text-[#9A9AAA] mb-4">Yasa veya piyasa değiştiğinde buradan güncelleyin; hesap makinesi hemen yeni değeri kullanır.</p>
      {error && <p className="text-sm text-red-400 mb-3">{error}</p>}
      <div className="space-y-2">
        {rows.map((r) => {
          const st = state[r.key] || {};
          return (
            <div key={r.key} className="rounded-lg p-3 flex flex-wrap items-center gap-3" style={{ background: '#0B0B11', border: '1px solid #1E1E2E' }}>
              <div className="flex-1 min-w-[14rem]">
                <p className="text-sm text-white">{r.label_tr}</p>
                {r.note && <p className="text-xs text-[#6A6A7A] mt-0.5">{r.note}</p>}
              </div>
              <div className="flex items-center gap-2">
                <Num value={r.value} onChange={(v) => edit(r.key, { value: v })} label={r.label_tr} width="w-24" step="0.01" />
                <span className="text-xs text-[#9A9AAA] w-10">{r.unit}</span>
              </div>
              <Stamp date={r.updated_at} />
              <SaveBtn dirty={isDirty(r)} saving={st.saving} saved={st.saved} onClick={() => save(r, valid)} />
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default function AdminRoiPage() {
  return (
    <AdminLayout activeSection="roi">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">ROI Ayarları</h1>
          <p className="text-sm text-[#9A9AAA] mt-1">
            Sitedeki yatırım hesap makinesinin kullandığı fiyat, kira, kredi ve vergi verileri. Burada değiştirdiğiniz her şey hesap makinesine anında yansır.
          </p>
        </div>
        <DistrictsSection />
        <MortgagesSection />
        <AssumptionsSection />
      </div>
    </AdminLayout>
  );
}
