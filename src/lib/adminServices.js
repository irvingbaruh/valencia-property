import { supabase } from '@/lib/supabase';

const LANGS = ['tr', 'es', 'en', 'de'];

// text may be a plain Turkish string or { tr, es, en, de }
const loc = (text) => (typeof text === 'string' ? { tr: text } : text || {});

export async function notifyMember({ userId, type, title, body, clientServiceId }) {
  const ti = loc(title);
  const bo = loc(body);
  const row = { user_id: userId, type, client_service_id: clientServiceId || null };
  LANGS.forEach((l) => {
    row[`title_${l}`] = ti[l] || (l === 'tr' ? '' : null);
    row[`body_${l}`] = bo[l] || null;
  });
  await supabase.from('notifications').insert(row);
}

// { tr, es, en, de } from a row with name_xx columns
export const names = (row, prefix = 'name_') =>
  Object.fromEntries(LANGS.map((l) => [l, row?.[`${prefix}${l}`] || row?.[`${prefix}tr`] || '']));

const per = (fn) => Object.fromEntries(LANGS.map((l) => [l, fn(l)]));

export const TEXT = {
  assigned: (template) => ({
    title: {
      tr: 'Yeni hizmet atandı',
      es: 'Nuevo servicio asignado',
      en: 'New service assigned',
      de: 'Neue Leistung zugewiesen',
    },
    body: per((l) => {
      const n = names(template)[l];
      return {
        tr: `${n} hizmeti hesabınıza eklendi. Hizmetlerim sekmesinden süreci takip edebilirsiniz.`,
        es: `El servicio «${n}» se ha añadido a su cuenta. Siga el proceso en la pestaña Mis servicios.`,
        en: `The service "${n}" has been added to your account. Follow its progress in the My services tab.`,
        de: `Die Leistung „${n}“ wurde Ihrem Konto hinzugefügt. Den Fortschritt sehen Sie unter Meine Leistungen.`,
      }[l];
    }),
  }),
  stage: (service, stage, newStatus) => {
    const verb = {
      completed: { tr: 'tamamlandı', es: 'completada', en: 'completed', de: 'abgeschlossen' },
      in_progress: { tr: 'başladı', es: 'iniciada', en: 'started', de: 'gestartet' },
    }[newStatus] || { tr: 'güncellendi', es: 'actualizada', en: 'updated', de: 'aktualisiert' };
    const sn = names(service?.service_template);
    const word = { tr: 'aşama', es: 'fase', en: 'stage', de: 'Schritt' };
    return {
      title: per((l) => `${sn[l] || { tr: 'Hizmet', es: 'Servicio', en: 'Service', de: 'Leistung' }[l]}: ${word[l]} ${verb[l]}`),
      body: names(stage?.stage_template),
    };
  },
  serviceStatus: (service, status) => {
    const lab = {
      active: { tr: 'aktif', es: 'activo', en: 'active', de: 'aktiv' },
      paused: { tr: 'durduruldu', es: 'en pausa', en: 'on hold', de: 'pausiert' },
      completed: { tr: 'tamamlandı', es: 'completado', en: 'completed', de: 'abgeschlossen' },
      cancelled: { tr: 'iptal edildi', es: 'cancelado', en: 'cancelled', de: 'storniert' },
    }[status] || { tr: 'güncellendi', es: 'actualizado', en: 'updated', de: 'aktualisiert' };
    const sn = names(service?.service_template);
    return { title: per((l) => `${sn[l]}: ${lab[l]}`) };
  },
  document: (approved, fileName, reason) => ({
    title: approved
      ? { tr: 'Belgeniz onaylandı', es: 'Su documento ha sido aprobado', en: 'Your document was approved', de: 'Ihr Dokument wurde genehmigt' }
      : { tr: 'Belgeniz reddedildi', es: 'Su documento ha sido rechazado', en: 'Your document was rejected', de: 'Ihr Dokument wurde abgelehnt' },
    body: approved ? fileName : `${fileName}${reason ? `: ${reason}` : ''}`,
  }),
};

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
  await notifyMember({ userId: memberId, type: 'service_assigned', ...TEXT.assigned(template), clientServiceId: cs.id });
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
  await notifyMember({ userId: memberId, type: 'stage_update', ...TEXT.stage(service, changed, newStatus), clientServiceId: service.id });
  return {};
}

export async function setServiceStatus({ service, memberId, status }) {
  const now = new Date().toISOString();
  const updates = { status, updated_at: now };
  if (status === 'completed') updates.completed_at = now;
  const { error } = await supabase.from('client_services').update(updates).eq('id', service.id);
  if (error) return { error };
  await notifyMember({ userId: memberId, type: 'stage_update', ...TEXT.serviceStatus(service, status), clientServiceId: service.id });
  return {};
}
