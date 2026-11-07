'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import AdminLayout from '@/components/admin/AdminLayout';

const LANGS = [['tr', 'Türkçe'], ['es', 'İspanyolca'], ['en', 'İngilizce'], ['de', 'Almanca']];
const KINDS = { welcome: 'Hoş geldin', blog: 'Yeni blog yazısı', market_digest: 'Haftalık piyasa özeti' };
const DAYS = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
const DEFAULTS = { welcome: { enabled: true }, blog: { enabled: true, delay_min: 15 }, digest: { enabled: true, weekday: 4, hour: 9 } };
const FIELDS = [['subject', 'Konu'], ['title', 'Başlık ({name} = üyenin adı)'], ['body', 'Metin (paragraflar için boş satır bırakın)'], ['btn', 'Birinci buton'], ['btn2', 'İkinci buton']];
const fmt = (d) => new Date(d).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
const inp = 'w-full bg-[#0B0B11] border border-[#2A2A3A] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#C9A84C]';
const card = 'bg-[#151521] border border-[#2A2A3A] rounded-2xl p-5';
const btnG = 'bg-[#C9A84C] text-[#0B0B11] font-semibold text-sm px-4 py-2 rounded-lg disabled:opacity-50';
const btnS = 'border border-[#2A2A3A] text-[#C8C8D4] text-sm px-4 py-2 rounded-lg hover:border-[#C9A84C] disabled:opacity-50';

