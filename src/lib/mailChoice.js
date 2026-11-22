// "Send the member an e-mail as well" — one switch for every member notification the admin triggers (new service, stage change,
// document request/removal ...). Off by default; it applies to the next notification and switches itself off again afterwards,
// so the admin never has to do anything to keep e-mails from going out.
let on = false;
const subs = new Set();
const emit = () => subs.forEach((f) => f(on));

export const getMailChoice = () => on;
export function setMailChoice(v) { on = !!v; emit(); }
export function subscribeMailChoice(fn) { subs.add(fn); return () => subs.delete(fn); }
// Called by notifyMember: returns the choice and resets it.
export function takeMailChoice() { const v = on; if (on) { on = false; emit(); } return v; }
