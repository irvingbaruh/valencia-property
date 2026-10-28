import { setRequestLocale, getTranslations } from 'next-intl/server';
import { ArrowRight, Calendar } from 'lucide-react';

export default async function BlogPage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'blog' });
  const posts = t.raw('posts') || [];

  const formatDate = (iso) => {
    try {
      return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(iso));
    } catch {
      return iso;
    }
  };

  return (
    <div className="bg-soft min-h-screen">
      {/* Hero */}
      <div className="bg-white border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="inline-flex items-center gap-3 mb-6">
            <span className="h-px w-8 bg-gold/60" />
            <span className="text-gold text-xs font-sans tracking-[0.2em] uppercase">Rehber</span>
            <span className="h-px w-8 bg-gold/60" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-serif text-dark mb-4">{t('title')}</h1>
          <p className="text-lg text-text-muted max-w-2xl mx-auto">{t('subtitle')}</p>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post, i) => (
            <a
              key={i}
              href={`/${locale}/blog/ornek-yazi/`}
              className="group bg-white rounded-2xl overflow-hidden border border-border hover:border-gold/40 hover:shadow-card-hover transition-all duration-300"
            >
              <div className="relative h-52 overflow-hidden">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 bg-white/90 backdrop-blur-sm text-dark text-xs font-semibold rounded-full">
                    {post.category}
                  </span>
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-1.5 text-text-muted text-xs mb-3">
                  <Calendar size={13} />
                  <span>{formatDate(post.date)}</span>
                </div>
                <h3 className="font-serif text-lg text-dark leading-snug mb-3 group-hover:text-gold transition-colors duration-300">
                  {post.title}
                </h3>
                <span className="inline-flex items-center gap-1.5 text-sm text-gold font-medium">
                  {t('readMore')}
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-200" />
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