export default function AutoMailAdmin() {
  const [tab, setTab] = useState('log');
  const [cfg, setCfg] = useState(DEFAULTS);
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);
  const [rows, setRows] = useState([]);
  const [kind, setKind] = useState('');
  const [view, setView] = useState(null);
  const [lang, setLang] = useState('tr');
  const [prev, setPrev] = useState(null);

  const loadCfg = useCallback(async () => {
    const { data } = await supabase.from('site_settings').select('value').eq('key', 'auto_mail').maybeSingle();
    const v = data?.value || {};
    setCfg({ welcome: { ...DEFAULTS.welcome, ...(v.welcome || {}) }, blog: { ...DEFAULTS.blog, ...(v.blog || {}) }, digest: { ...DEFAULTS.digest, ...(v.digest || {}) } });
  }, []);
  const loadLog = useCallback(async () => {
    let q = supabase.from('auto_mail_log').select('id,kind,to_email,lang,subject,status,error,ref,created_at').order('created_at', { ascending: false }).limit(300);
    if (kind) q = q.eq('kind', kind);
    const { data } = await q;
    setRows(data || []);
  }, [kind]);
  useEffect(() => { loadCfg(); }, [loadCfg]);
  useEffect(() => { loadLog(); }, [loadLog]);

  const save = async () => {
    setBusy(true); setMsg(null);
    const { error } = await supabase.from('site_settings').upsert({ key: 'auto_mail', value: cfg, is_public: false, updated_at: new Date().toISOString() });
    setBusy(false);
    setMsg(error ? { ok: false, text: 'Kaydedilemedi: ' + error.message } : { ok: true, text: 'Kaydedildi.' });
  };
  const set = (sec, k, v) => setCfg((c) => ({ ...c, [sec]: { ...c[sec], [k]: v } }));

  const openView = async (r) => {
    const { data } = await supabase.from('auto_mail_log').select('html').eq('id', r.id).maybeSingle();
    setView({ ...r, html: data?.html || '<p style="font-family:sans-serif">İçerik kaydedilmemiş.</p>' });
  };
  const call = async (k) => {
    setBusy(true); setMsg(null);
    const draft = {};
    FIELDS.forEach(([f]) => { const v = cfg.welcome[`${f}_${lang}`]; if (v) draft[`${f}_${lang}`] = v; });
    const { data, error } = await supabase.functions.invoke('auto-mail', { body: { kind: k, lang, draft } });
    setBusy(false);
    if (error || data?.error) { setMsg({ ok: false, text: 'İşlem başarısız: ' + (data?.error || error.message) }); return; }
    if (k === 'welcome_preview') { setPrev(data); } else setMsg({ ok: true, text: `Test e-postası ${data.to} adresine gönderildi.` });
  };

  const Toggle = ({ sec, label }) => (
    <label className="flex items-center gap-2 text-sm text-[#C8C8D4] cursor-pointer">
      <input type="checkbox" checked={!!cfg[sec].enabled} onChange={(e) => set(sec, 'enabled', e.target.checked)} /> {label}
    </label>
  );
  const Flash = () => msg && <p className={`text-sm ${msg.ok ? 'text-green-400' : 'text-red-400'}`} role="status">{msg.text}</p>;

  return (
    <AdminLayout activeSection="otomatik-mailler">
      <div className="p-6 lg:p-8 max-w-5xl">
        <h1 className="text-2xl font-semibold text-white">Otomatik Mailler</h1>
        <p className="text-sm text-[#9A9AAA] mt-1 mb-6">Üyelere kendiliğinden giden e-postalar: kayıtlar, zamanlama ve hoş geldin içeriği.</p>
        <div className="flex gap-2 mb-6 flex-wrap">
          {[['log', 'Gönderim kaydı'], ['timing', 'Zamanlama'], ['welcome', 'Hoş geldin içeriği']].map(([id, l]) => (
            <button key={id} onClick={() => { setTab(id); setMsg(null); }} className={`px-4 py-2 rounded-lg text-sm ${tab === id ? 'bg-[#C9A84C] text-[#0B0B11] font-semibold' : 'border border-[#2A2A3A] text-[#C8C8D4]'}`}>{l}</button>
          ))}
        </div>

        {tab === 'log' && (
          <div className={card}>
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <select className={inp + ' !w-auto'} value={kind} onChange={(e) => setKind(e.target.value)}>
                <option value="">Tüm türler</option>
                {Object.entries(KINDS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
              </select>
              <button className={btnS} onClick={loadLog}>Yenile</button>
              <span className="text-xs text-[#9A9AAA]">Son 300 kayıt</span>
            </div>
            {rows.length === 0 && <p className="text-sm text-[#9A9AAA]">Henüz otomatik mail gönderilmedi.</p>}
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id} onClick={() => openView(r)} className="border-t border-[#2A2A3A] cursor-pointer hover:bg-[#1B1B2B]">
                      <td className="py-2 pr-3 text-[#9A9AAA] whitespace-nowrap">{fmt(r.created_at)}</td>
                      <td className="py-2 pr-3 text-white">{KINDS[r.kind] || r.kind}</td>
                      <td className="py-2 pr-3 text-[#C8C8D4]">{r.to_email}</td>
                      <td className="py-2 pr-3 uppercase text-[#9A9AAA]">{r.lang}</td>
                      <td className={`py-2 ${r.status === 'sent' ? 'text-green-400' : 'text-red-400'}`}>{r.status === 'sent' ? 'Gönderildi' : 'Hata'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'timing' && (
          <div className="space-y-4">
            <div className={card}>
              <h2 className="text-white font-semibold mb-1">Hoş geldin maili</h2>
              <p className="text-xs text-[#9A9AAA] mb-3">Üye e-postasını onaylayınca hemen gider.</p>
              <Toggle sec="welcome" label="Açık" />
            </div>
            <div className={card}>
              <h2 className="text-white font-semibold mb-1">Yeni blog yazısı</h2>
              <p className="text-xs text-[#9A9AAA] mb-3">Yazı yayınlandıktan sonra bekleme süresi dolunca bültene abone üyelere gider. Bu süre, hızlı düzeltme yapmanız içindir.</p>
              <div className="flex items-center gap-6 flex-wrap">
                <Toggle sec="blog" label="Açık" />
                <label className="flex items-center gap-2 text-sm text-[#C8C8D4]">Bekleme (dakika)
                  <input type="number" min="0" max="1440" className={inp + ' !w-24'} value={cfg.blog.delay_min} onChange={(e) => set('blog', 'delay_min', Number(e.target.value))} />
                </label>
              </div>
            </div>
            <div className={card}>
              <h2 className="text-white font-semibold mb-1">Haftalık piyasa özeti</h2>
              <p className="text-xs text-[#9A9AAA] mb-3">Yeni yayınlanan piyasa notlarını haftada bir toplu gönderir. Saat, İspanya saatidir (Valencia).</p>
              <div className="flex items-center gap-6 flex-wrap">
                <Toggle sec="digest" label="Açık" />
                <label className="flex items-center gap-2 text-sm text-[#C8C8D4]">Gün
                  <select className={inp + ' !w-auto'} value={cfg.digest.weekday} onChange={(e) => set('digest', 'weekday', Number(e.target.value))}>
                    {DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
                  </select>
                </label>
                <label className="flex items-center gap-2 text-sm text-[#C8C8D4]">Saat
                  <select className={inp + ' !w-auto'} value={cfg.digest.hour} onChange={(e) => set('digest', 'hour', Number(e.target.value))}>
                    {Array.from({ length: 24 }, (_, h) => <option key={h} value={h}>{String(h).padStart(2, '0')}:00</option>)}
                  </select>
                </label>
              </div>
            </div>
            <div className="flex items-center gap-4"><button className={btnG} disabled={busy} onClick={save}>Kaydet</button><Flash /></div>
          </div>
        )}

        {tab === 'welcome' && (
          <div className={card}>
            <div className="flex gap-2 mb-4 flex-wrap">
              {LANGS.map(([l, n]) => (
                <button key={l} onClick={() => { setLang(l); setPrev(null); }} className={`px-3 py-1.5 rounded-lg text-sm ${lang === l ? 'bg-[#C9A84C] text-[#0B0B11] font-semibold' : 'border border-[#2A2A3A] text-[#C8C8D4]'}`}>{n}</button>
              ))}
            </div>
            <p className="text-xs text-[#9A9AAA] mb-4">Boş bıraktığınız alanlar için hazır varsayılan metin kullanılır. Her dil ayrı doldurulur.</p>
            <div className="space-y-3">
              {FIELDS.map(([f, label]) => (
                <label key={f} className="block text-sm text-[#C8C8D4]">{label}
                  {f === 'body'
                    ? <textarea rows={7} className={inp + ' mt-1'} value={cfg.welcome[`${f}_${lang}`] || ''} onChange={(e) => set('welcome', `${f}_${lang}`, e.target.value)} />
                    : <input className={inp + ' mt-1'} value={cfg.welcome[`${f}_${lang}`] || ''} onChange={(e) => set('welcome', `${f}_${lang}`, e.target.value)} />}
                </label>
              ))}
            </div>
            <div className="flex items-center gap-3 mt-5 flex-wrap">
              <button className={btnG} disabled={busy} onClick={save}>Kaydet</button>
              <button className={btnS} disabled={busy} onClick={() => call('welcome_preview')}>Önizle</button>
              <button className={btnS} disabled={busy} onClick={() => call('welcome_test')}>Bana test maili gönder</button>
              <Flash />
            </div>
            {prev && (
              <div className="mt-5">
                <p className="text-sm text-white mb-2">Konu: <span className="text-[#C9A84C]">{prev.subject}</span></p>
                <iframe title="Önizleme" sandbox="" srcDoc={prev.html} className="w-full h-[560px] bg-white rounded-lg" />
              </div>
            )}
          </div>
        )}

        {view && (
          <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={() => setView(null)}>
            <div className="bg-[#151521] rounded-2xl w-full max-w-3xl p-5" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between mb-3 gap-4">
                <div className="text-sm text-white">{view.subject}<div className="text-xs text-[#9A9AAA]">{view.to_email} · {fmt(view.created_at)}{view.error ? ' · ' + view.error : ''}</div></div>
                <button className={btnS} onClick={() => setView(null)}>Kapat</button>
              </div>
              <iframe title="Mail" sandbox="" srcDoc={view.html} className="w-full h-[70vh] bg-white rounded-lg" />
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
