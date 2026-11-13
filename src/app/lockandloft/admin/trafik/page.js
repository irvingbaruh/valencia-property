'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import AdminLayout from '@/components/admin/AdminLayout';
import SourcesBox from '@/components/admin/SourcesBox';

const card = { background: '#151521', border: '1px solid #1E1E2E' };
const inner = { background: '#0B0B11', border: '1px solid #1E1E2E' };
const RANGES = [
  ['today', 'Bugün', 0],
  ['7', '7 gün', 6],
  ['30', '30 gün', 29],
  ['90', '90 gün', 89],
];
const LANG = { tr: 'Türkçe', es: 'İspanyolca', en: 'İngilizce', de: 'Almanca', '?': 'Bilinmiyor' };
const DEVICE = { mobile: 'Telefon', desktop: 'Bilgisayar', tablet: 'Tablet', '?': 'Bilinmiyor' };
const nf = (n) => Number(n || 0).toLocaleString('tr-TR');
const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const dayStart = (s) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};
const regionName = (() => {
  try {
    const dn = new Intl.DisplayNames(['tr'], { type: 'region' });
    return (c) => (c === '?' ? 'Bilinmiyor' : dn.of(c) || c);
  } catch {
    return (c) => c;
  }
})();

function Tile({ label, value, hint }) {
  return (
    <div className="rounded-xl p-4" style={card}>
      <p className="text-xs text-[#9A9AAA]">{label}</p>
      <p className="text-2xl font-semibold text-white mt-1">{nf(value)}</p>
      {hint && <p className="text-[11px] text-[#6A6A7A] mt-1">{hint}</p>}
    </div>
  );
}

