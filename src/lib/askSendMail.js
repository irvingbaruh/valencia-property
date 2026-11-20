// Small dark dialog (no React tree needed) asking the admin whether the member should also get an e-mail.
// Resolves true = send the e-mail, false = no e-mail. The in-app notification and the phone push always go.
export function askSendMail(subject) {
  return new Promise((resolve) => {
    if (typeof document === 'undefined') return resolve(false);
    const wrap = document.createElement('div');
    wrap.style.cssText = 'position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(0,0,0,.7);font-family:Arial,Helvetica,sans-serif';
    const box = document.createElement('div');
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.style.cssText = 'width:100%;max-width:420px;border-radius:16px;padding:22px;background:#151521;border:1px solid #1E1E2E;color:#fff';
    const h = document.createElement('p');
    h.textContent = 'Üyeye e-posta da gönderilsin mi?';
    h.style.cssText = 'margin:0 0 8px;font-size:16px;font-weight:700';
    const p = document.createElement('p');
    p.textContent = `${subject} Uygulama bildirimi (varsa) ve panel bildirimi her durumda gider; bu soru yalnızca e-postayı belirler.`;
    p.style.cssText = 'margin:0 0 18px;font-size:13px;line-height:1.5;color:#9A9AAA';
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;gap:10px;flex-wrap:wrap';
    const done = (v) => { document.removeEventListener('keydown', onKey); wrap.remove(); resolve(v); };
    const onKey = (e) => { if (e.key === 'Escape') done(false); };
    const mk = (label, v, primary) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = label;
      b.style.cssText = `flex:1;min-width:140px;padding:10px 14px;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;border:1px solid ${primary ? '#C9A84C' : '#2A2A3C'};background:${primary ? '#C9A84C' : 'transparent'};color:${primary ? '#0B0B11' : '#fff'}`;
      b.onclick = () => done(v);
      return b;
    };
    const yes = mk('E-posta gönder', true, true);
    row.append(yes, mk('E-posta gönderme', false, false));
    box.append(h, p, row);
    wrap.append(box);
    document.addEventListener('keydown', onKey);
    document.body.append(wrap);
    yes.focus();
  });
}
