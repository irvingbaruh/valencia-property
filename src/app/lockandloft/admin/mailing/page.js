'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import AdminLayout from '@/components/admin/AdminLayout';
import { Plus, Send, Save, Trash2, Mail, Users, X, FlaskConical } from 'lucide-react';

const LANGS = [
  { code: 'tr', label: 'Türkçe' },
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'de', label: 'Deutsch' },
];
const EMPTY = {
  name: '',
  subject_tr: '', subject_en: '', subject_es: '', subject_de: '',
  body_tr: '', body_en: '', body_es: '', body_de: '',
  audience_langs: ['tr', 'en', 'es', 'de'],
};
const card = { background: '#151521', border: '1px solid #1E1E2E' };
const inputCls =
  'w-full px-3 py-2.5 rounded-lg bg-[#0E0E18] border border-[#2A2A3C] text-white text-sm focus:outline-none focus:border-[#C9A84C]';

const ERRORS = {
  not_configured: 'E-posta servisi henüz bağlanmadı (RESEND_API_KEY ve MAIL_FROM tanımlanmalı).',
  already_sent: 'Bu kampanya zaten gönderildi.',
  nothing_to_send: 'Gönderilecek abone ya da dolu bir dil içeriği yok.',
  forbidden: 'Bu işlem için yetkiniz yok.',
};

function StatsRow({ c, st, pct, compact }) {
  const delivered = st?.delivered || 0;
  const items = [
    ['Teslim edildi', delivered, null],
    ['Açan', st?.opened || 0, pct(st?.opened || 0, delivered)],
    ['Tıklayan', st?.clicked || 0, pct(st?.clicked || 0, delivered)],
    ['Geri dönen', st?.bounced || 0, null],
    ['Şikayet', st?.complained || 0, null],
  ];
  return (
    <div className={`flex flex-wrap gap-x-5 gap-y-1 ${compact ? 'mt-1.5 text-xs' : 'text-sm'}`}>
      {items.map(([label, n, p]) => (
        <span key={label} className="text-[#9A9AAA]">
          {label}: <span className="text-white font-medium">{n}</span>
          {p ? <span> ({p})</span> : null}
        </span>
      ))}
    </div>
  );
}

