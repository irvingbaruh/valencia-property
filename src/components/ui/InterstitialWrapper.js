'use client';

import { useTranslations } from 'next-intl';
import ParallaxBreak from './ParallaxBreak';

export function InterstitialWrapper({ image, alt, translationKey }) {
  const t = useTranslations('interstitials');
  return (
    <ParallaxBreak
      image={image}
      alt={alt}
      line1={t(`${translationKey}_line1`)}
      line2={t(`${translationKey}_line2`)}
    />
  );
}
