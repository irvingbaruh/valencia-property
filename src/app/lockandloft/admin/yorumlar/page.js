'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import AdminLayout from '@/components/admin/AdminLayout';
import { Star, Check, X, Trash2, Send } from 'lucide-react';

const card = { background: '#151521', border: '1px solid #1E1E2E' };
const TABS = [['pending', 'Bekleyen'], ['approved', 'Yayında'], ['rejected', 'Yayınlanmayan']];
const fmt = (d) => (d ? new Date(d).toLocaleString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '');

function Stars({ n }) {
  return <span className="inline-flex gap-0.5">{[1, 2, 3, 4, 5].map((i) => <Star key={i} size={16} className={i <= n ? 'text-[#C9A84C] fill-[#C9A84C]' : 'text-[#3A3A4A]'} />)}</span>;
}

export default function ReviewsAdmin() {
  const [tab, setTab] = useState('pending');
  const [rows, setRows] = useState([]);
  const [emails, setEmails] = useState({});
  const [replies, setReplies] = useState({});
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('reviews').select('*').order('created_at', { ascending: false }).limit(300);
    const all = data || [];
    setCounts(all.reduce((a, r) => ({ ...a, [r.status]: (a[r.status] || 0) + 1 }), {}));
    setRows(all);
    setReplies(Object.fromEntries(all.map((r) => [r.id, r.admin_reply || ''])));
    const ids = [...new Set(all.map((r) => r.user_id))];
    if (ids.length) {
      const { data: ps } = await supabase.from('profiles_with_email').select('id,email,full_name').in('id', ids);
      setEmails(Object.fromEntries((ps || []).map((p) => [p.id, p])));
    }
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const patch = async (r, fields) => {
    await supabase.from('reviews').update(fields).eq('id', r.id);
    load();
  };
  const approve = (r) => patch(r, { status: 'approved', published_at: new Date().toISOString(), admin_reply: (replies[r.id] || '').trim() || null });
  const reject = (r) => patch(r, { status: 'rejected', published_at: null });
  const saveReply = (r) => patch(r, { admin_reply: (replies[r.id] || '').trim() || null });
  const remove = async (r) => {
    if (!confirm('Bu yorum kalıcı olarak silinsin mi?')) return;
    await supabase.from('reviews').delete().eq('id', r.id);
    load();
  };

  const shown = rows.filter((r) => r.status === tab);

  return (
    <AdminLayout activeSection="yorumlar">
      <div className="p-6 lg:p-8 max-w-4xl">
        <h1 className="text-2xl font-semibold text-white">Yorumlar</h1>
        <p className="text-sm text-[#9A9AAA] mt-1 mb-6">Üyelerin yıldız ve yorumları. Onaylananlar anasayfadaki yorum kaydırıcısında görünür. Kararı yorumun olumlu veya olumsuz olmasına göre değil, uygunsuzluk ve gerçeklik kontrolüne göre verin.</p>

        <div className="flex gap-2 mb-6 flex-wrap">
          {TABS.map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} className="px-4 py-2 rounded-xl text-sm"
              style={{ background: tab === id ? '#C9A84C' : '#151521', color: tab === id ? '#0B0B11' : '#C8C8D4', border: '1px solid #1E1E2E' }}>
              {label} ({counts[id] || 0})
            </button>
          ))}
        </div>

        {loading && <p className="text-sm text-[#9A9AAA]">Yükleniyor…</p>}
        {!loading && shown.length === 0 && <p className="text-sm text-[#9A9AAA]">Bu listede yorum yok.</p>}

        <div className="space-y-4">
          {shown.map((r) => {
            const m = emails[r.user_id];
            return (
              <div key={r.id} className="rounded-2xl p-5" style={card}>
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-3"><Stars n={r.rating} /><span className="text-white font-medium">{r.display_name}</span></div>
                  <span className="text-xs text-[#6A6A7A]">{fmt(r.created_at)} · {(r.lang || '').toUpperCase()}</span>
                </div>
                {m && <p className="text-xs text-[#9A9AAA] mt-1">{m.full_name} · {m.email}</p>}
                <p className="text-sm text-[#E0E0EA] mt-3 whitespace-pre-line">{r.comment || <em className="text-[#6A6A7A]">Sadece yıldız verdi, yorum yazmadı.</em>}</p>

                <label className="block text-xs text-[#9A9AAA] mt-4 mb-1">Yanıtınız (isteğe bağlı, yorumla birlikte yayınlanır)</label>
                <textarea value={replies[r.id] || ''} onChange={(e) => setReplies({ ...replies, [r.id]: e.target.value })} rows={2} maxLength={1000}
                  className="w-full rounded-lg p-3 text-sm text-white" style={{ background: '#0B0B11', border: '1px solid #2A2A3A' }} />

                <div className="flex gap-2 mt-3 flex-wrap">
                  {r.status !== 'approved' && <button onClick={() => approve(r)} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium" style={{ background: '#C9A84C', color: '#0B0B11' }}><Check size={15} />Onayla ve yayınla</button>}
                  {r.status === 'approved' && <button onClick={() => saveReply(r)} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium" style={{ background: '#C9A84C', color: '#0B0B11' }}><Send size={15} />Yanıtı kaydet</button>}
                  {r.status !== 'rejected' && <button onClick={() => reject(r)} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm text-white" style={{ border: '1px solid #3A3A4A' }}><X size={15} />{r.status === 'approved' ? 'Yayından kaldır' : 'Yayınlama'}</button>}
                  <button onClick={() => remove(r)} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm text-red-300" style={{ border: '1px solid #3A2A2A' }}><Trash2 size={15} />Sil</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AdminLayout>
  );
}