export default function MailingPage() {
  const [tab, setTab] = useState('campaigns');
  const [subs, setSubs] = useState([]);
  const [unsubs, setUnsubs] = useState([]);
  const [stats, setStats] = useState({});
  const [links, setLinks] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [editing, setEditing] = useState(null);
  const [lang, setLang] = useState('tr');
  const [busy, setBusy] = useState('');
  const [msg, setMsg] = useState(null);

  const load = useCallback(async () => {
    const [s, c, u, st] = await Promise.all([
      supabase.rpc('admin_mailing_subscribers'),
      supabase.from('mailing_campaigns').select('*').order('created_at', { ascending: false }),
      supabase.rpc('admin_mailing_unsubscribed'),
      supabase.rpc('admin_campaign_stats'),
    ]);
    setSubs(s.data || []);
    setCampaigns(c.data || []);
    setUnsubs(u.data || []);
    setStats(Object.fromEntries((st.data || []).map((x) => [x.campaign_id, x])));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setLinks([]);
    if (editing?.id && editing.status === 'sent') {
      supabase.rpc('admin_campaign_links', { p_campaign: editing.id }).then(({ data }) => setLinks(data || []));
    }
  }, [editing?.id, editing?.status]);

  const pct = (n, d) => (d ? `${Math.round((n / d) * 100)}%` : '-');

  const save = async () => {
    if (!editing.name.trim()) {
      setMsg({ ok: false, text: 'Kampanya adı gerekli.' });
      return null;
    }
    setBusy('save');
    const { id, created_at, updated_at, status, sent_at, sent_count, failed_count, created_by, ...fields } = editing;
    let res;
    if (id) res = await supabase.from('mailing_campaigns').update({ ...fields, updated_at: new Date().toISOString() }).eq('id', id).select().single();
    else res = await supabase.from('mailing_campaigns').insert(fields).select().single();
    setBusy('');
    if (res.error) {
      setMsg({ ok: false, text: 'Kaydedilemedi.' });
      return null;
    }
    setEditing(res.data);
    setMsg({ ok: true, text: 'Taslak kaydedildi.' });
    load();
    return res.data;
  };

  const send = async (test) => {
    const saved = await save();
    if (!saved) return;
    if (!test && !window.confirm(`${audienceCount} aboneye gönderilsin mi? Bu işlem geri alınamaz.`)) return;
    setBusy(test ? 'test' : 'send');
    const { data, error } = await supabase.functions.invoke('send-mailing', { body: { campaign_id: saved.id, test } });
    setBusy('');
    let code = data?.error;
    if (error && !code) {
      try {
        code = (await error.context.json()).error;
      } catch {
        code = 'server_error';
      }
    }
    if (code) setMsg({ ok: false, text: ERRORS[code] || 'Gönderim başarısız oldu.' });
    else setMsg({ ok: true, text: test ? 'Test e-postası kendi adresinize gönderildi.' : `Gönderildi: ${data.sent} başarılı, ${data.failed} başarısız.` });
    load();
  };

  const remove = async (c) => {
    if (!window.confirm('Bu kampanya silinsin mi?')) return;
    await supabase.from('mailing_campaigns').delete().eq('id', c.id);
    load();
  };

  const langCount = (code) => subs.filter((s) => (s.lang || 'tr') === code).length;
  const locked = editing?.status === 'sent';
  const audience = editing?.audience_langs || [];
  const audienceCount = subs.filter((s) => audience.includes(s.lang || 'tr')).length;
  const missing = audience.filter((l) => !(editing?.[`subject_${l}`]?.trim() && editing?.[`body_${l}`]?.trim()));
  const toggleAudience = (code) =>
    setEditing({ ...editing, audience_langs: audience.includes(code) ? audience.filter((x) => x !== code) : [...audience, code] });

  return (
    <AdminLayout activeSection="mailing">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Mailing</h1>
            <p className="text-sm text-[#9A9AAA] mt-1">Bülteni onaylayan üyelere dil bazlı e-posta gönderin.</p>
          </div>
          {!editing && (
            <button
              onClick={() => { setEditing({ ...EMPTY }); setMsg(null); setLang('tr'); }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-[#0B0B11]"
              style={{ background: '#C9A84C' }}
            >
              <Plus className="w-4 h-4" /> Yeni kampanya
            </button>
          )}
        </div>

        {msg && (
          <div className={`px-4 py-3 rounded-lg text-sm ${msg.ok ? 'bg-emerald-500/10 text-emerald-300' : 'bg-red-500/10 text-red-300'}`}>
            {msg.text}
          </div>
        )}

        {editing ? (
          <div className="rounded-xl p-6 space-y-5" style={card}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">{editing.id ? 'Kampanyayı düzenle' : 'Yeni kampanya'}</h2>
              <button onClick={() => { setEditing(null); setMsg(null); }} className="text-[#9A9AAA] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            {locked && <p className="text-sm text-amber-300">Bu kampanya gönderildi; içeriği değiştirseniz de tekrar gönderilemez.</p>}
            <div>
              <label className="block text-xs text-[#9A9AAA] mb-1.5">Kampanya adı (sadece sizin için)</label>
              <input className={inputCls} value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
            </div>
            <div className="flex gap-2">
              {LANGS.map((l) => (
                <button
                  key={l.code}
                  onClick={() => setLang(l.code)}
                  className={`px-3 py-1.5 rounded-lg text-sm ${lang === l.code ? 'bg-[#C9A84C] text-[#0B0B11] font-medium' : 'bg-white/5 text-[#9A9AAA]'}`}
                >
                  {l.label}
                  {editing[`subject_${l.code}`] && editing[`body_${l.code}`] ? ' ✓' : ''}
                </button>
              ))}
            </div>
            <div>
              <label className="block text-xs text-[#9A9AAA] mb-1.5">Konu ({lang})</label>
              <input className={inputCls} value={editing[`subject_${lang}`] || ''} onChange={(e) => setEditing({ ...editing, [`subject_${lang}`]: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs text-[#9A9AAA] mb-1.5">İçerik ({lang}) — paragraflar boş satırla ayrılır, **kalın** ve bağlantılar desteklenir</label>
              <textarea rows={12} className={inputCls} value={editing[`body_${lang}`] || ''} onChange={(e) => setEditing({ ...editing, [`body_${lang}`]: e.target.value })} />
            </div>
            <p className="text-xs text-[#9A9AAA]">
              Her abone kendi dilindeki içeriği alır; o dil boşsa sırayla İngilizce, Türkçe, İspanyolca, Almanca kullanılır. Abonelikten çık bağlantısı otomatik eklenir.
            </p>
            {editing.id && editing.status === 'sent' && (
              <div className="rounded-lg p-4 space-y-3" style={{ background: '#0E0E18', border: '1px solid #2A2A3C' }}>
                <p className="text-sm text-white font-medium">Sonuçlar</p>
                <StatsRow c={editing} st={stats[editing.id]} pct={pct} />
                {links.length > 0 && (
                  <div>
                    <p className="text-xs text-[#9A9AAA] mb-1.5">En çok tıklanan bağlantılar</p>
                    {links.map((l) => (
                      <p key={l.link} className="text-xs text-white flex justify-between gap-3">
                        <span className="truncate">{l.link}</span>
                        <span className="text-[#9A9AAA] shrink-0">{l.people} kişi · {l.clicks} tık</span>
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}
            <div className="rounded-lg p-4 space-y-3" style={{ background: '#0E0E18', border: '1px solid #2A2A3C' }}>
              <p className="text-sm text-white font-medium">Alıcılar: hangi dilde kayıtlı aboneler?</p>
              <div className="flex flex-wrap gap-4">
                {LANGS.map((l) => (
                  <label key={l.code} className="flex items-center gap-2 text-sm text-white cursor-pointer">
                    <input
                      type="checkbox"
                      checked={audience.includes(l.code)}
                      disabled={locked}
                      onChange={() => toggleAudience(l.code)}
                      className="accent-[#C9A84C]"
                    />
                    {l.label} ({langCount(l.code)})
                  </label>
                ))}
              </div>
              <p className="text-xs text-[#9A9AAA]">
                Seçilen dillerdeki {audienceCount} aboneye gönderilir. Sadece seçili dillerin aboneleri e-posta alır; sekmeler yalnızca içeriği yazmak içindir.
              </p>
              {missing.length > 0 && (
                <p className="text-xs text-amber-300">
                  Şu dillerin konu veya içeriği boş: {missing.join(', ').toUpperCase()}. Bu dillerin aboneleri başka bir dildeki içeriği alır; istemiyorsanız dili kapatın.
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-3">
              <button onClick={save} disabled={!!busy} className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm bg-white/10 text-white hover:bg-white/15">
                <Save className="w-4 h-4" /> {busy === 'save' ? 'Kaydediliyor…' : 'Taslağı kaydet'}
              </button>
              <button onClick={() => send(true)} disabled={!!busy} className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm bg-white/10 text-white hover:bg-white/15">
                <FlaskConical className="w-4 h-4" /> {busy === 'test' ? 'Gönderiliyor…' : 'Test gönder (kendime)'}
              </button>
              <button
                onClick={() => send(false)}
                disabled={!!busy || locked || audienceCount === 0}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-[#0B0B11] disabled:opacity-40"
                style={{ background: '#C9A84C' }}
              >
                <Send className="w-4 h-4" /> {busy === 'send' ? 'Gönderiliyor…' : `${audienceCount} aboneye gönder`}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex gap-2">
              {[['campaigns', 'Kampanyalar', Mail], ['subs', `Aboneler (${subs.length})`, Users]].map(([id, label, Icon]) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm ${tab === id ? 'bg-[#C9A84C] text-[#0B0B11] font-medium' : 'bg-white/5 text-[#9A9AAA]'}`}
                >
                  <Icon className="w-4 h-4" /> {label}
                </button>
              ))}
            </div>

            {tab === 'campaigns' && (
              <div className="rounded-xl divide-y divide-[#1E1E2E]" style={card}>
                {campaigns.length === 0 && <p className="p-6 text-sm text-[#9A9AAA]">Henüz kampanya yok.</p>}
                {campaigns.map((c) => (
                  <div key={c.id} className="p-4 flex items-center gap-4">
                    <button className="flex-1 text-left" onClick={() => { setEditing(c); setMsg(null); setLang('tr'); }}>
                      <p className="text-white font-medium">{c.name}</p>
                      <p className="text-xs text-[#9A9AAA] mt-0.5">
                        {c.status === 'sent'
                          ? `Gönderildi ${new Date(c.sent_at).toLocaleDateString('tr-TR')} · ${c.sent_count} başarılı, ${c.failed_count} başarısız`
                          : 'Taslak'}
                      </p>
                      {c.status === 'sent' && <StatsRow c={c} st={stats[c.id]} pct={pct} compact />}
                    </button>
                    {c.status !== 'sent' && (
                      <button onClick={() => remove(c)} className="text-[#9A9AAA] hover:text-red-400" aria-label="Sil">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {tab === 'subs' && (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-3 text-sm text-[#9A9AAA]">
                  {LANGS.map((l) => (
                    <span key={l.code} className="px-3 py-1 rounded-full bg-white/5">{l.label}: {langCount(l.code)}</span>
                  ))}
                </div>
                <div className="rounded-xl overflow-x-auto" style={card}>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs text-[#9A9AAA] border-b border-[#1E1E2E]">
                        <th className="p-3">Ad</th><th className="p-3">E-posta</th><th className="p-3">Dil</th><th className="p-3">Ülke</th><th className="p-3">Onay tarihi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subs.length === 0 && (
                        <tr><td colSpan={5} className="p-6 text-[#9A9AAA]">Henüz onay veren üye yok (e-postasını doğrulamış üyeler listelenir).</td></tr>
                      )}
                      {subs.map((s) => (
                        <tr key={s.id} className="border-b border-[#1E1E2E] last:border-0 text-white">
                          <td className="p-3">{s.full_name || '-'}</td>
                          <td className="p-3">{s.email}</td>
                          <td className="p-3 uppercase">{s.lang}</td>
                          <td className="p-3">{s.country || '-'}</td>
                          <td className="p-3">{s.opted_in_at ? new Date(s.opted_in_at).toLocaleDateString('tr-TR') : '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {unsubs.length > 0 && (
                  <div className="rounded-xl overflow-x-auto" style={card}>
                    <p className="p-3 text-sm text-white font-medium">Abonelikten çıkanlar ({unsubs.length})</p>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-xs text-[#9A9AAA] border-b border-[#1E1E2E]">
                          <th className="p-3">Ad</th><th className="p-3">E-posta</th><th className="p-3">Dil</th><th className="p-3">Çıkış tarihi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {unsubs.map((u) => (
                          <tr key={u.id} className="border-b border-[#1E1E2E] last:border-0 text-white">
                            <td className="p-3">{u.full_name || '-'}</td>
                            <td className="p-3">{u.email}</td>
                            <td className="p-3 uppercase">{u.lang}</td>
                            <td className="p-3">{new Date(u.unsubscribed_at).toLocaleDateString('tr-TR')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}
