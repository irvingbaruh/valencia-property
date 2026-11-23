'use client';
// Runtime Turkish → English layer for the admin panel (Turkish is the source language).
import { EXACT, PATTERNS } from './adminDict';

const KEY = 'll_admin_lang';
const ATTRS = ['placeholder', 'title', 'aria-label', 'alt'];
const listeners = new Set();
let lang = 'tr';
let observer = null;
const textRec = new WeakMap(); // node -> { orig, out }
const attrRec = new WeakMap(); // element -> { attr: { orig, out } }
let nativeDialogs = null;

const compiled = PATTERNS.map(([tr, en]) => {
  const names = [];
  const src = tr.replace(/[.*+?^$()|[\]\\]/g, '\\$&').replace(/\{([a-z0-9]+)\}/gi, (_, n) => { names.push(n); return '([\\s\\S]+?)'; });
  return { re: new RegExp('^' + src + '$'), names, en };
});

export function translate(str) {
  if (!str || lang !== 'en') return str;
  const m = str.match(/^(\s*)([\s\S]*?)(\s*)$/);
  const core = m[2];
  if (!core) return str;
  let out = EXACT[core];
  if (out === undefined) {
    for (const p of compiled) {
      const r = core.match(p.re);
      if (r) {
        out = p.en.replace(/\{([a-z0-9]+)\}/gi, (_, n) => {
          const i = p.names.indexOf(n);
          const v = i >= 0 ? r[i + 1] : '';
          return EXACT[v.trim()] ?? v;
        });
        break;
      }
    }
  }
  return out === undefined ? str : m[1] + out + m[3];
}

function doText(node) {
  const v = node.nodeValue;
  const rec = textRec.get(node);
  if (rec && v === rec.out) return;
  if (!v || !v.trim()) return;
  const out = translate(v);
  if (out !== v) { textRec.set(node, { orig: v, out }); node.nodeValue = out; }
  else if (rec) textRec.delete(node);
}

function doAttrs(el) {
  for (const a of ATTRS) {
    if (!el.hasAttribute || !el.hasAttribute(a)) continue;
    const v = el.getAttribute(a);
    const recs = attrRec.get(el) || {};
    if (recs[a] && recs[a].out === v) continue;
    const out = translate(v);
    if (out !== v) { recs[a] = { orig: v, out }; attrRec.set(el, recs); el.setAttribute(a, out); }
    else if (recs[a]) { delete recs[a]; }
  }
}

function walk(root) {
  if (!root) return;
  if (root.nodeType === 3) { doText(root); return; }
  if (root.nodeType !== 1) return;
  const tag = root.tagName;
  if (tag === 'SCRIPT' || tag === 'STYLE' || root.closest?.('[data-no-i18n]')) return;
  doAttrs(root);
  const tw = document.createTreeWalker(root, 1 | 4, {
    acceptNode: (n) => (n.nodeType === 1 && (n.tagName === 'SCRIPT' || n.tagName === 'STYLE' || n.hasAttribute('data-no-i18n')) ? 2 : 1),
  });
  let n = tw.nextNode();
  while (n) { if (n.nodeType === 3) doText(n); else doAttrs(n); n = tw.nextNode(); }
}

function restoreAll() {
  const tw = document.createTreeWalker(document.body, 1 | 4);
  let n = tw.nextNode();
  while (n) {
    if (n.nodeType === 3) {
      const r = textRec.get(n);
      if (r && n.nodeValue === r.out) n.nodeValue = r.orig;
      textRec.delete(n);
    } else {
      const recs = attrRec.get(n);
      if (recs) { for (const a in recs) if (n.getAttribute(a) === recs[a].out) n.setAttribute(a, recs[a].orig); attrRec.delete(n); }
    }
    n = tw.nextNode();
  }
}

function patchDialogs(on) {
  if (typeof window === 'undefined') return;
  if (on && !nativeDialogs) {
    nativeDialogs = { confirm: window.confirm, alert: window.alert, prompt: window.prompt };
    window.confirm = (m) => nativeDialogs.confirm.call(window, translate(String(m)));
    window.alert = (m) => nativeDialogs.alert.call(window, translate(String(m)));
    window.prompt = (m, d) => nativeDialogs.prompt.call(window, translate(String(m)), d);
  } else if (!on && nativeDialogs) {
    window.confirm = nativeDialogs.confirm; window.alert = nativeDialogs.alert; window.prompt = nativeDialogs.prompt;
    nativeDialogs = null;
  }
}

function start() {
  if (observer || typeof document === 'undefined') return;
  walk(document.body);
  observer = new MutationObserver((muts) => {
    observer.disconnect();
    for (const m of muts) {
      if (m.type === 'characterData') doText(m.target);
      else if (m.type === 'attributes') doAttrs(m.target);
      else m.addedNodes.forEach((n) => walk(n));
    }
    observer.observe(document.body, OPTS);
  });
  observer.observe(document.body, OPTS);
}
const OPTS = { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS };

function stop() { if (observer) { observer.disconnect(); observer = null; } }

export function getAdminLang() { return lang; }
export function subscribeAdminLang(fn) { listeners.add(fn); return () => listeners.delete(fn); }

export function setAdminLang(next) {
  if (next !== 'tr' && next !== 'en') return;
  lang = next;
  try { localStorage.setItem(KEY, next); } catch {}
  if (typeof document !== 'undefined') document.documentElement.setAttribute('data-admin-lang', next);
  if (next === 'en') { patchDialogs(true); start(); walk(document.body); }
  else { stop(); restoreAll(); patchDialogs(false); }
  listeners.forEach((f) => f(next));
}

export function initAdminLang() {
  let saved = 'tr';
  try { saved = localStorage.getItem(KEY) || 'tr'; } catch {}
  if (saved === 'en') setAdminLang('en');
  else listeners.forEach((f) => f('tr'));
}
