'use client';

import { useState, useEffect, Suspense } from 'react';
import { useLocale } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { categoryLabel } from '@/lib/blogCategories';
import { ChevronRight, Calendar, Tag, ArrowLeft } from 'lucide-react';

function BlogDetailContent() {
  const locale = useLocale();
  const searchParams = useSearchParams();
  const slug = searchParams.get('s');
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) { setNotFound(true); setLoading(false); return; }
      setLoading(true);
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .single();

      if (error || !data) {
        setNotFound(true);
      } else {
        setPost(data);
      }
      setLoading(false);
    };
    fetchPost();
  }, [slug]);

  const getLocalized = (field) => {
    if (!post) return '';
    return post[`${field}_${locale}`] || post[`${field}_tr`] || post[`${field}_en`] || '';
  };

  const formatDate = (iso) => {
    if (!iso) return '';
    try {
      return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(iso));
    } catch {
      return iso;
    }
  };

  const labels = {
    tr: { blog: 'Blog', back: 'Blog\'a Dön', notFound: 'Yazı bulunamadı', loading: 'Yükleniyor...' },
    en: { blog: 'Blog', back: 'Back to Blog', notFound: 'Post not found', loading: 'Loading...' },
    es: { blog: 'Blog', back: 'Volver al Blog', notFound: 'Artículo no encontrado', loading: 'Cargando...' },
    de: { blog: 'Blog', back: 'Zurück zum Blog', notFound: 'Beitrag nicht gefunden', loading: 'Laden...' },
  };
  const t = labels[locale] || labels.tr;

  // Simple markdown-like rendering: paragraphs split by double newlines
  const renderContent = (content) => {
    if (!content) return null;
    const paragraphs = content.split(/\n\n+/);
    return paragraphs.map((p, i) => {
      if (p.startsWith('## ')) {
        return <h2 key={i} className="text-2xl font-serif text-dark mt-8 mb-4">{p.replace('## ', '')}</h2>;
      }
      if (p.startsWith('### ')) {
        return <h3 key={i} className="text-xl font-serif text-dark mt-6 mb-3">{p.replace('### ', '')}</h3>;
      }
      if (p.match(/^[-•]\s/m)) {
        const items = p.split(/\n/).filter(Boolean);
        return (
          <ul key={i} className="list-disc list-inside space-y-1.5 text-text-secondary leading-relaxed my-4">
            {items.map((item, j) => (
              <li key={j}>{item.replace(/^[-•]\s/, '')}</li>
            ))}
          </ul>
        );
      }
      const html = p
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>');
      return <p key={i} className="text-text-secondary leading-relaxed mb-4" dangerouslySetInnerHTML={{ __html: html }} />;
    });
  };

  if (loading) {
    return (
      <div className="bg-soft min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="bg-soft min-h-screen flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-2xl font-serif text-dark mb-4">{t.notFound}</h1>
        <a href={`/${locale}/blog/`} className="text-gold font-medium hover:underline">
          ← {t.back}
        </a>
      </div>
    );
  }

  return (
    <div className="bg-soft min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-band border-b border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-48 pb-4 flex items-center gap-2 text-sm text-text-muted">
          <a href={`/${locale}/`} className="hover:text-gold transition-colors">Lock & Loft</a>
          <ChevronRight size={14} />
          <a href={`/${locale}/blog/`} className="hover:text-gold transition-colors">{t.blog}</a>
          <ChevronRight size={14} />
          <span className="text-dark font-medium truncate">{getLocalized('title')}</span>
        </div>
      </div>

      {/* Cover image */}
      {post.cover_image && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <div className="rounded-2xl overflow-hidden h-64 sm:h-80 lg:h-96">
            <img
              src={post.cover_image}
              alt={getLocalized('title')}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Meta */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          {post.category && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gold/10 text-gold text-xs font-medium rounded-full">
              <Tag size={12} />
              {categoryLabel(post.category, locale)}
            </span>
          )}
          <span className="flex items-center gap-1.5 text-text-muted text-sm">
            <Calendar size={14} />
            {formatDate(post.published_at)}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-serif text-dark mb-4 leading-tight">{getLocalized('title')}</h1>

        {/* Excerpt */}
        {getLocalized('excerpt') && (
          <p className="text-lg text-text-muted mb-10 leading-relaxed">{getLocalized('excerpt')}</p>
        )}

        {/* Content */}
        <div className="prose-like">
          {renderContent(getLocalized('content'))}
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="mt-10 pt-6 border-t border-border flex flex-wrap gap-2">
            {post.tags.map(tag => (
              <span key={tag} className="px-3 py-1 bg-gray-100 text-text-muted text-xs rounded-full">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Back link */}
        <div className="mt-10 pt-8 border-t border-border">
          <a href={`/${locale}/blog/`} className="inline-flex items-center gap-2 text-gold font-medium hover:underline">
            <ArrowLeft size={16} />
            {t.back}
          </a>
        </div>
      </article>
    </div>
  );
}

export default function BlogDetailPage() {
  return (
    <Suspense fallback={
      <div className="bg-soft min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <BlogDetailContent />
    </Suspense>
  );
}
