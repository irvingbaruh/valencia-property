'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import AdminLayout from '@/components/admin/AdminLayout';
import {
  Search,
  Plus,
  ChevronDown,
  ChevronRight,
  Clock,
  CheckCircle2,
  PauseCircle,
  XCircle,
  User,
  Briefcase,
  ArrowRight,
  X,
  Filter,
} from 'lucide-react';

const STATUS_CONFIG = {
  pending: { label: 'Beklemede', color: '#9A9AAA', icon: Clock },
  active: { label: 'Aktif', color: '#22C55E', icon: ArrowRight },
  completed: { label: 'Tamamlandı', color: '#C9A84C', icon: CheckCircle2 },
  on_hold: { label: 'Durduruldu', color: '#F59E0B', icon: PauseCircle },
  cancelled: { label: 'İptal', color: '#DC1C2E', icon: XCircle },
};

const STAGE_STATUS = {
  pending: { label: 'Beklemede', color: '#6A6A7A' },
  in_progress: { label: 'Devam Ediyor', color: '#3B82F6' },
  completed: { label: 'Tamamlandı', color: '#22C55E' },
  skipped: { label: 'Atlandı', color: '#9A9AAA' },
};

// ============ HIZMET ATAMA MODALI ============
function AssignServiceModal({ onClose, onAssigned, serviceTemplates }) {
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [notes, setNotes] = useState('');
  const [memberSearch, setMemberSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  useEffect(() => {
    const fetchMembers = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, email, phone')
        .order('full_name');
      setMembers(data || []);
    };
    fetchMembers();
  }, []);

  const filteredMembers = members.filter((m) => {
    const q = memberSearch.toLowerCase();
    return (
      (m.full_name || '').toLowerCase().includes(q) ||
      (m.email || '').toLowerCase().includes(q)
    );
  });

  const handleAssign = async () => {
    if (!selectedMember || !selectedTemplate) return;
    setLoading(true);
    try {
      // 1) Create client_service
      const { data: cs, error: csErr } = await supabase
        .from('client_services')
        .insert({
          user_id: selectedMember.id,
          service_template_id: selectedTemplate.id,
          status: 'active',
          notes,
          started_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (csErr) throw csErr;

      // 2) Get stage templates for this service
      const { data: stages } = await supabase
        .from('stage_templates')
        .select('id, sort_order, name_tr')
        .eq('service_template_id', selectedTemplate.id)
        .order('sort_order');

      // 3) Create client_service_stages
      if (stages && stages.length > 0) {
        const stageInserts = stages.map((st, idx) => ({
          client_service_id: cs.id,
          stage_template_id: st.id,
          status: idx === 0 ? 'in_progress' : 'pending',
          sort_order: st.sort_order,
          started_at: idx === 0 ? new Date().toISOString() : null,
        }));

        const { data: insertedStages } = await supabase
          .from('client_service_stages')
          .insert(stageInserts)
          .select();

        // 4) Set current_stage_id to first stage
        if (insertedStages && insertedStages.length > 0) {
          const firstStage = insertedStages.find(
            (s) => s.stage_template_id === stages[0].id
          );
          if (firstStage) {
            await supabase
              .from('client_services')
              .update({ current_stage_id: firstStage.id })
              .eq('id', cs.id);
          }
        }
      }

      // 5) Log activity
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('activity_log').insert({
        user_id: selectedMember.id,
        action: 'service_assigned',
        entity_type: 'client_service',
        entity_id: cs.id,
        performed_by: user?.id,
        details: {
          service_name: selectedTemplate.name_tr,
          notes,
        },
      });

      onAssigned();
      onClose();
    } catch (err) {
      console.error('Service assign error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div
        className="relative w-full max-w-lg rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
        style={{ background: '#151521', border: '1px solid #1E1E2E' }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#9A9AAA] hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <h2
          className="text-lg font-bold text-white mb-1"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Yeni Hizmet Ata
        </h2>
        <p className="text-sm text-[#9A9AAA] mb-6">
          Bir müşteriye hizmet atayarak süreci başlatın
        </p>

        {/* Steps indicator */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  step >= s ? 'text-[#0B0B11]' : 'text-[#6A6A7A]'
                }`}
                style={{
                  background: step >= s ? '#C9A84C' : '#1E1E2E',
                }}
              >
                {s}
              </div>
              {s < 3 && (
                <div
                  className="w-8 h-0.5"
                  style={{ background: step > s ? '#C9A84C' : '#1E1E2E' }}
                />
              )}
            </div>
          ))}
          <span className="text-xs text-[#9A9AAA] ml-2">
            {step === 1 ? 'Müşteri Seç' : step === 2 ? 'Hizmet Seç' : 'Onayla'}
          </span>
        </div>

        {/* Step 1: Select Member */}
        {step === 1 && (
          <div>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9A9AAA]" />
              <input
                type="text"
                placeholder="Müşteri ara..."
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm text-white placeholder:text-[#6A6A7A] outline-none focus:ring-2 focus:ring-[#C9A84C]/50"
                style={{ background: '#0B0B11', border: '1px solid #1E1E2E' }}
              />
            </div>
            <div className="max-h-60 overflow-y-auto space-y-1">
              {filteredMembers.map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    setSelectedMember(m);
                    setStep(2);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                    selectedMember?.id === m.id
                      ? 'ring-2 ring-[#C9A84C]'
                      : 'hover:bg-white/5'
                  }`}
                  style={{ background: '#0B0B11' }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                    style={{
                      background: 'linear-gradient(135deg, #C9A84C, #E8D5A3)',
                      color: '#0B0B11',
                    }}
                  >
                    {(m.full_name || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {m.full_name || 'İsimsiz'}
                    </p>
                    <p className="text-xs text-[#9A9AAA] truncate">{m.email}</p>
                  </div>
                </button>
              ))}
              {filteredMembers.length === 0 && (
                <p className="text-sm text-[#9A9AAA] text-center py-4">
                  Sonuç bulunamadı
                </p>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Select Service */}
        {step === 2 && (
          <div>
            <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg" style={{ background: '#0B0B11' }}>
              <User className="w-4 h-4 text-[#C9A84C]" />
              <span className="text-sm text-white">
                {selectedMember?.full_name || selectedMember?.email}
              </span>
              <button
                onClick={() => setStep(1)}
                className="ml-auto text-xs text-[#9A9AAA] hover:text-white"
              >
                Değiştir
              </button>
            </div>
            <div className="space-y-2">
              {serviceTemplates.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setSelectedTemplate(t);
                    setStep(3);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors hover:bg-white/5 ${
                    selectedTemplate?.id === t.id ? 'ring-2 ring-[#C9A84C]' : ''
                  }`}
                  style={{ background: '#0B0B11', border: '1px solid #1E1E2E' }}
                >
                  <Briefcase className="w-5 h-5 text-[#C9A84C] shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-white">{t.name_tr}</p>
                    {t.description_tr && (
                      <p className="text-xs text-[#9A9AAA] mt-0.5 line-clamp-1">
                        {t.description_tr}
                      </p>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#9A9AAA] ml-auto shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Confirm */}
        {step === 3 && (
          <div>
            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: '#0B0B11' }}>
                <User className="w-4 h-4 text-[#C9A84C]" />
                <span className="text-sm text-white">
                  {selectedMember?.full_name || selectedMember?.email}
                </span>
                <button
                  onClick={() => setStep(1)}
                  className="ml-auto text-xs text-[#9A9AAA] hover:text-white"
                >
                  Değiştir
                </button>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: '#0B0B11' }}>
                <Briefcase className="w-4 h-4 text-[#C9A84C]" />
                <span className="text-sm text-white">{selectedTemplate?.name_tr}</span>
                <button
                  onClick={() => setStep(2)}
                  className="ml-auto text-xs text-[#9A9AAA] hover:text-white"
                >
                  Değiştir
                </button>
              </div>
            </div>
            <textarea
              placeholder="Not (opsiyonel)..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-lg text-sm text-white placeholder:text-[#6A6A7A] outline-none resize-none focus:ring-2 focus:ring-[#C9A84C]/50 mb-4"
              style={{ background: '#0B0B11', border: '1px solid #1E1E2E' }}
            />
            <button
              onClick={handleAssign}
              disabled={loading}
              className="w-full py-3 rounded-lg text-sm font-semibold text-[#0B0B11] transition-all flex items-center justify-center gap-2"
              style={{ background: '#C9A84C' }}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-[#0B0B11] border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Hizmeti Ata ve Başlat
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ============ HIZMET DETAY MODALI ============
function ServiceDetailModal({ service, onClose, onUpdate }) {
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingStage, setUpdatingStage] = useState(null);

  useEffect(() => {
    const fetchStages = async () => {
      const { data } = await supabase
        .from('client_service_stages')
        .select(`
          id, status, started_at, completed_at, notes, sort_order,
          stage_template:stage_template_id (id, name_tr, name_en, description_tr, estimated_days)
        `)
        .eq('client_service_id', service.id)
        .order('sort_order');
      setStages(data || []);
      setLoading(false);
    };
    fetchStages();
  }, [service.id]);

  const handleAdvanceStage = async (stageId, newStatus) => {
    setUpdatingStage(stageId);
    try {
      const updates = { status: newStatus, updated_at: new Date().toISOString() };
      if (newStatus === 'in_progress') updates.started_at = new Date().toISOString();
      if (newStatus === 'completed') updates.completed_at = new Date().toISOString();

      await supabase
        .from('client_service_stages')
        .update(updates)
        .eq('id', stageId);

      // If completing a stage, auto-start next pending stage
      if (newStatus === 'completed') {
        const currentIdx = stages.findIndex((s) => s.id === stageId);
        const nextStage = stages[currentIdx + 1];
        if (nextStage && nextStage.status === 'pending') {
          await supabase
            .from('client_service_stages')
            .update({
              status: 'in_progress',
              started_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('id', nextStage.id);

          // Update current_stage_id
          await supabase
            .from('client_services')
            .update({ current_stage_id: nextStage.id, updated_at: new Date().toISOString() })
            .eq('id', service.id);
        }

        // If all stages completed, complete the service
        const allCompleted = stages.every(
          (s) => s.id === stageId || s.status === 'completed' || s.status === 'skipped'
        );
        if (allCompleted && !nextStage) {
          await supabase
            .from('client_services')
            .update({
              status: 'completed',
              completed_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('id', service.id);
        }
      }

      // Refresh stages
      const { data } = await supabase
        .from('client_service_stages')
        .select(`
          id, status, started_at, completed_at, notes, sort_order,
          stage_template:stage_template_id (id, name_tr, name_en, description_tr, estimated_days)
        `)
        .eq('client_service_id', service.id)
        .order('sort_order');
      setStages(data || []);
      onUpdate();
    } catch (err) {
      console.error('Stage update error:', err);
    } finally {
      setUpdatingStage(null);
    }
  };

  const completedCount = stages.filter((s) => s.status === 'completed').length;
  const progress = stages.length > 0 ? Math.round((completedCount / stages.length) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div
        className="relative w-full max-w-2xl rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
        style={{ background: '#151521', border: '1px solid #1E1E2E' }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#9A9AAA] hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-xs font-medium px-2 py-0.5 rounded-full"
              style={{
                background: `${STATUS_CONFIG[service.status]?.color}20`,
                color: STATUS_CONFIG[service.status]?.color,
              }}
            >
              {STATUS_CONFIG[service.status]?.label}
            </span>
          </div>
          <h2
            className="text-lg font-bold text-white"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {service.service_template?.name_tr}
          </h2>
          <p className="text-sm text-[#9A9AAA]">
            Müşteri: {service.profile?.full_name || service.profile?.email || '—'}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-[#9A9AAA] mb-1.5">
            <span>İlerleme</span>
            <span>{completedCount}/{stages.length} aşama • %{progress}</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: '#0B0B11' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progress}%`,
                background: progress === 100 ? '#22C55E' : '#C9A84C',
              }}
            />
          </div>
        </div>

        {/* Stages Pipeline */}
        {loading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-2 border-[#C9A84C] border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : (
          <div className="space-y-2">
            {stages.map((stage, idx) => {
              const stageConf = STAGE_STATUS[stage.status];
              const isUpdating = updatingStage === stage.id;
              return (
                <div
                  key={stage.id}
                  className="rounded-lg px-4 py-3"
                  style={{
                    background: stage.status === 'in_progress' ? 'rgba(59, 130, 246, 0.08)' : '#0B0B11',
                    border: `1px solid ${stage.status === 'in_progress' ? 'rgba(59, 130, 246, 0.3)' : '#1E1E2E'}`,
                  }}
                >
                  <div className="flex items-center gap-3">
                    {/* Step number */}
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                      style={{
                        background: stage.status === 'completed' ? '#22C55E' : stage.status === 'in_progress' ? '#3B82F6' : '#1E1E2E',
                        color: stage.status === 'pending' ? '#6A6A7A' : '#fff',
                      }}
                    >
                      {stage.status === 'completed' ? '✓' : idx + 1}
                    </div>

                    {/* Stage info */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${stage.status === 'completed' ? 'text-[#9A9AAA] line-through' : 'text-white'}`}>
                        {stage.stage_template?.name_tr}
                      </p>
                      {stage.stage_template?.estimated_days && stage.status !== 'completed' && (
                        <p className="text-xs text-[#6A6A7A]">
                          ~{stage.stage_template.estimated_days} gün
                        </p>
                      )}
                    </div>

                    {/* Status badge */}
                    <span
                      className="text-xs px-2 py-0.5 rounded-full shrink-0"
                      style={{
                        background: `${stageConf.color}20`,
                        color: stageConf.color,
                      }}
                    >
                      {stageConf.label}
                    </span>

                    {/* Action buttons */}
                    {stage.status === 'pending' && idx > 0 && stages[idx - 1]?.status !== 'completed' ? null : (
                      <div className="flex gap-1 shrink-0">
                        {stage.status === 'pending' && (
                          <button
                            onClick={() => handleAdvanceStage(stage.id, 'in_progress')}
                            disabled={isUpdating}
                            className="px-2 py-1 rounded text-xs text-white hover:opacity-80 transition-opacity"
                            style={{ background: '#3B82F6' }}
                          >
                            {isUpdating ? '...' : 'Başlat'}
                          </button>
                        )}
                        {stage.status === 'in_progress' && (
                          <button
                            onClick={() => handleAdvanceStage(stage.id, 'completed')}
                            disabled={isUpdating}
                            className="px-2 py-1 rounded text-xs text-white hover:opacity-80 transition-opacity"
                            style={{ background: '#22C55E' }}
                          >
                            {isUpdating ? '...' : 'Tamamla'}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Notes */}
        {service.notes && (
          <div className="mt-4 px-4 py-3 rounded-lg" style={{ background: '#0B0B11', border: '1px solid #1E1E2E' }}>
            <p className="text-xs text-[#9A9AAA] mb-1">Not</p>
            <p className="text-sm text-white">{service.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ============ ANA SAYFA ============
export default function AdminServicesPage() {
  const [services, setServices] = useState([]);
  const [serviceTemplates, setServiceTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [templateFilter, setTemplateFilter] = useState('all');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch service templates
      const { data: templates } = await supabase
        .from('service_templates')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');
      setServiceTemplates(templates || []);

      // Fetch client services with related data
      let query = supabase
        .from('client_services')
        .select(`
          id, status, notes, started_at, completed_at, created_at, updated_at, current_stage_id,
          service_template:service_template_id (id, name_tr, name_en, icon, slug),
          profile:user_id (id, full_name, email, phone)
        `)
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      if (templateFilter !== 'all') {
        query = query.eq('service_template_id', templateFilter);
      }

      const { data: svcData } = await query;

      // Filter by search
      let filtered = svcData || [];
      if (search.trim()) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (s) =>
            (s.profile?.full_name || '').toLowerCase().includes(q) ||
            (s.profile?.email || '').toLowerCase().includes(q) ||
            (s.service_template?.name_tr || '').toLowerCase().includes(q)
        );
      }

      // Get stage counts for each service
      const serviceIds = filtered.map((s) => s.id);
      if (serviceIds.length > 0) {
        const { data: stageCounts } = await supabase
          .from('client_service_stages')
          .select('client_service_id, status')
          .in('client_service_id', serviceIds);

        const countMap = {};
        (stageCounts || []).forEach((sc) => {
          if (!countMap[sc.client_service_id]) {
            countMap[sc.client_service_id] = { total: 0, completed: 0 };
          }
          countMap[sc.client_service_id].total++;
          if (sc.status === 'completed') countMap[sc.client_service_id].completed++;
        });

        filtered = filtered.map((s) => ({
          ...s,
          stageProgress: countMap[s.id] || { total: 0, completed: 0 },
        }));
      }

      setServices(filtered);
    } catch (err) {
      console.error('Services fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, templateFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Stats
  const stats = {
    total: services.length,
    active: services.filter((s) => s.status === 'active').length,
    completed: services.filter((s) => s.status === 'completed').length,
    pending: services.filter((s) => s.status === 'pending').length,
  };

  return (
    <AdminLayout activeSection="hizmetler">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1
              className="text-2xl font-bold text-white"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Hizmet Yönetimi
            </h1>
            <p className="text-sm text-[#9A9AAA] mt-1">
              Müşteri hizmetlerini yönetin, aşamaları takip edin
            </p>
          </div>
          <button
            onClick={() => setShowAssignModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-[#0B0B11] transition-all hover:opacity-90"
            style={{ background: '#C9A84C' }}
          >
            <Plus className="w-4 h-4" />
            Hizmet Ata
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Toplam', value: stats.total, color: '#9A9AAA' },
            { label: 'Aktif', value: stats.active, color: '#22C55E' },
            { label: 'Tamamlanan', value: stats.completed, color: '#C9A84C' },
            { label: 'Beklemede', value: stats.pending, color: '#F59E0B' },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              className="rounded-xl px-4 py-3"
              style={{ background: '#151521', border: '1px solid #1E1E2E' }}
            >
              <p className="text-xs text-[#9A9AAA]">{label}</p>
              <p className="text-2xl font-bold mt-1" style={{ color }}>
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9A9AAA]" />
            <input
              type="text"
              placeholder="Müşteri veya hizmet ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm text-white placeholder:text-[#6A6A7A] outline-none focus:ring-2 focus:ring-[#C9A84C]/50"
              style={{ background: '#151521', border: '1px solid #1E1E2E' }}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {['all', 'active', 'pending', 'completed', 'on_hold'].map((st) => {
              const conf = st === 'all' ? { label: 'Tümü', color: '#9A9AAA' } : STATUS_CONFIG[st];
              return (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                    statusFilter === st ? 'text-white' : 'text-[#9A9AAA] hover:text-white hover:bg-white/5'
                  }`}
                  style={
                    statusFilter === st
                      ? { background: `${conf.color}20`, color: conf.color }
                      : { background: '#151521', border: '1px solid #1E1E2E' }
                  }
                >
                  {conf.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Service template filter */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          <button
            onClick={() => setTemplateFilter('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
              templateFilter === 'all'
                ? 'bg-white/10 text-white'
                : 'text-[#6A6A7A] hover:text-[#9A9AAA]'
            }`}
          >
            Tüm Hizmetler
          </button>
          {serviceTemplates.map((t) => (
            <button
              key={t.id}
              onClick={() => setTemplateFilter(t.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                templateFilter === t.id
                  ? 'bg-white/10 text-white'
                  : 'text-[#6A6A7A] hover:text-[#9A9AAA]'
              }`}
            >
              {t.name_tr}
            </button>
          ))}
        </div>

        {/* Services List */}
        <div className="space-y-2">
          {loading ? (
            <div className="p-12 text-center">
              <div className="w-8 h-8 border-2 border-[#C9A84C] border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : services.length === 0 ? (
            <div
              className="rounded-xl p-12 text-center"
              style={{ background: '#151521', border: '1px solid #1E1E2E' }}
            >
              <Briefcase className="w-12 h-12 text-[#6A6A7A] mx-auto mb-3" />
              <p className="text-sm text-[#9A9AAA] mb-4">
                {search || statusFilter !== 'all'
                  ? 'Filtreye uygun hizmet bulunamadı'
                  : 'Henüz atanmış hizmet yok'}
              </p>
              {!search && statusFilter === 'all' && (
                <button
                  onClick={() => setShowAssignModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-[#0B0B11]"
                  style={{ background: '#C9A84C' }}
                >
                  <Plus className="w-4 h-4" />
                  İlk Hizmeti Ata
                </button>
              )}
            </div>
          ) : (
            services.map((svc) => {
              const stConf = STATUS_CONFIG[svc.status];
              const StIcon = stConf?.icon || Clock;
              const progress =
                svc.stageProgress?.total > 0
                  ? Math.round(
                      (svc.stageProgress.completed / svc.stageProgress.total) * 100
                    )
                  : 0;

              return (
                <div
                  key={svc.id}
                  onClick={() => setSelectedService(svc)}
                  className="rounded-xl px-5 py-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
                  style={{ background: '#151521', border: '1px solid #1E1E2E' }}
                >
                  <div className="flex items-center gap-4">
                    {/* Service icon */}
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: `${stConf?.color}15` }}
                    >
                      <StIcon className="w-5 h-5" style={{ color: stConf?.color }} />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-medium text-white truncate">
                          {svc.service_template?.name_tr}
                        </p>
                        <span
                          className="text-[10px] font-medium px-1.5 py-0.5 rounded-full shrink-0"
                          style={{
                            background: `${stConf?.color}20`,
                            color: stConf?.color,
                          }}
                        >
                          {stConf?.label}
                        </span>
                      </div>
                      <p className="text-xs text-[#9A9AAA]">
                        {svc.profile?.full_name || svc.profile?.email || '—'} •{' '}
                        {new Date(svc.created_at).toLocaleDateString('tr-TR', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>

                    {/* Progress */}
                    <div className="hidden sm:flex items-center gap-3 shrink-0">
                      <div className="w-24">
                        <div className="flex justify-between text-[10px] text-[#9A9AAA] mb-1">
                          <span>
                            {svc.stageProgress?.completed}/{svc.stageProgress?.total}
                          </span>
                          <span>%{progress}</span>
                        </div>
                        <div
                          className="h-1.5 rounded-full overflow-hidden"
                          style={{ background: '#0B0B11' }}
                        >
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${progress}%`,
                              background: progress === 100 ? '#22C55E' : '#C9A84C',
                            }}
                          />
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#6A6A7A]" />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modals */}
      {showAssignModal && (
        <AssignServiceModal
          onClose={() => setShowAssignModal(false)}
          onAssigned={fetchData}
          serviceTemplates={serviceTemplates}
        />
      )}
      {selectedService && (
        <ServiceDetailModal
          service={selectedService}
          onClose={() => setSelectedService(null)}
          onUpdate={fetchData}
        />
      )}
    </AdminLayout>
  );
}
