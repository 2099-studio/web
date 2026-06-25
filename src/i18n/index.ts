import es from './es';
import en from './en';
import type { Locale, SiteContent } from './types';

export type { Locale, SiteContent, WorkIndustry, WorkService } from './types';

export const locales: Locale[] = ['es', 'en'];
export const defaultLocale: Locale = 'es';

const content: Record<Locale, SiteContent> = { es, en };

export function getContent(locale: Locale): SiteContent {
  return content[locale];
}

export function localePath(locale: Locale, hash = ''): string {
  const base = locale === 'en' ? '/en/' : '/';
  return hash ? `${base}${hash.startsWith('#') ? hash : `#${hash}`}` : base;
}

export function alternateLocale(locale: Locale): Locale {
  return locale === 'es' ? 'en' : 'es';
}

export function detectBrowserLocale(): Locale {
  if (typeof navigator === 'undefined') return defaultLocale;

  const lang = (navigator.language || '').toLowerCase();
  if (lang.startsWith('es')) return 'es';
  if (lang.startsWith('en')) return 'en';
  return defaultLocale;
}
