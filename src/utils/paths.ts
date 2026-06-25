/** Astro `import.meta.env.BASE_URL` — always ends with `/`. */
export function withBase(path: string, baseUrl = '/'): string {
  const base = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  const normalized = path.startsWith('/') ? path.slice(1) : path;
  return `${base}${normalized}`;
}

export function localePath(locale: 'es' | 'en', hash = '', baseUrl = '/'): string {
  const base = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  const path = locale === 'en' ? `${base}en/` : base;
  if (!hash) return path;
  return `${path}${hash.startsWith('#') ? hash : `#${hash}`}`;
}

export function getClientBaseUrl(): string {
  if (typeof document === 'undefined') return '/';
  return document.querySelector('meta[name="base-url"]')?.getAttribute('content') ?? '/';
}

export function clientLocalePath(locale: 'es' | 'en', hash = ''): string {
  return localePath(locale, hash, getClientBaseUrl());
}

export function isEnglishPathname(pathname: string, baseUrl = '/'): boolean {
  const base = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const enRoot = base === '' ? '/en' : `${base}/en`;
  return pathname === enRoot || pathname === `${enRoot}/` || pathname.startsWith(`${enRoot}/`);
}

export function isDefaultLocalePath(pathname: string, baseUrl = '/'): boolean {
  const base = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  if (base === '/') {
    return pathname === '/' || pathname === '/index.html';
  }
  return pathname === base || pathname === `${base}index.html`;
}
