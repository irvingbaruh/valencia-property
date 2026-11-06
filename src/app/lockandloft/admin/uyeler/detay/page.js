'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import AdminLayout, { ADMIN_BASE } from '@/components/admin/AdminLayout';
import { assignService, setStageStatus, setServiceStatus, notifyMember, TEXT } from '@/lib/adminServices';
import DocumentManager from '@/components/documents/DocumentManager';
import trMessages from '@/messages/tr.json';
import {
  ArrowLeft,
  Mail,
  Phone,
  Globe,
  Calendar,
  MapPin,
  Briefcase,
  FileText,
  Download,
  Check,
  X,
  Plus,
  Upload,
  Clock,
  ChevronDown,
} from 'lucide-react';

const card = { background: '#151521', border: '1px solid #1E1E2E' };
const inner = { background: '#0B0B11', border: '1px solid #1E1E2E' };

const SERVICE_STATUS = {
  active: { label: 'Aktif', color: '#22C55E' },
  paused: { label: 'Durduruldu', color: '#F59E0B' },
  completed: { label: 'Tamamlandı', color: '#C9A84C' },
  cancelled: { label: 'İptal', color: '#DC1C2E' },
  pending: { label: 'Beklemede', color: '#9A9AAA' },
};

const STAGE_STATUS = {
  pending: { label: 'Beklemede', color: '#6A6A7A' },
  in_progress: { label: 'Devam ediyor', color: '#3B82F6' },
  completed: { label: 'Tamamlandı', color: '#22C55E' },
  skipped: { label: 'Atlandı', color: '#6A6A7A' },
};

const DOC_STATUS = {
  uploaded: { label: 'Yüklendi', color: '#3B82F6' },
  reviewing: { label: 'İnceleniyor', color: '#F59E0B' },
  approved: { label: 'Onaylandı', color: '#22C55E' },
  rejected: { label: 'Reddedildi', color: '#DC1C2E' },
};

const RESIDENCE = { yes: 'Var', no: 'Yok', in_progress: 'Başvuru sürecinde' };

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }) : '—';

function Pill({ color, children }) {
  return (
    <span className="text-xs font-medium px-2.5 py-1 rounded-full shrink-0" style={{ background: `${color}20`, color }}>
      {children}
    </span>
  );
}

function Fact({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="w-4 h-4 mt-0.5 text-[#9A9AAA] shrink-0" />
      <div className="min-w-0">
        <p className="text-xs text-[#9A9AAA]">{label}</p>
        <p className="text-sm text-white break-words">{value || '—'}</p>
      </div>
    </div>
  );
}

