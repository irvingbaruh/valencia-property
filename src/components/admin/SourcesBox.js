'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { channelLabel, CHANNEL_COLOR } from '@/lib/leads';

const card = { background: '#151521', border: '1px solid #1E1E2E' };
const inner = { background: '#0B0B11', border: '1px solid #1E1E2E' };
const input = 'w-full rounded-lg px-3 py-2 text-sm text-white placeholder:text-[#6A6A7A] outline-none focus:ring-2 focus:ring-[#C9A84C]/50';
const nf = (n) => new Intl.NumberFormat('tr-TR').format(n || 0);
const SOURCES = [['instagram', 'Instagram'], ['youtube', 'YouTube'], ['facebook', 'Facebook'], ['whatsapp', 'WhatsApp'], ['tiktok', 'TikTok'], ['linkedin', 'LinkedIn'], ['email', 'E-posta'], ['referans', 'Tavsiye / diğer']];
const MEDIUMS = [['social', 'Paylaşım / profil linki'], ['paid', 'Ücretli reklam'], ['video', 'Video açıklaması'], ['story', 'Hikâye'], ['email', 'E-posta'], ['referral', 'Tavsiye']];
const PAGES = [['/tr/', 'Ana sayfa (TR)'], ['/tr/valencia-mi-alicante-mi/', 'Valencia mı Alicante mı? testi'], ['/tr/rehber/', 'Rehber'], ['/tr/mulkler/', 'İlanlar'], ['/tr/yasam-maliyeti/', 'Yaşam maliyeti'], ['/tr/vize/', 'Vize ve oturum'], ['/tr/hizmetler/', 'Hizmetler'], ['/tr/giris/?mode=register', 'Üyelik sayfası']];
const slug = (s) => s.toLowerCase().trim().replace(/[çğıöşü]/g, (c) => ({ ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u' }[c])).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50);

// Where members and tagged visits come from, plus a builder for tagged links to use in posts, bios and ads.
export default function SourcesBox({ stats }) {
  const [src, setSrc] = useState('instagram');
  const [med, setMed] = useState('social');
  const [page, setPage] = useState('/tr/');
  const [camp, setCamp] = useState('');
  const [copied, setCopied] = useState(false);
  const q = new URLSearchParams({ utm_source: src, utm_medium: med, ...(slug(camp) ? { utm_campaign: slug(camp) } : {}) });
  const url = `https://lockandloft.com${page}${page.includes('?') ? '&' : '?'}${q.toString()}`;
  const copy = async () => {
    try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch {}
  };
  const members = stats?.members || [];
  const total = members.reduce((n, r) => n + Number(r.members), 0);

  return (
    <section className="rounded-xl p-5 space-y-5" style={card}>
      <div>
        <h2 className="text-base font-semibold text-white">Üyeler hangi kanaldan geldi?</h2>
        <p className="text-xs text-[#6A6A7A] mt-1">Üyenin siteye ilk geldiği kaynak (son 90 gün içindeki ilk ziyaret). Bu özellikten önceki üyeler “Bilinmiyor” görünür.</p>
      </div>
      {members.length === 0 ? <p className="text-sm text-[#9A9AAA]">Bu aralıkta yeni üye yok.</p> : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-xs text-[#9A9AAA]"><th className="py-2 font-medium">Kanal</th><th className="py-2 font-medium text-right">Üye</th><th className="py-2 font-medium text-right">Form</th><th className="py-2 font-medium text-right">Görüşme</th><th className="py-2 font-medium text-right">Müşteri</th></tr></thead>
            <tbody className="divide-y divide-[#1E1E2E]">
              {members.map((r) => (
                <tr key={r.channel}>
                  <td className="py-2"><span style={{ color: CHANNEL_COLOR(r.channel) }}>{channelLabel(r.channel)}</span><span className="ml-2 text-xs text-[#6A6A7A]">%{total ? Math.round((r.members / total) * 100) : 0}</span></td>
                  <td className="py-2 text-right text-white tabular-nums">{nf(r.members)}</td>
                  <td className="py-2 text-right text-[#9A9AAA] tabular-nums">{nf(r.intakes)}</td>
                  <td className="py-2 text-right text-[#9A9AAA] tabular-nums">{nf(r.calls)}</td>
                  <td className="py-2 text-right text-[#C9A84C] tabular-nums">{nf(r.clients)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(stats?.campaigns || []).length > 0 && (
        <div>
          <p className="text-sm font-semibold text-white mb-2">Kampanya bazında üyeler</p>
          <ul className="divide-y divide-[#1E1E2E] text-sm">
            {stats.campaigns.map((r) => <li key={`${r.channel}|${r.campaign}`} className="py-2 flex justify-between gap-3"><span className="text-white break-all">{r.campaign}<span className="ml-2 text-xs text-[#6A6A7A]">{channelLabel(r.channel)}</span></span><span className="text-[#C9A84C] tabular-nums">{nf(r.members)}</span></li>)}
          </ul>
        </div>
      )}

      {(stats?.visits || []).length > 0 && (
        <div>
          <p className="text-sm font-semibold text-white mb-2">Etiketli bağlantılardan gelen ziyaretler</p>
          <ul className="divide-y divide-[#1E1E2E] text-sm">
            {stats.visits.map((r) => <li key={`${r.src}|${r.campaign}`} className="py-2 flex justify-between gap-3"><span className="text-white break-all">{channelLabel(r.src)}{r.campaign ? <span className="ml-2 text-xs text-[#6A6A7A]">{r.campaign}</span> : null}</span><span className="text-[#9A9AAA] tabular-nums">{nf(r.visitors)} ziyaretçi · {nf(r.views)} görüntüleme</span></li>)}
          </ul>
        </div>
      )}

      <div className="rounded-lg p-4 space-y-3" style={inner}>
        <div>
          <p className="text-sm font-semibold text-white">Etiketli bağlantı oluştur</p>
          <p className="text-xs text-[#6A6A7A] mt-1">Instagram profilinize, video açıklamalarına ve reklamlara düz adres yerine bu bağlantıyı koyun; kimin nereden geldiği yukarıda görünür. Instagram ve WhatsApp uygulamaları kaynak bilgisini göndermediği için etiketsiz bağlantılar “Doğrudan” sayılır.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <label className="block"><span className="text-xs text-[#9A9AAA]">Nerede paylaşılacak?</span><select value={src} onChange={(e) => setSrc(e.target.value)} className={`${input} mt-1`} style={card}>{SOURCES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></label>
          <label className="block"><span className="text-xs text-[#9A9AAA]">Tür</span><select value={med} onChange={(e) => setMed(e.target.value)} className={`${input} mt-1`} style={card}>{MEDIUMS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></label>
          <label className="block"><span className="text-xs text-[#9A9AAA]">Hangi sayfaya gitsin?</span><select value={page} onChange={(e) => setPage(e.target.value)} className={`${input} mt-1`} style={card}>{PAGES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></label>
          <label className="block"><span className="text-xs text-[#9A9AAA]">Kampanya adı (isteğe bağlı)</span><input value={camp} onChange={(e) => setCamp(e.target.value)} placeholder="örn. ruzafa-video" className={`${input} mt-1`} style={card} /></label>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <code className="flex-1 rounded-lg px-3 py-2 text-xs text-[#C9A84C] break-all" style={card}>{url}</code>
          <button onClick={copy} className="inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium bg-[#C9A84C] text-[#0B0B11]">{copied ? <><Check className="w-4 h-4" />Kopyalandı</> : <><Copy className="w-4 h-4" />Kopyala</>}</button>
        </div>
      </div>
    </section>
  );
}
