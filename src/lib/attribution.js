// First-touch source of a visitor: which channel/campaign brought them the first time.
// Kept in localStorage for 90 days so it survives until they sign up; written to their profile once.
const KEY = 'll_attr';
const TTL = 90 * 24 * 3600 * 1000;
const clip = (v, n) => String(v || '').trim().slice(0, n);

const HOSTS = [
  [/(^|\.)mail\.|outlook\.|gmail\./, 'email'],
  [/instagram\./, 'instagram'], [/(^|\.)youtube\.|youtu\.be/, 'youtube'], [/facebook\.|fb\.(com|me)/, 'facebook'],
  [/(^|\.)t\.co$|twitter\.|(^|\.)x\.com$/, 'x'], [/linkedin\.|lnkd\.in/, 'linkedin'], [/tiktok\./, 'tiktok'],
  [/whatsapp\.|wa\.me/, 'whatsapp'], [/telegram\.|(^|\.)t\.me$/, 'telegram'],
  [/google\./, 'google'], [/bing\./, 'bing'], [/yandex\./, 'yandex'], [/duckduckgo\./, 'duckduckgo'],
];
const SEARCH = ['google', 'bing', 'yandex', 'duckduckgo'];

function classify(q, refHost) {
  const src = clip(q.get('utm_source') || q.get('ref'), 40).toLowerCase();
  const med = clip(q.get('utm_medium'), 40).toLowerCase();
  const paid = /cpc|ppc|paid|ads?$/.test(med) || q.has('gclid');
  let ch = '';
  if (src) {
    const hit = HOSTS.find(([re]) => re.test(src + '.'));
    ch = hit ? hit[1] : src;
    if (/^ig$|insta/.test(src)) ch = 'instagram';
    if (/^yt$/.test(src)) ch = 'youtube';
    if (/^fb$|meta/.test(src)) ch = 'facebook';
    if (/^wa$/.test(src)) ch = 'whatsapp';
    if (med === 'email' || /newsletter|mailing/.test(src)) ch = 'email';
  } else if (q.has('gclid')) ch = 'google';
  else if (refHost) {
    const hit = HOSTS.find(([re]) => re.test(refHost));
    ch = hit ? hit[1] : 'referral';
  } else ch = 'direct';
  if (paid && ['google', 'facebook', 'instagram', 'youtube', 'tiktok'].includes(ch)) ch += '_ads';
  else if (!src && SEARCH.includes(ch)) ch += '_search';
  return { ch: clip(ch, 30), src, med };
}

export function readAttribution() {
  try {
    const a = JSON.parse(localStorage.getItem(KEY) || 'null');
    return a && a.at && Date.now() - new Date(a.at).getTime() < TTL ? a : null;
  } catch {
    return null;
  }
}

// Called on every page load; only the first visit (or the first one after 90 days) is recorded.
// Returns { s, c } of the current visit's campaign tags for the analytics event, if any.
export function captureAttribution() {
  if (typeof window === 'undefined') return {};
  const q = new URLSearchParams(window.location.search);
  let refHost = '';
  try {
    const u = document.referrer && new URL(document.referrer);
    if (u && u.host !== window.location.host) refHost = u.host.replace(/^www\./, '');
  } catch {}
  const c = classify(q, refHost);
  const camp = clip(q.get('utm_campaign'), 60);
  if (!readAttribution()) {
    const a = { ch: c.ch, at: new Date().toISOString(), lp: clip(window.location.pathname, 120) };
    if (c.src) a.src = c.src;
    if (c.med) a.med = c.med;
    if (camp) a.camp = camp;
    const content = clip(q.get('utm_content'), 60);
    if (content) a.cnt = content;
    if (refHost) a.ref = clip(refHost, 80);
    try { localStorage.setItem(KEY, JSON.stringify(a)); } catch {}
  }
  const tagged = c.src || q.has('gclid');
  return tagged ? { s: c.ch, c: camp || undefined } : {};
}
