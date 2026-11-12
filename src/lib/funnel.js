// Signup-funnel steps. The Tracker component picks these up and sends them with the other analytics events,
// so nothing extra is stored in the browser. Steps used: gate_view, gate_click, invite_view, invite_click,
// auth_view, signup_start, signup_sent, signup_google, app_install, app_open, search_saved.
export function trackFunnel(step, ctx = '') {
  if (typeof window === 'undefined') return;
  const d = { step, ctx };
  if (window.__llFunnelReady) window.dispatchEvent(new CustomEvent('ll:funnel', { detail: d }));
  else (window.__llFunnelQ = window.__llFunnelQ || []).push(d);
}
