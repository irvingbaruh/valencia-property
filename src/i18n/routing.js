import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['tr', 'es', 'en', 'de'],
  defaultLocale: 'tr',
});
