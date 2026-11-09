'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { supabase } from '@/lib/supabase';
import { categoryLabel } from '@/lib/blogCategories';
import { ArrowRight, Calendar, Search, Tag } from 'lucide-react';

export default function BlogPage() {
  const locale = useLocale();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('blog_posts')
        .select('id, slug, category, cover_image, published_at, title_tr, title_en, title_es, title_de, excerpt_tr, excerpt_en, excerpt_es, excerpt_de')
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      if (!error && data) {
        setPosts(data);
        // Extract unique categories
        const cats = [...new Set(data.map(p => p.category).filter(Boolean))];
        setCategories(cats);
      }
      setLoading(false);
    };
    fetchPosts();
  }, []);

  const getLocalized = (post, field) => {
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

  const filteredPosts = posts.filter(post => {
    const title = getLocalized(post, 'title').toLowerCase();
    const excerpt = getLocalized(post, 'excerpt').toLowerCase();
    const matchesSearch = !search.trim() || title.includes(search.toLowerCase()) || excerpt.includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const labels = {
    tr: { title: 'Blog & Rehber', subtitle: 'Valencia\'da gayrimenkul yatırımı hakkında bilgi ve rehberler', search: 'Yazılarda ara...', readMore: 'Devamını Oku', all: 'Tümü', noPosts: 'Henüz yayınlanmış yazı yok.', guide: 'Rehber' },
    en: { title: 'Blog & Guide', subtitle: 'Information and guides about real estate investment in Valencia', search: 'Search posts...', readMore: 'Read More', all: 'All', noPosts: 'No published posts yet.', guide: 'Guide' },
    es: { title: 'Blog & Guía', subtitle: 'Información y guías sobre inversión inmobiliaria en Valencia', search: 'Buscar artículos...', readMore: 'Leer Más', all: 'Todos', noPosts: 'Aún no hay artículos publicados.', guide: 'Guía' },
    de: { title: 'Blog & Ratgeber', subtitle: 'Informationen und Ratgeber zur Immobilieninvestition in Valencia', search: 'Beiträge suchen...', readMore: 'Weiterlesen', all: 'Alle', noPosts: 'Noch keine veröffentlichten Beiträge.', guide: 'Ratgeber' },
  };
  const t = labels[locale] || labels.tr;

  return (
    <div className="bg-soft min-h-screen">
      {/* Hero */}
      <div className="bg-white border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-36 pb-16 text-center">
          <div className="inline-flex items-center gap-3 mb-6">
            <span className="h-px w-8 bg-gold/60" />
            <span className="text-gold text-xs font-sans tracking-[0.2em] uppercase">{t.guide}</span>
            <span className="h-px w-8 bg-gold/60" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-serif text-dark mb-4">{t.title}</h1>
          <p className="text-lg text-text-muted max-w-2xl mx-auto">{t.subtitle}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t.search}
              className="w-full bg-white border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-dark placeholder:text-text-muted focus:border-gold focus:outline-none"
            />
          </div>
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                  selectedCategory === 'all'
                    ? 'bg-gold text-dark border-gold'
                    : 'bg-white text-text-muted border-white/10 hover:border-gold/50'
                }`}
              >
                {t.all}
              </button>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                    selectedCategory === cat
                      ? 'bg-gold text-dark border-gold'
                      : 'bg-white text-text-muted border-white/10 hover:border-gold/50'
                  }`}
                >
                  {categoryLabel(cat, locale)}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-20 text-text-muted">
            <p>{t.noPosts}</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map(post => (
              <a
                key={post.id}
                href={`/${locale}/blog/yazi/?s=${post.slug}`}
                className="group dark-card rounded-2xl overflow-hidden border border-white/10 hover:border-gold/40 hover:shadow-card-hover transition-all duration-300"
              >
                <div className="relative h-52 overflow-hidden bg-gray-100">
                  {post.cover_image ? (
                    <img
                      src={post.cover_image}
                      alt={getLocalized(post, 'title')}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gold/10 to-gold/5">
                      <Tag size={32} className="text-gold/30" />
                    </div>
                  )}
                  {post.category && (
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 bg-white/90 backdrop-blur-sm text-dark text-xs font-semibold rounded-full">
                        {categoryLabel(post.category, locale)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-1.5 text-text-muted text-xs mb-3">
                    <Calendar size={13} />
                    <span>{formatDate(post.published_at)}</span>
                  </div>
                  <h3 className="font-serif text-lg text-dark leading-snug mb-2 group-hover:text-gold transition-colors duration-300">
                    {getLocalized(post, 'title')}
                  </h3>
                  {getLocalized(post, 'excerpt') && (
                    <p className="text-sm text-text-muted line-clamp-2 mb-3">{getLocalized(post, 'excerpt')}</p>
                  )}
                  <span className="inline-flex items-center gap-1.5 text-sm text-gold font-medium">
                    {t.readMore}
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-200" />
                  </span>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
