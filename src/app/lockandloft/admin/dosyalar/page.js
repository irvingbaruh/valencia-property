'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import AdminLayout, { ADMIN_BASE } from '@/components/admin/AdminLayout';
import { notifyMember, TEXT } from '@/lib/adminServices';
import { openDocument } from '@/lib/documents';
import { FileText, Download, Check, X, Search } from 'lucide-react';

const card = { background: '#151521', border: '1px solid #1E1E2E' };
const inner = { background: '#0B0B11', border: '1px solid #1E1E2E' };
const DOC_STATUS = {
  uploaded: { label: 'Yüklendi', color: '#3B82F6' },
  reviewing: { label: 'İnceleniyor', color: '#F59E0B' },
  approved: { label: 'Onaylandı', color: '#22C55E' },
  rejected: { label: 'Reddedildi', color: '#DC1C2E' },
};
const FILTERS = [
  ['all', 'Tümü'],
  ['pending', 'İnceleme bekleyen'],
  ['approved', 'Onaylanan'],
  ['rejected', 'Reddedilen'],
];
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }) : '—';
const fmtSize = (n) => (n ? (n > 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`) : '');

function Files() {
  const [docs, setDocs] = useState([]);
  const [members, setMembers] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [q, setQ] = useState('');
  const [rejecting, setRejecting] = useState(null);
  const [reason, setReason] = useState('');

  const load = useCallback(async () => {
    const { data } = await supabase.from('documents').select('*').order('created_at', { ascending: false }).limit(500);
    const rows = data || [];
    setDocs(rows);
    const ids = [...new Set(rows.map((d) => d.user_id))];
    if (ids.length) {
      const { data: ps } = await supabase.from('profiles_with_email').select('id, full_name, email').in('id', ids);
      setMembers(Object.fromEntries((ps || []).map((p) => [p.id, p])));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const review = async (doc, status, rejectionReason) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    await supabase
      .from('documents')
      .update({
        status,
        rejection_reason: status === 'rejected' ? rejectionReason || null : null,
        reviewed_by: user?.id,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', doc.id);
    await notifyMember({
      userId: doc.user_id,
      type: status === 'approved' ? 'document_approved' : 'document_rejected',
      ...TEXT.document(status === 'approved', doc.file_name, rejectionReason),
      clientServiceId: doc.client_service_id,
    });
    setRejecting(null);
    setReason('');
    load();
  };

  const counts = useMemo(
    () => ({
      all: docs.length,
      pending: docs.filter((d) => d.status === 'uploaded' || d.status === 'reviewing').length,
      approved: docs.filter((d) => d.status === 'approved').length,
      rejected: docs.filter((d) => d.status === 'rejected').length,
    }),
    [docs]
  );

  const shown = docs.filter((d) => {
    if (filter === 'pending' && !(d.status === 'uploaded' || d.status === 'reviewing')) return false;
    if (filter === 'approved' && d.status !== 'approved') return false;
    if (filter === 'rejected' && d.status !== 'rejected') return false;
    const m = members[d.user_id];
    const hay = `${d.file_name} ${m?.full_name || ''} ${m?.email || ''}`.toLowerCase();
    return !q.trim() || hay.includes(q.trim().toLowerCase());
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-white">Dosyalar</h1>
        <p className="text-sm text-[#9A9AAA] mt-1">Üyelerin yüklediği tüm belgeler. Onaylayınca ya da reddedince üyeye bildirim gider.</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map(([id, label]) => (
            <button
              key={id}
              onClick={() => setFilter(id)}
              className={`px-3.5 py-2 rounded-lg text-sm transition-colors ${filter === id ? 'text-[#C9A84C]' : 'text-[#9A9AAA] hover:text-white'}`}
              style={filter === id ? { background: 'rgba(201,168,76,0.15)' } : inner}
            >
              {label} <span className="text-xs opacity-70">({counts[id]})</span>
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-[12rem] max-w-xs ml-auto">
          <Search className="w-4 h-4 text-[#6A6A7A] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Dosya veya üye ara"
            className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-[#0E0E18] border border-[#2A2A3C] text-white text-sm focus:outline-none focus:border-[#C9A84C]"
          />
        </div>
      </div>

      <section className="rounded-xl p-5" style={card}>
        {loading ? (
          <p className="text-sm text-[#9A9AAA]">Yükleniyor…</p>
        ) : shown.length === 0 ? (
          <p className="text-sm text-[#9A9AAA]">Bu filtrede dosya yok.</p>
        ) : (
          <ul className="space-y-2">
            {shown.map((d) => {
              const sc = DOC_STATUS[d.status] || DOC_STATUS.uploaded;
              const m = members[d.user_id];
              return (
                <li key={d.id} className="rounded-lg px-4 py-3" style={inner}>
                  <div className="flex flex-wrap items-center gap-3">
                    <FileText className="w-4 h-4 text-[#9A9AAA] shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{d.file_name}</p>
                      <p className="text-[11px] text-[#6A6A7A]">
                        <Link href={`${ADMIN_BASE}/uyeler/detay/?id=${d.user_id}`} className="text-[#C9A84C] hover:underline">
                          {m?.full_name || m?.email || 'Üye'}
                        </Link>
                        {' • '}
                        {fmtDate(d.created_at)}
                        {fmtSize(d.file_size) ? ` • ${fmtSize(d.file_size)}` : ''}
                      </p>
                      {d.status === 'rejected' && d.rejection_reason && (
                        <p className="text-xs text-red-400 mt-0.5">{d.rejection_reason}</p>
                      )}
                    </div>
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full shrink-0" style={{ background: `${sc.color}20`, color: sc.color }}>
                      {sc.label}
                    </span>
                    <button onClick={() => openDocument(d.storage_path)} aria-label="Dosyayı aç" className="p-2 rounded-lg text-[#9A9AAA] hover:text-white hover:bg-white/10">
                      <Download className="w-4 h-4" />
                    </button>
                    {d.status !== 'approved' && (
                      <button onClick={() => review(d, 'approved')} aria-label="Onayla" className="p-2 rounded-lg text-green-400 hover:bg-green-500/10">
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    {d.status !== 'rejected' && (
                      <button
                        onClick={() => {
                          setRejecting(d.id);
                          setReason('');
                        }}
                        aria-label="Reddet"
                        className="p-2 rounded-lg text-red-400 hover:bg-red-500/10"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  {rejecting === d.id && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      <input
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Ret nedeni (üyeye gösterilir)"
                        className="flex-1 min-w-[12rem] px-3 py-2 rounded-lg bg-[#0E0E18] border border-[#2A2A3C] text-white text-sm focus:outline-none focus:border-[#C9A84C]"
                      />
                      <button onClick={() => review(d, 'rejected', reason)} className="px-3 py-2 rounded-lg text-sm bg-[#DC1C2E] text-white">
                        Reddet
                      </button>
                      <button onClick={() => setRejecting(null)} className="px-3 py-2 rounded-lg text-sm text-[#9A9AAA]">
                        Vazgeç
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

export default function AdminFilesPage() {
  return (
    <AdminLayout activeSection="dosyalar">
      <Files />
    </AdminLayout>
  );
}
