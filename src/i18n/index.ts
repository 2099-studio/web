import es from './es';
import en from './en';
import type { Locale, SiteContent } from './types';
import { localePath as buildLocalePath } from '../utils/paths';

export type { Locale, SiteContent, WorkIndustry, WorkService } from './types';

export const locales: Locale[] = ['es', 'en'];
export const defaultLocale: Locale = 'es';

const content: Record<Locale, SiteContent> = { es, en };

export function getContent(locale: Locale): SiteContent {
  return content[locale];
}

export function localePath(locale: Locale, hash = '', baseUrl = '/'): string {
  return buildLocalePath(locale, hash, baseUrl);
}

export function alternateLocale(locale: Locale): Locale {
  return locale === 'es' ? 'en' : 'es';
}

/** First es/en in the browser language list wins (native/primary preference). */
export function detectBrowserLocale(): Locale {
  if (typeof navigator === 'undefined') return defaultLocale;

  const list = [
    ...(navigator.languages?.length ? navigator.languages : []),
    navigator.language || '',
  ];

  for (const raw of list) {
    const lang = String(raw).toLowerCase();
    if (lang.startsWith('es')) return 'es';
    if (lang.startsWith('en')) return 'en';
  }

  return defaultLocale;
}
