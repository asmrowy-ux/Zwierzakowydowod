import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['pl', 'uk', 'en', 'es'],
  defaultLocale: 'pl',
});

export type Locale = (typeof routing.locales)[number];
