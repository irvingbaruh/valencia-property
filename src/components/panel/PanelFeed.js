'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { localePath } from '@/lib/routes';
import GuideTeaser from '@/components/sections/GuideTeaser';
import { fetchNotes, noteTitle, noteSummary, noteDate } from '@/lib/marketNotes';

const pick = (r, base, l) => [l, 'tr', 'en', 'es', 'de'].map((x) => r[`${base}_${x}`]).find((v) => v && String(v).trim()) || '';

// Latest market notes and blog posts, shown on the member panel's first tab.
export default function PanelFeed() {
  const t = useTranslations('memberApp');
  const locale = useLocale();
  const [notes, setNotes] = useState([]);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetchNotes({ limit: 3 }).then(setNotes);
    supabase.from('blog_posts')
      .select('id,slug,published_at,title_tr,title_en,title_es,title_de')
      .eq('status', 'published').order('published_at', { ascending: false }).limit(3)
      .then(({ data }) => setPosts(data || []));
  }, []);

  return (
    <>
    <GuideTeaser variant="panel" />
    {(notes.length > 0 || posts.length > 0) && (
    <div className="mt-6 grid lg:grid-cols-[3fr_2fr] gap-6">
      {notes.length > 0 && (
        <section className="dark-card rounded-2xl shadow-sm p-6">
          <div className="flex items-baseline justify-between gap-3 mb-4">
            <h3 className="font-serif text-xl text-[var(--color-dark)]">{t('feedTitle')}</h3>
            <a href={localePath(locale, 'piyasa')} className="text-sm text-[var(--color-gold)] inline-flex items-center gap-1 shrink-0">{t('feedAll')} <ArrowRight size={14} /></a>
          </div>
          <ul className="divide-y divide-white/10">
            {notes.map((n) => (
              <li key={n.id} className="py-3 first:pt-0 last:pb-0">
                <a href={localePath(locale, 'piyasa')} className="block">
                  <p className="font-medium text-[var(--color-dark)] leading-snug">{noteTitle(n, locale)}</p>
                  <p className="text-sm text-[var(--color-charcoal)] mt-1 line-clamp-2">{noteSummary(n, locale)}</p>
                  <p className="text-xs text-[var(--color-charcoal)]/70 mt-1">{noteDate(n.published_at, locale)}</p>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
      {posts.length > 0 && (
        <section className="dark-card rounded-2xl shadow-sm p-6">
          <div className="flex items-baseline justify-between gap-3 mb-4">
            <h3 className="font-serif text-xl text-[var(--color-dark)]">{t('feedBlogTitle')}</h3>
            <a href={`/${locale}/blog/`} className="text-sm text-[var(--color-gold)] inline-flex items-center gap-1 shrink-0">{t('feedBlogAll')} <ArrowRight size={14} /></a>
          </div>
          <ul className="divide-y divide-white/10">
            {posts.map((p) => (
              <li key={p.id} className="py-3 first:pt-0 last:pb-0">
                <a href={`/${locale}/blog/yazi/?s=${p.slug}`} className="block">
                  <p className="font-medium text-[var(--color-dark)] leading-snug">{pick(p, 'title', locale)}</p>
                  <p className="text-xs text-[var(--color-charcoal)]/70 mt-1">{noteDate(p.published_at, locale)}</p>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
    )}
    </>
  );
}
