import { setRequestLocale, getTranslations } from 'next-intl/server';
import { localePath } from '@/lib/routes';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'aboutPage' });
  return { title: `${t('title')} | Lock & Loft`, description: t('subtitle') };
}

export default async function AboutPage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'aboutPage' });
  const story = t.raw('story');
  const offer = t.raw('offer');
  const how = t.raw('how');

  return (
    <div className="bg-soft">
      <div className="bg-white border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-36 pb-16">
          <h1 className="text-4xl sm:text-5xl font-serif text-dark mb-4">{t('title')}</h1>
          <p className="text-lg text-text-muted max-w-2xl">{t('subtitle')}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-16">
        <section>
          <h2 className="text-2xl font-serif text-dark mb-4">{t('storyH')}</h2>
          <div className="space-y-4 text-text-muted leading-relaxed max-w-3xl">
            {story.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-serif text-dark mb-6">{t('offerH')}</h2>
          <div className="grid sm:grid-cols-2 gap-5">
            {offer.map((o) => (
              <a
                key={o.k}
                href={localePath(locale, 'hizmetler', `${o.k}/`)}
                className="block dark-card border border-white/10 rounded-xl p-6 hover:border-gold transition-colors"
              >
                <h3 className="font-serif text-lg text-dark mb-2">{o.h}</h3>
                <p className="text-sm text-text-muted leading-relaxed">{o.p}</p>
              </a>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-serif text-dark mb-6">{t('howH')}</h2>
          <div className="grid sm:grid-cols-2 gap-x-10 gap-y-6">
            {how.map((h) => (
              <div key={h.h} className="border-l-2 border-gold pl-4">
                <h3 className="font-semibold text-dark mb-1">{h.h}</h3>
                <p className="text-sm text-text-muted leading-relaxed">{h.p}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="dark-card border border-white/10 rounded-xl p-6 sm:p-8">
          <h2 className="text-xl font-serif text-dark mb-3">{t('partnersH')}</h2>
          <p className="text-text-muted leading-relaxed">{t('partnersP')}</p>
          <p className="text-xs text-text-muted mt-5">{t('note')}</p>
        </section>

        <section className="bg-dark text-white rounded-xl p-8 sm:p-10 text-center">
          <h2 className="text-2xl font-serif mb-2">{t('ctaH')}</h2>
          <p className="text-white/70 mb-6">{t('ctaP')}</p>
          <div className="flex flex-wrap justify-center gap-3">
            <a href={localePath(locale, 'iletisim')} className="bg-gold text-dark font-medium px-6 py-3 rounded-lg hover:opacity-90 transition-opacity">
              {t('ctaBtn')}
            </a>
            <a href={localePath(locale, 'hizmetler')} className="border border-white/30 px-6 py-3 rounded-lg hover:border-gold hover:text-gold transition-colors">
              {t('ctaBtn2')}
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
