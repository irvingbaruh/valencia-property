'use client';

import { supabase } from '@/lib/supabase';

export const VAPID_PUBLIC = 'BIptClcjt6sreGecTMgpNdjq94guhUOk6xMk3LkPKunCpJl0JwiV1MnBozM2qEde1tKWcKgV7o5NEnYvSQbSWQo';

// Notification types a member can switch on or off. rate_alert and rate_daily stay off until chosen.
export const MEMBER_EVENTS = ['new_listing', 'favorite_change', 'content', 'account', 'rate_alert', 'rate_daily'];
export const MEMBER_DEFAULTS = { new_listing: true, favorite_change: true, content: true, account: true, rate_alert: false, rate_daily: false };

const b64ToBytes = (s) => {
  const pad = '='.repeat((4 - (s.length % 4)) % 4);
  const raw = atob((s + pad).replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
};

export const isIos = () => /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
export const isStandalone = () => window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
export const pushCapable = () => 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;

export const deviceLabel = () => {
  const ua = navigator.userAgent;
  const os = /iPhone/.test(ua) ? 'iPhone' : /iPad/.test(ua) ? 'iPad' : /Android/.test(ua) ? 'Android' : /Mac/.test(ua) ? 'Mac' : /Windows/.test(ua) ? 'Windows' : 'Device';
  return `${os} · ${/Edg/.test(ua) ? 'Edge' : /Chrome/.test(ua) ? 'Chrome' : /Safari/.test(ua) ? 'Safari' : 'Browser'}`;
};

export async function registerSiteWorker() {
  if (!('serviceWorker' in navigator)) return null;
  try {
    return (await navigator.serviceWorker.getRegistration('/')) || (await navigator.serviceWorker.register('/sw.js', { scope: '/' }));
  } catch {
    return null;
  }
}

export async function currentSubscription() {
  try {
    const reg = await navigator.serviceWorker.getRegistration('/');
    return reg ? await reg.pushManager.getSubscription() : null;
  } catch {
    return null;
  }
}

// Ask for permission, subscribe this device and save it for the signed-in member.
export async function enableMemberPush(userId, locale) {
  const perm = await Notification.requestPermission();
  if (perm !== 'granted') return { ok: false, reason: 'denied' };
  const reg = (await registerSiteWorker()) || null;
  if (!reg) return { ok: false, reason: 'failed' };
  await navigator.serviceWorker.ready;
  let sub = await reg.pushManager.getSubscription();
  if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64ToBytes(VAPID_PUBLIC) });
  const j = sub.toJSON();
  // If this phone was last used by another account, hand the device over to this member.
  await supabase.from('push_subscriptions').delete().eq('endpoint', j.endpoint);
  const { error } = await supabase.from('push_subscriptions').insert({
    user_id: userId, audience: 'member', endpoint: j.endpoint, p256dh: j.keys.p256dh, auth: j.keys.auth,
    device_label: deviceLabel(), locale, events: MEMBER_DEFAULTS,
  });
  if (error) return { ok: false, reason: 'failed' };
  return { ok: true };
}

// Stop notifications on this device (used by the switch and on sign-out, so the next person on this phone gets none).
export async function disableMemberPush() {
  try {
    const sub = await currentSubscription();
    if (!sub) return;
    await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint);
    await sub.unsubscribe();
  } catch {}
}