function Rows({ title, rows, cols, empty = 'Bu aralıkta veri yok.' }) {
  return (
    <section className="rounded-xl p-5" style={card}>
      <h2 className="text-base font-semibold text-white mb-3">{title}</h2>
      {rows.length === 0 ? (
        <p className="text-sm text-[#9A9AAA]">{empty}</p>
      ) : (
        <ul className="divide-y divide-[#1E1E2E]">
          {rows.map((r, i) => (
            <li key={i} className="py-2 flex items-start justify-between gap-3 text-sm">
              <span className="min-w-0 break-words text-white">{r.main}{r.sub && <span className="block text-[11px] text-[#6A6A7A] break-all">{r.sub}</span>}</span>
              <span className="shrink-0 text-right text-[#C9A84C] tabular-nums">{r.value}{cols && <span className="block text-[11px] text-[#6A6A7A]">{cols}</span>}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function Share({ title, rows, label }) {
  const total = rows.reduce((s, r) => s + r.n, 0) || 1;
  return (
    <section className="rounded-xl p-5" style={card}>
      <h2 className="text-base font-semibold text-white mb-3">{title}</h2>
      {rows.length === 0 ? (
        <p className="text-sm text-[#9A9AAA]">Bu aralıkta veri yok.</p>
      ) : (
        <ul className="space-y-2.5">
          {rows.map((r) => (
            <li key={r.k} className="text-sm">
              <div className="flex justify-between gap-3 text-white">
                <span className="min-w-0 truncate">{label(r.k)}</span>
                <span className="tabular-nums text-[#9A9AAA]">{nf(r.n)} · %{Math.round((r.n / total) * 100)}</span>
              </div>
              <div className="h-1.5 rounded-full mt-1" style={{ background: '#0B0B11' }}>
                <div className="h-1.5 rounded-full" style={{ width: `${(r.n / total) * 100}%`, background: '#C9A84C' }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function Daily({ days }) {
  const max = Math.max(1, ...days.map((d) => d.views));
  return (
    <section className="rounded-xl p-5" style={card}>
      <h2 className="text-base font-semibold text-white mb-4">Günlük görüntüleme</h2>
      {days.length === 0 ? (
        <p className="text-sm text-[#9A9AAA]">Bu aralıkta veri yok.</p>
      ) : (
        <div className="flex items-end gap-1.5 h-36 overflow-x-auto">
          {days.map((d) => (
            <div key={d.day} className="flex-1 min-w-[10px] max-w-[44px] flex flex-col items-center justify-end h-full group relative">
              <div className="w-full rounded-t" style={{ height: `${Math.max(3, (d.views / max) * 100)}%`, background: '#C9A84C' }} title={`${d.day}: ${d.views} görüntüleme, ${d.visitors} ziyaretçi, ${d.clicks} tıklama`} />
            </div>
          ))}
        </div>
      )}
      {days.length > 0 && (
        <div className="flex justify-between text-[11px] text-[#6A6A7A] mt-2">
          <span>{new Date(days[0].day).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}</span>
          <span>{new Date(days[days.length - 1].day).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}</span>
        </div>
      )}
    </section>
  );
}

const CTX = {
  favorite: 'Favori kalbine dokundu',
  listing: 'İlan sayfasındaki davet',
  cost: 'Maliyet hesaplayıcıdaki davet',
  save_search: 'Aramayı kaydet düğmesi',
  gate: '15 ilan sınırı kartı',
  join: 'Sınır kartı: Ücretsiz üye ol',
  login: 'Sınır kartı: Giriş yap',
  guide_sample: 'Rehber örnek sayfası',
  guide: 'Rehber örnek sayfası',
  booking: 'Görüşme randevusu daveti',
  booking_home: 'Ana sayfa: görüşme daveti',
  booking_contact: 'İletişim sayfası: görüşme daveti',
  panel: 'Üye paneli',
  direct: 'Doğrudan',
  '-': 'Belirtilmemiş',
};

function Funnel({ f }) {
  if (!f) return null;
  const v = (k) => Number((f.steps.find((x) => x.step === k) || {}).visitors || 0);
  const e = (k) => Number((f.steps.find((x) => x.step === k) || {}).events || 0);
  const rows = [
    ['Ziyaretçi', f.visitors],
    ['İlan sayfasını açan', f.listing_page],
    ['Üyelik kartını gören (15 ilan sınırı ya da rehberin devamı)', v('gate_view')],
    ['Üyelik kartında düğmeye basan', v('gate_click')],
    ['Başka bir davete basan (favori, ilan, hesaplayıcı, arama)', v('invite_click')],
    ['Giriş/kayıt sayfasını açan', v('auth_view')],
    ['Kayıt formunu gönderen', v('signup_start') + v('signup_google')],
  ];
  const top = Math.max(1, ...rows.map((r) => r[1]));
  return (
    <section className="rounded-xl p-5" style={card}>
      <h2 className="text-base font-semibold text-white mb-1">Üyelik hunisi</h2>
      <p className="text-xs text-[#6A6A7A] mb-4">Ziyaretçi sayıları günlük sayılır; aynı kişi farklı günlerde birden fazla kez görünebilir. Gerçek yeni üye sayısı doğrudan üye kayıtlarından gelir.</p>
      <ul className="space-y-2">
        {rows.map(([label, n]) => (
          <li key={label}>
            <div className="flex justify-between text-sm text-white"><span>{label}</span><span className="tabular-nums text-[#C9A84C]">{nf(n)}</span></div>
            <div className="h-1.5 rounded bg-[#0B0B11] mt-1"><div className="h-1.5 rounded bg-[#C9A84C]" style={{ width: `${Math.max(2, (n / top) * 100)}%` }} /></div>
          </li>
        ))}
      </ul>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
        <Tile label="Yeni üye (bu aralıkta)" value={f.signups} hint={`Toplam üye: ${nf(f.members)}`} />
        <Tile label="Aramasını kaydeden" value={e('search_saved')} hint="Kayıtlı arama sayısı" />
        <Tile label="Hoş geldin ekranından işlem" value={e('welcome_go')} hint={`${nf(e('welcome_view'))} kez gösterildi`} />
        <Tile label="Bildirimi açık üye" value={f.push_members} />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
        <Tile label="Uygulamayı kuran (bu aralıkta)" value={v('app_install')} hint="Android/Chrome kurulum olayı" />
        <Tile label="Uygulamayı açan (bu aralıkta)" value={v('app_open')} hint="Kurulu uygulamadan giren ziyaretçi" />
        <Tile label="Uygulaması olan üye" value={f.app_members} hint="Girişli açılıştan bilinen" />
        <Tile label="Son 30 günde uygulamayı açan üye" value={f.app_active_30d} />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
        <Tile label="Görüşme randevusu alan" value={e('booking_done')} hint={`${nf(e('booking_open'))} kez randevu ekranı açıldı`} />
        <Tile label="WhatsApp balonuna basan üye" value={e('wa_click')} hint="Yalnız üyelere gösterilir" />
      </div>
      {f.contexts.filter((c) => c.step !== 'invite_view').length > 0 && (
        <div className="mt-5">
          <p className="text-sm font-semibold text-white mb-2">Davetler nerede işe yarıyor?</p>
          <ul className="divide-y divide-[#1E1E2E]">
            {f.contexts.filter((c) => c.step !== 'invite_view').map((c, i) => (
              <li key={i} className="py-1.5 flex justify-between text-sm text-white"><span>{CTX[c.ctx] || (c.ctx.startsWith('guide_') ? `Rehber sayfası: ${c.ctx.slice(6)}` : c.ctx)}</span><span className="tabular-nums text-[#C9A84C]">{nf(c.n)} tıklama</span></li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function Traffic() {
  const today = iso(new Date());
  const [range, setRange] = useState('7');
  const [from, setFrom] = useState(today);
  const [to, setTo] = useState(today);
  const [data, setData] = useState(null);
  const [fun, setFun] = useState(null);
  const [src, setSrc] = useState(null);
  const [err, setErr] = useState('');

  const load = useCallback(async () => {
    let a, b;
    if (range === 'custom') {
      a = dayStart(from);
      b = dayStart(to);
    } else {
      const back = RANGES.find((r) => r[0] === range)[2];
      b = dayStart(today);
      a = new Date(b);
      a.setDate(a.getDate() - back);
    }
    b = new Date(b);
    b.setDate(b.getDate() + 1);
    const { data: res, error } = await supabase.rpc('analytics_summary', { p_from: a.toISOString(), p_to: b.toISOString() });
    if (error) setErr('Veriler yüklenemedi.');
    else {
      setErr('');
      setData(res);
    }
    const { data: fres } = await supabase.rpc('funnel_summary', { p_from: a.toISOString(), p_to: b.toISOString() });
    if (fres) setFun(fres);
    const { data: sres } = await supabase.rpc('admin_source_stats', { p_from: a.toISOString(), p_to: b.toISOString() });
    if (sres) setSrc(sres);
  }, [range, from, to, today]);

  useEffect(() => {
    load();
    const t = setInterval(load, 60000);
    return () => clearInterval(t);
  }, [load]);

  const d = data;
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-white">Trafik</h1>
          <p className="text-sm text-[#9A9AAA] mt-1">Siteyi kimlerin, hangi sayfaları ve düğmeleri kullandığını gösterir. Çerez kullanmaz, kişi tanımlamaz.</p>
        </div>
        {d && (
          <span className="text-xs px-3 py-1.5 rounded-full" style={{ background: 'rgba(34,197,94,0.12)', color: '#22C55E' }}>
            Şu an sitede: {nf(d.live)}
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {RANGES.map(([id, label]) => (
          <button
            key={id}
            onClick={() => setRange(id)}
            className={`px-3.5 py-2 rounded-lg text-sm ${range === id ? 'text-[#C9A84C]' : 'text-[#9A9AAA] hover:text-white'}`}
            style={range === id ? { background: 'rgba(201,168,76,0.15)' } : inner}
          >
            {label}
          </button>
        ))}
        <button
          onClick={() => setRange('custom')}
          className={`px-3.5 py-2 rounded-lg text-sm ${range === 'custom' ? 'text-[#C9A84C]' : 'text-[#9A9AAA] hover:text-white'}`}
          style={range === 'custom' ? { background: 'rgba(201,168,76,0.15)' } : inner}
        >
          Tarih seç
        </button>
        {range === 'custom' && (
          <span className="flex items-center gap-2 text-sm text-[#9A9AAA]">
            <input type="date" value={from} max={to} onChange={(e) => setFrom(e.target.value)} className="px-2 py-2 rounded-lg bg-[#0E0E18] border border-[#2A2A3C] text-white text-sm" />
            –
            <input type="date" value={to} min={from} max={today} onChange={(e) => setTo(e.target.value)} className="px-2 py-2 rounded-lg bg-[#0E0E18] border border-[#2A2A3C] text-white text-sm" />
          </span>
        )}
      </div>

      {err && <p className="text-sm text-red-400">{err}</p>}
      {!d && !err && <p className="text-sm text-[#9A9AAA]">Yükleniyor…</p>}

      {d && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <Tile label="Ziyaretçi" value={d.visitors} hint="Yaklaşık, günlük sayılır" />
            <Tile label="Sayfa görüntüleme" value={d.views} />
            <Tile label="Tıklama" value={d.clicks} />
            <Tile label="İlan gösterimi" value={d.listing_views} hint="Kart ekranda göründü" />
            <Tile label="İlan tıklaması" value={d.listing_clicks} />
          </div>

          <Daily days={d.by_day} />

          <Funnel f={fun} />

          <SourcesBox stats={src} />

          <div className="grid lg:grid-cols-2 gap-5">
            <Rows title="En çok açılan sayfalar" cols="görüntüleme" rows={d.top_pages.map((r) => ({ main: r.path, value: nf(r.views), sub: `${nf(r.visitors)} ziyaretçi` }))} />
            <Rows
              title="En çok tıklananlar"
              cols="tıklama"
              rows={d.top_clicks.map((r) => ({ main: r.label, sub: r.target, value: nf(r.clicks) }))}
            />
          </div>

          <Rows
            title="İlanlar"
            cols="açılma"
            rows={d.top_listings.map((r) => ({
              main: r.title,
              sub: `${nf(r.impressions)} gösterim · ${nf(r.clicks)} karttan tıklama`,
              value: nf(r.opens),
            }))}
            empty="Bu aralıkta ilan verisi yok."
          />

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
            <Share title="Dil" rows={d.by_locale} label={(k) => LANG[k] || k} />
            <Share title="Ülke" rows={d.by_country} label={regionName} />
            <Share title="Şehir" rows={(d.by_city || []).map((r) => ({ k: r.k === '?' ? '?' : `${r.k}|${r.c}`, n: r.n }))} label={(k) => (k === '?' ? 'Bilinmiyor' : `${k.split('|')[0]}${k.split('|')[1] ? ' (' + regionName(k.split('|')[1]) + ')' : ''}`)} />
            <Share title="Cihaz" rows={d.by_device} label={(k) => DEVICE[k] || k} />
            <Share title="Nereden geldiler" rows={d.by_referrer} label={(k) => k} />
          </div>
          <p className="text-xs text-[#6A6A7A]">Kendi giriş yaptığınız cihazlar ve botlar sayılmaz. Veriler en fazla 400 gün saklanır.</p>
        </>
      )}
    </div>
  );
}

export default function Page() {
  return (
    <AdminLayout activeSection="trafik">
      <Traffic />
    </AdminLayout>
  );
}
