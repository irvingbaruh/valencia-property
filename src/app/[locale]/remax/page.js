import { setRequestLocale, getTranslations } from 'next-intl/server';
import { localePath } from '@/lib/routes';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'remaxPage' });
  return { title: `${t('title')} | Lock & Loft`, description: t('subtitle') };
}

export default async function RemaxPage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'remaxPage' });
  const sections = t.raw('sections');

  return (
    <div className="bg-soft">
      <div className="bg-white border-b border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-36 pb-16">
          <span className="inline-block bg-white border border-border rounded-lg px-3 py-2 mb-6">
            <img src="/brand/remax-logo.png" alt="RE/MAX" width={110} height={30} className="h-7 w-auto" />
          </span>
          <h1 className="text-4xl sm:text-5xl font-serif text-dark mb-4">{t('title')}</h1>
          <p className="text-lg text-text-muted">{t('subtitle')}</p>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-10">
        {sections.map((s) => (
          <section key={s.h}>
            <h2 className="text-xl font-serif text-dark mb-3">{s.h}</h2>
            <div className="space-y-3 text-text-muted leading-relaxed">
              {s.p.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </section>
        ))}
        <div className="flex flex-wrap gap-3 pt-2">
          <a href={localePath(locale, 'mulkler')} className="bg-dark text-white px-6 py-3 rounded-lg hover:bg-gold hover:text-dark transition-colors">
            {t('ctaBtn')}
          </a>
          <a href={localePath(locale, 'iletisim')} className="border border-border bg-white text-dark px-6 py-3 rounded-lg hover:border-gold transition-colors">
            {t('ctaBtn2')}
          </a>
        </div>
        <p className="text-xs text-text-muted border-t border-border pt-6">{t('legal')}</p>
      </div>
    </div>
  );
}
