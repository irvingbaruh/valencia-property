'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Bell, BellOff } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/providers/AuthProvider';
import { MEMBER_DEFAULTS, isIos, isStandalone, pushCapable, currentSubscription, enableMemberPush, disableMemberPush } from '@/lib/memberPush';
import InstallButton from '@/components/app/InstallButton';

const TYPES = ['new_listing', 'favorite_change', 'content', 'account'];
const num = (v) => { const n = parseFloat(String(v).replace(',', '.')); return isFinite(n) && n > 0 ? n : null; };

export default function MemberPushSettings() {
  const t = useTranslations('memberApp');
  const locale = useLocale();
  const { user } = useAuth();
  const [support, setSupport] = useState('checking'); // checking | ok | install | unsupported
  const [perm, setPerm] = useState('default');
  const [row, setRow] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const [above, setAbove] = useState('');
  const [below, setBelow] = useState('');
  const [rate, setRate] = useState(null);
  const flash = (text, ok = true) => setMsg({ text, ok });

  const load = useCallback(async () => {
    const sub = await currentSubscription();
    if (!sub || !user) { setRow(null); return; }
    const { data } = await supabase.from('push_subscriptions').select('*').eq('endpoint', sub.endpoint).eq('user_id', user.id).maybeSingle();
    setRow(data || null);
    if (data) {
      setAbove(data.rate_above ?? '');
      setBelow(data.rate_below ?? '');
      if (data.locale !== locale) supabase.from('push_subscriptions').update({ locale }).eq('id', data.id).then(() => {});
    }
  }, [user, locale]);

  useEffect(() => {
    if (isIos() && !isStandalone()) setSupport('install');
    else if (!pushCapable()) setSupport('unsupported');
    else { setSupport('ok'); setPerm(Notification.permission); load(); }
  }, [load]);

  useEffect(() => {
    fetch('https://api.frankfurter.dev/v1/latest?base=EUR&symbols=TRY').then((r) => r.json()).then((j) => setRate(j?.rates?.TRY || null)).catch(() => {});
  }, []);

  const enable = async () => {
    setBusy(true); setMsg(null);
    try {
      const r = await enableMemberPush(user.id, locale);
      setPerm(Notification.permission);
      if (!r.ok) flash(t(r.reason === 'denied' ? 'pushDenied' : 'pushFailed'), false);
      else await load();
    } catch { flash(t('pushFailed'), false); } finally { setBusy(false); }
  };

  const disable = async () => {
    setBusy(true); setMsg(null);
    await disableMemberPush();
    setRow(null);
    setBusy(false);
  };

  const patch = async (changes) => {
    setRow((r) => ({ ...r, ...changes }));
    await supabase.from('push_subscriptions').update(changes).eq('id', row.id);
  };
  const toggle = (key) => patch({ events: { ...MEMBER_DEFAULTS, ...(row.events || {}), [key]: !(row.events || MEMBER_DEFAULTS)[key] } });

  const saveRates = async () => {
    // a new threshold starts fresh: you are told when the rate crosses it from now on
    await patch({ rate_above: num(above), rate_below: num(below), rate_state: null });
    flash(t('rateSaved'));
  };

  const test = async () => {
    setBusy(true); setMsg(null);
    try {
      const { data: sess } = await supabase.auth.getSession();
      const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/push-member`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${sess.session.access_token}`, apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY },
        body: JSON.stringify({ kind: 'test' }),
      });
      const j = await res.json();
      flash(j.ok && j.sent > 0 ? t('testOk') : t('testFail'), !!(j.ok && j.sent > 0));
    } catch { flash(t('testFail'), false); } finally { setBusy(false); }
  };

  const ev = { ...MEMBER_DEFAULTS, ...(row?.events || {}) };
  const Switch = ({ on, onChange, label, hint }) => (
    <label className="flex items-start gap-3 cursor-pointer py-2">
      <input type="checkbox" checked={on} onChange={onChange} className="mt-1 w-5 h-5 accent-[#C9A84C] shrink-0" />
      <span><span className="block text-sm font-medium text-[var(--color-dark)]">{label}</span>{hint && <span className="block text-xs text-[var(--color-charcoal)] mt-0.5">{hint}</span>}</span>
    </label>
  );

  return (
    <div className="dark-card rounded-2xl shadow-sm p-8 max-w-lg mt-6">
      <h2 className="text-xl font-serif text-[var(--color-dark)] mb-2 flex items-center gap-2"><Bell size={20} /> {t('pushTitle')}</h2>
      <p className="text-[var(--color-charcoal)] text-sm mb-5">{t('pushIntro')}</p>

      {support === 'checking' && null}
      {support === 'unsupported' && <p className="text-sm text-[var(--color-charcoal)]">{t('pushUnsupported')}</p>}
      {support === 'install' && (
        <div className="space-y-3">
          <p className="text-sm text-[var(--color-charcoal)]">{t('pushNeedInstall')}</p>
          <InstallButton className="inline-flex items-center gap-2 rounded-lg bg-[#C9A84C] text-[#0B0B11] px-4 py-2.5 text-sm font-semibold" />
        </div>
      )}

      {support === 'ok' && !row && (
        <div className="space-y-3">
          {perm === 'denied' && <p className="text-sm text-red-600">{t('pushDenied')}</p>}
          <button onClick={enable} disabled={busy} className="inline-flex items-center gap-2 rounded-lg bg-[#C9A84C] text-[#0B0B11] px-4 py-2.5 text-sm font-semibold disabled:opacity-60">
            <Bell size={16} /> {busy ? t('pushBusy') : t('pushEnable')}
          </button>
        </div>
      )}

      {support === 'ok' && row && (
        <div>
          <p className="text-sm font-medium text-green-700 mb-3">{t('pushOn')}</p>
          <div className="divide-y divide-gray-100">
            {TYPES.map((k) => <Switch key={k} on={ev[k]} onChange={() => toggle(k)} label={t(`type_${k}`)} hint={t(`type_${k}_hint`)} />)}
            <div>
              <Switch on={ev.rate_alert} onChange={() => toggle('rate_alert')} label={t('type_rate_alert')} hint={t('type_rate_alert_hint')} />
              {ev.rate_alert && (
                <div className="pl-8 pb-3 space-y-3">
                  {rate && <p className="text-xs text-[var(--color-charcoal)]">{t('rateNow', { rate: rate.toLocaleString(locale === 'tr' ? 'tr-TR' : locale === 'de' ? 'de-DE' : locale === 'es' ? 'es-ES' : 'en-GB', { maximumFractionDigits: 2 }) })}</p>}
                  <div className="grid grid-cols-2 gap-3">
                    <label className="text-xs text-[var(--color-charcoal)]">{t('rateAbove')}
                      <input inputMode="decimal" value={above} onChange={(e) => setAbove(e.target.value)} placeholder={rate ? String(Math.round(rate + 2)) : ''} className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-[var(--color-dark)]" />
                    </label>
                    <label className="text-xs text-[var(--color-charcoal)]">{t('rateBelow')}
                      <input inputMode="decimal" value={below} onChange={(e) => setBelow(e.target.value)} placeholder={rate ? String(Math.round(rate - 2)) : ''} className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-[var(--color-dark)]" />
                    </label>
                  </div>
                  <button onClick={saveRates} className="rounded-lg border border-[#C9A84C] text-sm px-3.5 py-2 text-[var(--color-dark)]">{t('rateSave')}</button>
                </div>
              )}
            </div>
            <Switch on={ev.rate_daily} onChange={() => toggle('rate_daily')} label={t('type_rate_daily')} hint={t('type_rate_daily_hint')} />
          </div>
          <div className="flex flex-wrap gap-3 mt-5">
            <button onClick={test} disabled={busy} className="rounded-lg border border-gray-300 px-3.5 py-2 text-sm text-[var(--color-dark)] disabled:opacity-60">{t('pushTest')}</button>
            <button onClick={disable} disabled={busy} className="inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm text-red-600"><BellOff size={15} /> {t('pushDisable')}</button>
          </div>
        </div>
      )}

      {msg && <p className={`text-sm mt-4 ${msg.ok ? 'text-green-700' : 'text-red-600'}`}>{msg.text}</p>}
      <div className="mt-6 pt-5 border-t border-gray-100">
        <p className="text-xs text-[var(--color-charcoal)] mb-3">{t('installHint')}</p>
        <InstallButton className="inline-flex items-center gap-2 rounded-lg border border-[#C9A84C] px-3.5 py-2 text-sm text-[var(--color-dark)]" />
      </div>
    </div>
  );
}
