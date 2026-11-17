import { needsAttention, STAGES, CHANNELS } from '@/lib/leads';

const dayAgo = (d) => (d ? (Date.now() - new Date(d).getTime()) / 864e5 : Infinity);

// Member groups for push messages. Several can be combined: a member must match all that are switched on.
export const SEGMENTS = [
  ['hot', 'Sıcak üyeler (60+ puan)', (l) => l.score >= 60],
  ['warm', 'Ilık üyeler (30–59 puan)', (l) => l.score >= 30 && l.score < 60],
  ['wait', 'Dönüş bekleyenler', needsAttention],
  ['intake', 'Danışmanlık formunu dolduranlar', (l) => l.has_intake],
  ['nointake', 'Formu doldurmayanlar', (l) => !l.has_intake],
  ['appt', 'Görüşme yapan ya da randevusu olanlar', (l) => l.appts > 0 || !!l.next_appt],
  ['noappt', 'Hiç görüşme yapmayanlar', (l) => !(l.appts > 0)],
  ['favs', 'Favori ilanı olanlar', (l) => l.favs > 0],
  ['searches', 'Kayıtlı araması olanlar', (l) => l.searches > 0],
  ['client', 'Hizmet alanlar', (l) => l.is_client],
  ['new7', 'Son 7 günde katılanlar', (l) => dayAgo(l.created_at) <= 7],
  ['quiet30', '30 gündür siteye girmeyenler', (l) => dayAgo(l.last_active_at) > 30],
];

export const channelOptions = (leads) => [...new Set(leads.map((l) => l.channel).filter(Boolean))].map((c) => [c, CHANNELS[c] || c]);
export const stageOptions = STAGES;

export function matchSegment(leads, { on = [], channel = '', stage = '' }) {
  const fns = SEGMENTS.filter(([k]) => on.includes(k)).map(([, , f]) => f);
  return leads.filter((l) => fns.every((f) => f(l)) && (!channel || l.channel === channel) && (!stage || l.stage === stage));
}