function ServiceCard({ service, stages, memberId, onChanged }) {
  const [busy, setBusy] = useState(null);
  const conf = SERVICE_STATUS[service.status] || SERVICE_STATUS.pending;
  const done = stages.filter((s) => s.status === 'completed').length;
  const progress = stages.length ? Math.round((done / stages.length) * 100) : 0;

  const advance = async (stageId, newStatus) => {
    setBusy(stageId);
    await setStageStatus({ service, memberId, stages, stageId, newStatus });
    setBusy(null);
    onChanged();
  };

  const changeStatus = async (status) => {
    setBusy('service');
    await setServiceStatus({ service, memberId, status });
    setBusy(null);
    onChanged();
  };

  return (
    <div className="rounded-xl p-5" style={inner}>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div>
          <p className="font-semibold text-white">{service.service_template?.name_tr}</p>
          <p className="text-xs text-[#9A9AAA] mt-0.5">Atanma: {fmtDate(service.created_at)}</p>
        </div>
        <div className="flex items-center gap-2">
          <Pill color={conf.color}>{conf.label}</Pill>
          <select
            aria-label="Hizmet durumunu değiştir"
            value={service.status}
            disabled={busy === 'service'}
            onChange={(e) => changeStatus(e.target.value)}
            className="text-xs rounded-lg px-2 py-1.5 text-white outline-none"
            style={{ background: '#151521', border: '1px solid #1E1E2E' }}
          >
            <option value="active">Aktif</option>
            <option value="paused">Durdur</option>
            <option value="completed">Tamamlandı</option>
            <option value="cancelled">İptal et</option>
          </select>
        </div>
      </div>

      {stages.length > 0 && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-[#9A9AAA] mb-1.5">
            <span>İlerleme</span>
            <span>
              {done}/{stages.length} aşama • %{progress}
            </span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: '#1E1E2E' }}>
            <div className="h-full rounded-full" style={{ width: `${progress}%`, background: progress === 100 ? '#22C55E' : '#C9A84C' }} />
          </div>
        </div>
      )}

      <ol className="space-y-2">
        {stages.map((st, idx) => {
          const sc = STAGE_STATUS[st.status] || STAGE_STATUS.pending;
          return (
            <li
              key={st.id}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg"
              style={{ background: st.status === 'in_progress' ? 'rgba(59,130,246,0.08)' : '#151521' }}
            >
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                style={{ background: sc.color }}
              >
                {st.status === 'completed' ? '✓' : idx + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${st.status === 'completed' ? 'text-[#6A6A7A] line-through' : 'text-white'}`}>
                  {st.stage_template?.name_tr}
                </p>
                {st.completed_at && <p className="text-[11px] text-[#6A6A7A]">Bitti: {fmtDate(st.completed_at)}</p>}
              </div>
              <Pill color={sc.color}>{sc.label}</Pill>
              {st.status === 'pending' && (
                <button
                  disabled={busy === st.id}
                  onClick={() => advance(st.id, 'in_progress')}
                  className="text-xs px-2.5 py-1.5 rounded-lg text-white disabled:opacity-50"
                  style={{ background: '#1E1E2E' }}
                >
                  Başlat
                </button>
              )}
              {st.status === 'in_progress' && (
                <button
                  disabled={busy === st.id}
                  onClick={() => advance(st.id, 'completed')}
                  className="text-xs px-2.5 py-1.5 rounded-lg font-medium disabled:opacity-50"
                  style={{ background: '#C9A84C', color: '#0B0B11' }}
                >
                  Tamamla
                </button>
              )}
            </li>
          );
        })}
      </ol>

      {service.notes && <p className="mt-3 text-xs text-[#C9A84C]/90">Not: {service.notes}</p>}
    </div>
  );
}

function AssignBox({ memberId, templates, onAssigned }) {
  const [open, setOpen] = useState(false);
  const [templateId, setTemplateId] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    const template = templates.find((t) => t.id === templateId);
    if (!template) return;
    setSaving(true);
    setError('');
    const { error: err } = await assignService({ memberId, template, notes });
    setSaving(false);
    if (err) {
      setError('Hizmet atanamadı. Tekrar deneyin.');
      return;
    }
    setOpen(false);
    setTemplateId('');
    setNotes('');
    onAssigned();
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium"
        style={{ background: 'rgba(201,168,76,0.15)', color: '#C9A84C' }}
      >
        <Plus className="w-4 h-4" />
        Hizmet ata
      </button>
    );
  }

  return (
    <div className="rounded-xl p-4 space-y-3" style={inner}>
      <select
        value={templateId}
        onChange={(e) => setTemplateId(e.target.value)}
        className="w-full rounded-lg px-3 py-2.5 text-sm text-white outline-none"
        style={{ background: '#151521', border: '1px solid #1E1E2E' }}
      >
        <option value="">Hizmet seçin…</option>
        {templates.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name_tr}
          </option>
        ))}
      </select>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={2}
        placeholder="Not (isteğe bağlı)"
        className="w-full rounded-lg px-3 py-2.5 text-sm text-white outline-none placeholder:text-[#6A6A7A]"
        style={{ background: '#151521', border: '1px solid #1E1E2E' }}
      />
      {error && <p className="text-sm text-red-400">{error}</p>}
      <div className="flex gap-2">
        <button
          onClick={submit}
          disabled={!templateId || saving}
          className="px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
          style={{ background: '#C9A84C', color: '#0B0B11' }}
        >
          {saving ? 'Atanıyor…' : 'Ata'}
        </button>
        <button onClick={() => setOpen(false)} className="px-4 py-2 rounded-lg text-sm text-[#9A9AAA] hover:text-white">
          Vazgeç
        </button>
      </div>
    </div>
  );
}

function DocumentsSection({ memberId, services }) {
  const [note, setNote] = useState('');
  const [sent, setSent] = useState(false);
  const requestDoc = async () => {
    if (!note.trim()) return;
    await notifyMember({ userId: memberId, type: 'document_request', ...TEXT.documentRequested(note.trim()) });
    setNote('');
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  };
  return (
    <section className="rounded-xl p-5 space-y-4" style={card}>
      <h2 className="flex items-center gap-2 text-base font-semibold text-white">
        <FileText className="w-4 h-4 text-[#C9A84C]" />
        Dosyalar
      </h2>
      <div className="rounded-lg px-4 py-3 flex flex-wrap items-center gap-2" style={inner}>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Üyeden istenen belge (örn. Pasaport kopyası)"
          className="flex-1 min-w-[12rem] px-3 py-2 rounded-lg bg-[#0E0E18] border border-[#2A2A3C] text-white text-sm focus:outline-none focus:border-[#C9A84C]"
        />
        <button onClick={requestDoc} disabled={!note.trim()} className="px-3 py-2 rounded-lg text-sm font-medium disabled:opacity-40" style={{ background: 'rgba(201,168,76,0.15)', color: '#C9A84C' }}>
          Belge iste
        </button>
        {sent && <span className="text-xs text-green-400">Üyeye bildirim ve e-posta gönderildi.</span>}
      </div>
      <DocumentManager memberId={memberId} isAdmin lang="tr" services={services.map((s) => ({ id: s.id, name: s.service_template?.name_tr }))} />
    </section>
  );
}

const lab = (k, v) => trMessages.consult.o[k]?.[v] || v;

// The answers the member gave in the consultation form (stored with the account at sign-up)
function IntakeCard({ intake, services, templates, memberId, onChanged }) {
  const [busy, setBusy] = useState('');
  const [open, setOpen] = useState(false);
  const a = intake.answers || {};
  const assigned = new Set(services.map((s) => s.service_template?.slug));
  const requested = (intake.selected_services || [])
    .map((slug) => templates.find((tpl) => tpl.slug === slug))
    .filter(Boolean);

  const ORDER = [
    'investType', 'timeframe', 'readyToBuy', 'purpose', 'priority', 'rentalType', 'holdYears',
    'area', 'condition', 'propertyType', 'bedrooms', 'bathrooms', 'unwanted', 'furnished',
    'budget', 'budgetIncludes', 'payment', 'targetRent', 'renovation', 'management',
    'nationality', 'residency', 'nie', 'bank', 'legal', 'note',
  ];
  const rows = ORDER.map((k) => [
    trMessages.consult.q[k]?.title || k,
    a[k] && (trMessages.consult.o[k] ? lab(k, a[k]) : a[k]),
  ]).filter(([, v]) => v);

  const assign = async (tpl) => {
    setBusy(tpl.id);
    await assignService({ memberId, template: tpl });
    setBusy('');
    onChanged();
  };

  return (
    <section className="rounded-xl p-5 space-y-4" style={card}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex flex-wrap items-center justify-between gap-3 text-left"
      >
        <h2 className="flex items-center gap-2 text-base font-semibold text-white">
          <FileText className="w-4 h-4 text-[#C9A84C]" />
          Danışmanlık talebi
          <span className="text-xs font-normal text-[#9A9AAA]">({rows.length} yanıt)</span>
        </h2>
        <span className="flex items-center gap-3 text-xs text-[#9A9AAA]">
          {fmtDate(intake.submitted_at || intake.created_at)}
          <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
        </span>
      </button>
      {open && (
      <div className="space-y-4">
      <dl className="grid gap-y-3 pt-1">
        {rows.map(([k, v]) => (
          <div key={k}>
            <dt className="text-xs text-[#9A9AAA]">{k}</dt>
            <dd className="text-sm text-white">{v}</dd>
          </div>
        ))}
      </dl>
      {requested.length > 0 && (
        <div>
          <p className="text-xs text-[#9A9AAA] mb-2">İstenen hizmetler</p>
          <div className="flex flex-wrap gap-2">
            {requested.map((tpl) =>
              assigned.has(tpl.slug) ? (
                <span key={tpl.id} className="text-xs px-3 py-1.5 rounded-full bg-[#22C55E]/15 text-[#22C55E]">
                  {tpl.name_tr} ✓
                </span>
              ) : (
                <button
                  key={tpl.id}
                  onClick={() => assign(tpl)}
                  disabled={busy === tpl.id}
                  className="text-xs px-3 py-1.5 rounded-full border border-[#C9A84C]/50 text-[#C9A84C] hover:bg-[#C9A84C]/10 disabled:opacity-50"
                >
                  {busy === tpl.id ? '…' : `${tpl.name_tr} — ata`}
                </button>
              )
            )}
          </div>
        </div>
      )}
      </div>
      )}
    </section>
  );
}

function MemberDetail() {
  const params = useSearchParams();
  const memberId = params.get('id');

  const [member, setMember] = useState(null);
  const [services, setServices] = useState([]);
  const [stagesByService, setStagesByService] = useState({});
  const [docs, setDocs] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [activity, setActivity] = useState([]);
  const [intake, setIntake] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const load = useCallback(async () => {
    if (!memberId) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    const [m, svc, d, t, a, ik] = await Promise.all([
      supabase.from('profiles_with_email').select('*').eq('id', memberId).maybeSingle(),
      supabase
        .from('client_services')
        .select('id, user_id, status, notes, created_at, completed_at, service_template:service_template_id (id, name_tr, name_es, name_en, name_de, slug)')
        .eq('user_id', memberId)
        .order('created_at', { ascending: false }),
      supabase
        .from('documents')
        .select('id, file_name, status, rejection_reason, storage_path, client_service_id, created_at')
        .eq('user_id', memberId)
        .order('created_at', { ascending: false }),
      supabase.from('service_templates').select('id, name_tr, name_es, name_en, name_de, slug').eq('is_active', true).order('sort_order'),
      supabase
        .from('activity_log')
        .select('id, action, details, created_at')
        .eq('user_id', memberId)
        .order('created_at', { ascending: false })
        .limit(10),
      supabase
        .from('client_intake')
        .select('*')
        .eq('user_id', memberId)
        .order('created_at', { ascending: false })
        .limit(1),
    ]);

    if (!m.data) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    setMember(m.data);
    setServices(svc.data || []);
    setDocs(d.data || []);
    setTemplates(t.data || []);
    setActivity(a.data || []);
    setIntake((ik.data || [])[0] || null);

    const ids = (svc.data || []).map((s) => s.id);
    if (ids.length) {
      const { data: st } = await supabase
        .from('client_service_stages')
        .select('id, client_service_id, status, completed_at, sort_order, stage_template:stage_template_id (name_tr, name_es, name_en, name_de)')
        .in('client_service_id', ids)
        .order('sort_order');
      const grouped = {};
      (st || []).forEach((row) => {
        (grouped[row.client_service_id] ||= []).push(row);
      });
      setStagesByService(grouped);
    } else {
      setStagesByService({});
    }
    setLoading(false);
  }, [memberId]);

  useEffect(() => {
    load();
  }, [load]);

  const back = (
    <Link href={`${ADMIN_BASE}/uyeler/`} className="inline-flex items-center gap-2 text-sm text-[#9A9AAA] hover:text-white mb-5">
      <ArrowLeft className="w-4 h-4" />
      Üyeler
    </Link>
  );

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="w-8 h-8 border-2 border-[#C9A84C] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !member) {
    return (
      <div>
        {back}
        <p className="text-[#9A9AAA]">Üye bulunamadı.</p>
      </div>
    );
  }

  const activeCount = services.filter((s) => s.status === 'active').length;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        {back}
        <div className="flex flex-wrap items-center gap-4">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold"
            style={{ background: 'linear-gradient(135deg, #C9A84C, #E8D5A3)', color: '#0B0B11' }}
          >
            {(member.full_name || 'U').charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-white truncate">{member.full_name || 'İsimsiz üye'}</h1>
            <p className="text-sm text-[#9A9AAA]">
              {services.length} hizmet ({activeCount} aktif) • {docs.length} dosya
            </p>
          </div>
          <Pill color={member.role === 'admin' ? '#C9A84C' : '#9A9AAA'}>{member.role === 'admin' ? 'Admin' : 'Üye'}</Pill>
        </div>
      </div>

      <section className="rounded-xl p-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-5" style={card}>
        <Fact icon={Mail} label="E-posta" value={member.email} />
        <Fact icon={Phone} label="Telefon" value={member.phone} />
        <Fact icon={Phone} label="WhatsApp" value={member.whatsapp_phone} />
        <Fact icon={MapPin} label="Ülke / şehir" value={[member.country, member.city].filter(Boolean).join(' / ')} />
        <Fact icon={Globe} label="Vatandaşlık" value={member.citizenship} />
        <Fact icon={Globe} label="İkamet izni" value={RESIDENCE[member.has_residence_permit]} />
        <Fact icon={Calendar} label="Kayıt tarihi" value={fmtDate(member.created_at)} />
        <Fact icon={Globe} label="Dil" value={(member.preferred_language || '').toUpperCase()} />
      </section>

      {intake && <IntakeCard intake={intake} services={services} templates={templates} memberId={memberId} onChanged={load} />}

      <section className="rounded-xl p-5 space-y-4" style={card}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-base font-semibold text-white">
            <Briefcase className="w-4 h-4 text-[#C9A84C]" />
            Hizmetler
          </h2>
        </div>
        {services.length === 0 && <p className="text-sm text-[#9A9AAA]">Bu üyeye henüz hizmet atanmadı.</p>}
        {services.map((s) => (
          <ServiceCard key={s.id} service={s} stages={stagesByService[s.id] || []} memberId={memberId} onChanged={load} />
        ))}
        <AssignBox memberId={memberId} templates={templates} onAssigned={load} />
      </section>

      <DocumentsSection memberId={memberId} services={services} />

      <section className="rounded-xl p-5" style={card}>
        <h2 className="flex items-center gap-2 text-base font-semibold text-white mb-4">
          <Clock className="w-4 h-4 text-[#C9A84C]" />
          Son hareketler
        </h2>
        {activity.length === 0 ? (
          <p className="text-sm text-[#9A9AAA]">Kayıtlı hareket yok.</p>
        ) : (
          <ul className="space-y-2">
            {activity.map((a) => (
              <li key={a.id} className="flex justify-between gap-4 text-sm">
                <span className="text-white">
                  {a.action === 'service_assigned' ? `Hizmet atandı: ${a.details?.service_name || ''}` : a.action}
                </span>
                <span className="text-xs text-[#6A6A7A] shrink-0">{fmtDate(a.created_at)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default function AdminMemberDetailPage() {
  return (
    <AdminLayout activeSection="uyeler">
      <Suspense fallback={null}>
        <MemberDetail />
      </Suspense>
    </AdminLayout>
  );
}
