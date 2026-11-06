import { setRequestLocale, getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'privacy' });
  return { title: `${t('title')} | Lock & Loft` };
}

export default async function PrivacyPage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'privacy' });
  const sections = t.raw('sections');

  return (
    <div className="bg-soft">
      <div className="bg-white border-b border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-4xl sm:text-5xl font-serif text-dark mb-4">{t('title')}</h1>
          <p className="text-lg text-text-muted">{t('subtitle')}</p>
          <p className="text-sm text-text-muted mt-4">{t('updated')}</p>
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
        <a href={`/${locale}/`} className="inline-block text-gold hover:underline">
          {t('back')}
        </a>
      </div>
    </div>
  );
}
