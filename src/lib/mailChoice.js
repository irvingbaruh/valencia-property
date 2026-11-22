// "Send the member an e-mail as well" — a small check box next to the buttons that start something for a member
// (assign a service, change a stage, request / remove a document ...). Off by default; it applies to the next notification
// and switches itself off afterwards, so the admin never has to do anything to keep e-mails from going out.
// Only one box can be ticked at a time (each box has a scope), and a box that disappears (modal closed) un-ticks itself.
let scope = null;
const subs = new Set();
const emit = () => subs.forEach((f) => f(scope));

export const getMailScope = () => scope;
export function setMailScope(s) { scope = s || null; emit(); }
export function subscribeMailChoice(fn) { subs.add(fn); return () => subs.delete(fn); }
// Called by notifyMember: returns the choice and resets it.
export function takeMailChoice() { const v = scope !== null; if (v) { scope = null; emit(); } return v; }
