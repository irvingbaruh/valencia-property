// Admin helpers for lead warmth, sources and follow-up (Turkish: the admin is Turkish-only).
export const CHANNELS = {
  instagram: 'Instagram', instagram_ads: 'Instagram reklam', youtube: 'YouTube', youtube_ads: 'YouTube reklam',
  facebook: 'Facebook', facebook_ads: 'Facebook reklam', google_search: 'Google arama', google_ads: 'Google reklam', google: 'Google',
  bing_search: 'Bing arama', yandex_search: 'Yandex arama', duckduckgo_search: 'DuckDuckGo', whatsapp: 'WhatsApp', telegram: 'Telegram',
  linkedin: 'LinkedIn', x: 'X (Twitter)', tiktok: 'TikTok', tiktok_ads: 'TikTok reklam', email: 'E-posta', referral: 'Başka site',
  direct: 'Doğrudan', unknown: 'Bilinmiyor',
};
export const channelLabel = (ch) => CHANNELS[ch] || ch || CHANNELS.unknown;
export const CHANNEL_COLOR = (ch = '') => (/instagram/.test(ch) ? '#E1306C' : /youtube/.test(ch) ? '#FF4E45' : /facebook/.test(ch) ? '#5B8DEF' : /google|bing|yandex|duck/.test(ch) ? '#34A853' : /whatsapp/.test(ch) ? '#25D366' : /email/.test(ch) ? '#C9A84C' : '#9A9AAA');

export const STAGES = [
  ['new', 'Yeni'], ['contacted', 'İletişime geçildi'], ['qualified', 'Ciddi alıcı'], ['viewing', 'Ev gösterimi'],
  ['offer', 'Teklif aşaması'], ['won', 'Müşteri oldu'], ['lost', 'Vazgeçti'],
];
export const stageLabel = (s) => (STAGES.find(([k]) => k === s) || STAGES[0])[1];

export const scoreTone = (n) => (n >= 60 ? { label: 'Sıcak', color: '#F87171', bg: 'rgba(248,113,113,0.15)' } : n >= 30 ? { label: 'Ilık', color: '#C9A84C', bg: 'rgba(201,168,76,0.15)' } : { label: 'Soğuk', color: '#9A9AAA', bg: 'rgba(154,154,170,0.12)' });

const days = (d) => Math.floor((Date.now() - new Date(d).getTime()) / 864e5);
// Why this member is worth a call, strongest signal first.
export function leadReasons(l) {
  const r = [];
  if (l.next_appt) r.push('Görüşme randevusu var');
  else if (l.appts > 0) r.push('Görüşme yapıldı');
  if (l.has_intake) r.push(`Danışmanlık formu doldurdu${l.budget ? ` (${l.budget})` : ''}`);
  if (l.favs > 0) r.push(`${l.favs} favori ilan`);
  if (l.searches > 0) r.push(`${l.searches} kayıtlı arama`);
  if (l.chat_leads > 0) r.push('Sohbette iletişim bıraktı');
  if (l.last_active_at && days(l.last_active_at) <= 7) r.push(days(l.last_active_at) === 0 ? 'Bugün sitedeydi' : `${days(l.last_active_at)} gün önce sitedeydi`);
  if (l.has_app) r.push('Uygulamayı kurdu');
  if (!l.phone) r.push('Telefonu yok');
  return r;
}
export const waitingDays = (l) => (l.last_inbound_at ? days(l.last_inbound_at) : 0);
export const needsAttention = (l) => !!(l.needs_followup || l.followup_due);

export const COMM_CHANNELS = [['whatsapp', 'WhatsApp'], ['phone', 'Telefon'], ['email', 'E-posta'], ['video_call', 'Görüntülü görüşme'], ['in_person', 'Yüz yüze'], ['other', 'Diğer']];
