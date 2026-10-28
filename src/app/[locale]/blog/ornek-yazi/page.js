import { setRequestLocale, getTranslations } from 'next-intl/server';
import { ChevronRight } from 'lucide-react';

export default async function BlogDetailPage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'blog' });
  const body = t.raw('detail.body') || [];

  return (
    <div className="bg-soft">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-2 text-sm text-text-muted">
          <a href={`/${locale}/`} className="hover:text-gold transition-colors">Valencia Property</a>
          <ChevronRight size={14} />
          <a href={`/${locale}/blog/`} className="hover:text-gold transition-colors">{t('title')}</a>
          <ChevronRight size={14} />
          <span className="text-dark font-medium">{t('detail.title')}</span>
        </div>
      </div>

      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-serif text-dark mb-4 leading-tight">{t('detail.title')}</h1>
        <p className="text-lg text-text-muted mb-10 leading-relaxed">{t('detail.excerpt')}</p>

        <div className="space-y-5">
          {body.map((p, i) => (
            <p key={i} className="text-text-secondary leading-relaxed">{p}</p>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <a href={`/${locale}/blog/`} className="text-gold font-medium hover:underline">
            ← {t('backToList')}
          </a>
        </div>
      </article>
    </div>
  );
}
