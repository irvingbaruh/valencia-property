'use client';

import { useTranslations, useLocale } from 'next-intl';
import { localePath } from '@/lib/routes';
import ParallaxBreak from './ParallaxBreak';

export function InterstitialWrapper({ image, alt, translationKey, video }) {
  const t = useTranslations('interstitials');
  const locale = useLocale();
  const hasCta = translationKey === 'interstitial1'; // only the first break links to the life guide
  return (
    <ParallaxBreak
      image={image}
      video={video}
      alt={alt}
      line1={t(`${translationKey}_line1`)}
      line2={t(`${translationKey}_line2`)}
      cta={hasCta ? { label: t(`${translationKey}_cta`), href: localePath(locale, 'rehber') } : null}
    />
  );
}
