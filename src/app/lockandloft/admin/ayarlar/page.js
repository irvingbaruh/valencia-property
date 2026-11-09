'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/providers/AuthProvider';
import AdminLayout from '@/components/admin/AdminLayout';
import PushSettings from '@/components/admin/PushSettings';
import { PasswordSection, MfaSection } from '@/components/admin/SecuritySections';
import { CONTACT_DEFAULTS, waDigits } from '@/lib/siteSettings';

const card = { background: '#151521', border: '1px solid #1E1E2E' };
const inputCls =
  'w-full px-3 py-2.5 rounded-lg bg-[#0E0E18] border border-[#2A2A3C] text-white text-sm focus:outline-none focus:border-[#C9A84C]';
const TABS = [
  ['site', 'Site bilgileri'],
  ['alerts', 'E-posta bildirimleri'],
  ['phone', 'Telefon uygulaması'],
  ['account', 'Hesabım'],
];
const NOTIFY_DEFAULTS = { emails: [], contact_message: true, intake: true, member: false, document_upload: true, doc_delete_request: true };

const saveSetting = (key, value, isPublic) =>
  supabase.from('site_settings').upsert({ key, value, is_public: isPublic, updated_at: new Date().toISOString() });

function Flash({ msg }) {
  if (!msg) return null;
  return (
    <p className={`text-sm ${msg.ok ? 'text-green-400' : 'text-red-400'}`} role="status">
      {msg.text}
    </p>
  );
}

function SaveButton({ saving }) {
  return (
    <button
      type="submit"
      disabled={saving}
      className="px-5 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50"
      style={{ background: '#C9A84C', color: '#0B0B11' }}
    >
      {saving ? 'Kaydediliyor…' : 'Kaydet'}
    </button>
  );
}

function SiteSection() {
  const [f, setF] = useState(CONTACT_DEFAULTS);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'contact')
      .maybeSingle()
      .then(({ data }) => data?.value && setF({ ...CONTACT_DEFAULTS, ...data.value }));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setMsg(null);
    const email = f.email.trim();
    const whatsapp = waDigits(f.whatsapp);
    if (!/^\S+@\S+\.\S+$/.test(email)) return setMsg({ ok: false, text: 'Geçerli bir e-posta adresi girin.' });
    if (whatsapp.length < 8) return setMsg({ ok: false, text: 'WhatsApp numarası ülke koduyla yazılmalı (örn. 34656738556).' });
    if (!f.phone.trim()) return setMsg({ ok: false, text: 'Telefon numarasını girin.' });
    setSaving(true);
    const value = { phone: f.phone.trim(), whatsapp, email };
    const { error } = await saveSetting('contact', value, true);
    setSaving(false);
    if (error) return setMsg({ ok: false, text: 'Kaydedilemedi. Lütfen tekrar deneyin.' });
    try {
      sessionStorage.removeItem('ll_contact_v1');
    } catch {}
    setF(value);
    setMsg({ ok: true, text: 'Kaydedildi. Değişiklik sitede kısa süre içinde görünür.' });
  };

  return (
    <form onSubmit={submit} className="rounded-xl p-5 space-y-4" style={card}>
      <div>
        <h2 className="text-base font-semibold text-white">İletişim bilgileri</h2>
        <p className="text-sm text-[#9A9AAA] mt-1">
          Sayfanın alt bilgisinde, iletişim sayfasında ve “Bizi arayın” düğmesinde görünür.
        </p>
      </div>
      <div>
        <label className="block text-xs text-[#9A9AAA] mb-1.5">Telefon</label>
        <input className={inputCls} value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} placeholder="+34 656 738 556" />
      </div>
      <div>
        <label className="block text-xs text-[#9A9AAA] mb-1.5">WhatsApp numarası (ülke koduyla)</label>
        <input className={inputCls} value={f.whatsapp} onChange={(e) => setF({ ...f, whatsapp: e.target.value })} placeholder="34656738556" />
        <p className="text-xs text-[#6A6A7A] mt-1.5">Boşluk ve + işareti otomatik temizlenir.</p>
      </div>
      <div>
        <label className="block text-xs text-[#9A9AAA] mb-1.5">E-posta</label>
        <input type="email" className={inputCls} value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} placeholder="info@lockandloft.com" />
      </div>
      <p className="text-xs text-[#6A6A7A]">
        Not: Bültenin gönderen adresi ve e-posta altbilgileri buradan değişmez; onlar e-posta servisi ayarındadır.
      </p>
      <Flash msg={msg} />
      <SaveButton saving={saving} />
    </form>
  );
}

