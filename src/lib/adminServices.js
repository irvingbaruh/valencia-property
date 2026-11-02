import { supabase } from '@/lib/supabase';

export async function notifyMember({ userId, type, title, body, clientServiceId }) {
  await supabase.from('notifications').insert({
    user_id: userId,
    type,
    title_tr: title,
    body_tr: body || null,
    client_service_id: clientServiceId || null,
  });
}

// Creates the client_service, its stages (first one in progress), logs it and notifies the member.
export async function assignService({ memberId, template, notes }) {
  const now = new Date().toISOString();
  const { data: cs, error } = await supabase
    .from('client_services')
    .insert({ user_id: memberId, service_template_id: template.id, status: 'active', notes: notes || null, started_at: now })
    .select()
    .single();
  if (error) return { error };

  const { data: tpl } = await supabase
    .from('stage_templates')
    .select('id, sort_order')
    .eq('service_template_id', template.id)
    .order('sort_order');

  if (tpl && tpl.length > 0) {
    const { data: inserted } = await supabase
      .from('client_service_stages')
      .insert(
        tpl.map((st, idx) => ({
          client_service_id: cs.id,
          stage_template_id: st.id,
          status: idx === 0 ? 'in_progress' : 'pending',
          sort_order: st.sort_order,
          started_at: idx === 0 ? now : null,
        }))
      )
      .select();
    const first = (inserted || []).find((s) => s.stage_template_id === tpl[0].id);
    if (first) {
      await supabase.from('client_services').update({ current_stage_id: first.id }).eq('id', cs.id);
    }
  }

  const { data: { user } } = await supabase.auth.getUser();
  await supabase.from('activity_log').insert({
    user_id: memberId,
    action: 'service_assigned',
    entity_type: 'client_service',
    entity_id: cs.id,
    performed_by: user?.id,
    details: { service_name: template.name_tr, notes },
  });
  await notifyMember({
    userId: memberId,
    type: 'service_assigned',
    title: 'Yeni hizmet atandı',
    body: `${template.name_tr} hizmeti hesabınıza eklendi. Hizmetlerim sekmesinden süreci takip edebilirsiniz.`,
    clientServiceId: cs.id,
  });
  return { data: cs };
}

// stages: the service's stages in sort order (each with stage_template). Returns { error? }.
export async function setStageStatus({ service, memberId, stages, stageId, newStatus }) {
  const now = new Date().toISOString();
  const updates = { status: newStatus, updated_at: now };
  if (newStatus === 'in_progress') updates.started_at = now;
  if (newStatus === 'completed') updates.completed_at = now;

  const { error } = await supabase.from('client_service_stages').update(updates).eq('id', stageId);
  if (error) return { error };

  const statuses = Object.fromEntries(stages.map((s) => [s.id, s.status]));
  statuses[stageId] = newStatus;

  if (newStatus === 'completed') {
    const idx = stages.findIndex((s) => s.id === stageId);
    const next = stages[idx + 1];
    if (next && next.status === 'pending') {
      await supabase
        .from('client_service_stages')
        .update({ status: 'in_progress', started_at: now, updated_at: now })
        .eq('id', next.id);
      await supabase.from('client_services').update({ current_stage_id: next.id, updated_at: now }).eq('id', service.id);
      statuses[next.id] = 'in_progress';
    }
    if (Object.values(statuses).every((st) => st === 'completed' || st === 'skipped')) {
      await supabase
        .from('client_services')
        .update({ status: 'completed', completed_at: now, updated_at: now })
        .eq('id', service.id);
    }
  }

  const changed = stages.find((s) => s.id === stageId);
  const label = newStatus === 'completed' ? 'tamamlandı' : newStatus === 'in_progress' ? 'başladı' : 'güncellendi';
  await notifyMember({
    userId: memberId,
    type: 'stage_update',
    title: `${service.service_template?.name_tr || 'Hizmet'}: aşama ${label}`,
    body: changed?.stage_template?.name_tr || '',
    clientServiceId: service.id,
  });
  return {};
}

export async function setServiceStatus({ service, memberId, status }) {
  const now = new Date().toISOString();
  const updates = { status, updated_at: now };
  if (status === 'completed') updates.completed_at = now;
  const { error } = await supabase.from('client_services').update(updates).eq('id', service.id);
  if (error) return { error };
  const labels = { active: 'aktif', paused: 'durduruldu', completed: 'tamamlandı', cancelled: 'iptal edildi' };
  await notifyMember({
    userId: memberId,
    type: 'stage_update',
    title: `${service.service_template?.name_tr || 'Hizmet'}: ${labels[status] || 'güncellendi'}`,
    clientServiceId: service.id,
  });
  return {};
}
