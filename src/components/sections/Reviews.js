'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useLocale } from 'next-intl';
import { Star, Quote, ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/providers/AuthProvider';
import { localePath } from '@/lib/routes';
import { RV } from '@/lib/reviewsText';
import ScrollReveal from '@/components/ui/ScrollReveal';

const t = (o, l) => (o && (o[l] || o.tr)) || '';

function Stars({ value, size = 14 }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`${value}/5`}>
      {[1, 2, 3, 4, 5].map((n) => <Star key={n} size={size} className={n <= value ? 'text-gold fill-gold' : 'text-white/25'} />)}
    </span>
  );
}

// First name plus the initial of the last name, from the member's profile.
function shortName(profile, user) {
  const raw = (profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Member').trim();
  const parts = raw.split(/\s+/);
  return parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.` : parts[0];
}

function ReviewCard({ r, locale }) {
  return (
    <article className="snap-start shrink-0 w-[85%] sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] bg-dark-mid rounded-xl p-6 border border-white/10 flex flex-col">
      <Quote size={22} className="text-gold/30 mb-3" />
      {r.comment ? <p className="text-white text-sm leading-relaxed mb-4 whitespace-pre-line">&ldquo;{r.comment}&rdquo;</p> : <div className="flex-1" />}
      {r.admin_reply && (
        <div className="mb-4 rounded-lg bg-white/5 border-l-2 border-gold p-3">
          <p className="text-xs text-gold mb-1">{t(RV.reply, locale)}</p>
          <p className="text-sm text-white/90 whitespace-pre-line">{r.admin_reply}</p>
        </div>
      )}
      <div className="mt-auto flex items-center gap-3 pt-4 border-t border-white/10">
        <span className="w-10 h-10 rounded-full bg-gold/15 flex items-center justify-center text-gold font-semibold text-sm">{r.display_name[0]?.toUpperCase()}</span>
        <p className="text-sm font-medium text-white">{r.display_name}</p>
        <span className="ml-auto"><Stars value={r.rating} size={12} /></span>
      </div>
    </article>
  );
}

function ReviewForm({ locale }) {
  const { user, profile, loading } = useAuth();
  const [mine, setMine] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [edit, setEdit] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase.from('reviews').select('id,rating,comment,status').eq('user_id', user.id).maybeSingle().then(({ data }) => {
      if (data) { setMine(data); setRating(data.rating); setComment(data.comment || ''); setEdit(false); }
    });
  }, [user]);

  const submit = async (e) => {
    e.preventDefault();
    if (!rating) { setMsg(t(RV.stars, locale)); return; }
    setBusy(true); setMsg('');
    const row = { user_id: user.id, rating, comment: comment.trim() || null, display_name: shortName(profile, user), lang: locale, status: 'pending', admin_reply: null, published_at: null };
    const { error } = mine
      ? await supabase.from('reviews').update(row).eq('id', mine.id)
      : await supabase.from('reviews').insert(row);
    setBusy(false);
    if (error) { setMsg(t(RV.error, locale)); return; }
    setMine({ ...(mine || {}), rating, comment: row.comment, status: 'pending' });
    setEdit(false);
  };

  if (loading) return null;
  const shell = 'mt-10 max-w-2xl mx-auto rounded-xl border border-gold/30 bg-white/5 p-6 sm:p-8 text-center flex flex-col items-center';
  const head = (
    <div className="flex flex-col items-center gap-3 mb-5">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gold text-dark"><MessageCircle size={20} /></span>
      <div>
        <h3 className="font-serif text-xl text-white">{t(RV.writeTitle, locale)}</h3>
        <p className="text-sm text-white/70">{t(RV.writeSub, locale)}</p>
      </div>
    </div>
  );

  if (!user) {
    return (
      <div className={shell}>
        {head}
        <p className="text-sm text-white/80 mb-4">{t(RV.needLogin, locale)}</p>
        <a href={localePath(locale, 'giris')} className="inline-flex items-center rounded-lg bg-gold px-5 py-2.5 text-sm font-medium text-dark hover:opacity-90">{t(RV.login, locale)}</a>
      </div>
    );
  }

  if (mine && !edit) {
    const s = mine.status;
    return (
      <div className={shell}>
        {head}
        <div className="flex items-center justify-center gap-3 mb-3"><Stars value={mine.rating} size={18} /></div>
        {mine.comment && <p className="text-sm text-white/90 mb-3 whitespace-pre-line">&ldquo;{mine.comment}&rdquo;</p>}
        <p className="text-sm text-gold mb-4">{t(s === 'approved' ? RV.live : s === 'rejected' ? RV.rejected : RV.pending, locale)}</p>
        <button onClick={() => setEdit(true)} className="text-sm text-white underline">{t(RV.update, locale)}</button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className={shell}>
      {head}
      <div className="flex justify-center gap-1 mb-4" role="radiogroup" aria-label={t(RV.stars, locale)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" role="radio" aria-checked={rating === n} onClick={() => setRating(n)} className="p-1" aria-label={`${n}`}>
            <Star size={30} className={n <= rating ? 'text-gold fill-gold' : 'text-white/30'} />
          </button>
        ))}
      </div>
      <textarea value={comment} onChange={(e) => setComment(e.target.value)} maxLength={1000} rows={4} placeholder={t(RV.placeholder, locale)}
        className="w-full rounded-lg bg-[#0B0B11] border border-white/15 p-3 text-sm text-white text-left placeholder:text-white/40 focus:outline-none focus:border-gold" />
      {msg && <p className="text-sm text-red-300 mt-2">{msg}</p>}
      <button disabled={busy} className="mt-4 inline-flex items-center rounded-lg bg-gold px-5 py-2.5 text-sm font-medium text-dark hover:opacity-90 disabled:opacity-60">{busy ? t(RV.sending, locale) : t(RV.send, locale)}</button>
      <p className="text-xs text-white/50 mt-4">{t(RV.note, locale)}</p>
    </form>
  );
}

export default function Reviews() {
  const locale = useLocale();
  const [rows, setRows] = useState([]);
  const track = useRef(null);

  useEffect(() => {
    supabase.from('reviews').select('id,rating,comment,display_name,lang,admin_reply,published_at')
      .eq('status', 'approved').order('published_at', { ascending: false }).limit(30)
      .then(({ data }) => setRows(data || []));
  }, []);

  const scroll = useCallback((dir) => {
    const el = track.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' });
  }, []);

  const avg = rows.length ? rows.reduce((a, r) => a + r.rating, 0) / rows.length : 0;

  return (
    <section className="section-padding bg-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="text-center mb-10">
          <div className="accent-line mx-auto mb-4" />
          <h2 className="text-3xl md:text-4xl font-serif text-white mb-3">{t(RV.title, locale)}</h2>
          <p className="text-white max-w-xl mx-auto">{t(rows.length ? RV.subOne : RV.subNone, locale)}</p>
          {rows.length > 0 && (
            <p className="mt-3 inline-flex items-center gap-2 text-white">
              <Stars value={Math.round(avg)} size={18} />
              <span className="text-sm">{avg.toFixed(1)} · {rows.length} {t(RV.count, locale)}</span>
            </p>
          )}
        </ScrollReveal>

        {rows.length > 0 && (
          <div className="relative">
            <div ref={track} className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {rows.map((r) => <ReviewCard key={r.id} r={r} locale={locale} />)}
            </div>
            {rows.length > 1 && (
              <div className="mt-4 flex justify-center gap-3">
                <button onClick={() => scroll(-1)} aria-label={t(RV.prev, locale)} className="h-10 w-10 rounded-full border border-white/20 text-white flex items-center justify-center hover:border-gold"><ChevronLeft size={18} /></button>
                <button onClick={() => scroll(1)} aria-label={t(RV.next, locale)} className="h-10 w-10 rounded-full border border-white/20 text-white flex items-center justify-center hover:border-gold"><ChevronRight size={18} /></button>
              </div>
            )}
          </div>
        )}

        <ReviewForm locale={locale} />
      </div>
    </section>
  );
}