function AlertsSection() {
  const [cfg, setCfg] = useState(NOTIFY_DEFAULTS);
  const [emailsText, setEmailsText] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'admin_notifications')
      .maybeSingle()
      .then(({ data }) => {
        const v = { ...NOTIFY_DEFAULTS, ...(data?.value || {}) };
        setCfg(v);
        setEmailsText((v.emails || []).join(', '));
      });
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setMsg(null);
    const emails = emailsText
      .split(/[,;\s]+/)
      .map((x) => x.trim())
      .filter(Boolean);
    if (emails.some((x) => !/^\S+@\S+\.\S+$/.test(x))) return setMsg({ ok: false, text: 'E-posta adreslerinden biri geçersiz.' });
    if (emails.length > 5) return setMsg({ ok: false, text: 'En fazla 5 adres girebilirsiniz.' });
    setSaving(true);
    const { error } = await saveSetting('admin_notifications', { ...cfg, emails }, false);
    setSaving(false);
    if (error) return setMsg({ ok: false, text: 'Kaydedilemedi. Lütfen tekrar deneyin.' });
    setCfg({ ...cfg, emails });
    setMsg({ ok: true, text: 'Kaydedildi.' });
  };

  const Toggle = ({ k, label, hint }) => (
    <label className="flex items-start gap-3 cursor-pointer">
      <input type="checkbox" checked={Boolean(cfg[k])} onChange={(e) => setCfg({ ...cfg, [k]: e.target.checked })} className="mt-1 accent-[#C9A84C]" />
      <span>
        <span className="text-sm text-white">{label}</span>
        <span className="block text-xs text-[#6A6A7A]">{hint}</span>
      </span>
    </label>
  );

  return (
    <form onSubmit={submit} className="rounded-xl p-5 space-y-5" style={card}>
      <div>
        <h2 className="text-base font-semibold text-white">Bana e-posta gönder</h2>
        <p className="text-sm text-[#9A9AAA] mt-1">Sitede yeni bir şey olunca panele girmeden haberiniz olsun.</p>
      </div>
      <div>
        <label className="block text-xs text-[#9A9AAA] mb-1.5">Bildirim adresleri (virgülle ayırın)</label>
        <input className={inputCls} value={emailsText} onChange={(e) => setEmailsText(e.target.value)} placeholder="info@lockandloft.com" />
      </div>
      <div className="space-y-3">
        <Toggle k="contact_message" label="Yeni iletişim mesajı" hint="İletişim formundan biri yazınca." />
        <Toggle k="intake" label="Yeni danışmanlık talebi" hint="Biri danışmanlık formunu gönderince." />
        <Toggle k="document_upload" label="Üye yeni belge yükledi" hint="Üye kendi panelinden dosya yükleyince (sizin yüklediğiniz dosyalar bildirim üretmez)." />
        <Toggle k="doc_delete_request" label="Belge silme isteği" hint="Üye bir belgeyi silmek için istek gönderince, nedeniyle birlikte." />
        <Toggle k="member" label="Yeni üye" hint="Herhangi bir yolla yeni üyelik oluşunca (danışmanlık formu da üyelik açar, ikisini açarsanız iki e-posta gelir)." />
      </div>
      <Flash msg={msg} />
      <SaveButton saving={saving} />
    </form>
  );
}

function AccountSection() {
  const { user, profile } = useAuth();
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    if (profile?.full_name) setName(profile.full_name);
  }, [profile?.full_name]);

  const submit = async (e) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setMsg(null);
    const { error } = await supabase.from('profiles').update({ full_name: name.trim() }).eq('id', user.id);
    setSaving(false);
    setMsg(error ? { ok: false, text: 'Kaydedilemedi.' } : { ok: true, text: 'Adınız kaydedildi.' });
  };

  return (
    <div className="space-y-6">
      <form onSubmit={submit} className="rounded-xl p-5 space-y-4" style={card}>
        <h2 className="text-base font-semibold text-white">Profilim</h2>
        <div>
          <label className="block text-xs text-[#9A9AAA] mb-1.5">Ad Soyad</label>
          <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="block text-xs text-[#9A9AAA] mb-1.5">E-posta (giriş adresi)</label>
          <p className="px-3 py-2.5 rounded-lg bg-[#0E0E18] border border-[#2A2A3C] text-sm text-[#9A9AAA]">{user?.email}</p>
        </div>
        <Flash msg={msg} />
        <SaveButton saving={saving} />
      </form>
      <PasswordSection email={user?.email || ''} />
      <MfaSection />
    </div>
  );
}

function Settings() {
  const [tab, setTab] = useState('site');

  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get('tab');
    if (TABS.some(([id]) => id === t)) setTab(t);
  }, []);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Ayarlar</h1>
        <p className="text-sm text-[#9A9AAA] mt-1">Site bilgileri, e-posta bildirimleri ve hesabınız.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {TABS.map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`px-3.5 py-2 rounded-lg text-sm transition-colors ${tab === id ? 'text-[#C9A84C]' : 'text-[#9A9AAA] hover:text-white'}`}
            style={tab === id ? { background: 'rgba(201,168,76,0.15)' } : { background: '#0B0B11', border: '1px solid #1E1E2E' }}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === 'site' && <SiteSection />}
      {tab === 'alerts' && <AlertsSection />}
      {tab === 'phone' && <PushSettings />}
      {tab === 'account' && <AccountSection />}
    </div>
  );
}

export default function AdminSettingsPage() {
  return (
    <AdminLayout activeSection="ayarlar">
      <Settings />
    </AdminLayout>
  );
}
