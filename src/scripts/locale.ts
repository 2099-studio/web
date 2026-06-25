const STORAGE_KEY = '2099-locale';

export function getLocale(): 'es' | 'en' {
  return document.documentElement.lang === 'en' ? 'en' : 'es';
}

export function initLocale(): void {
  const toggle = document.querySelector<HTMLButtonElement>('[data-locale-toggle]');
  if (!toggle) return;

  toggle.addEventListener('click', () => {
    const current = getLocale();
    const next = current === 'es' ? 'en' : 'es';
    localStorage.setItem(STORAGE_KEY, next);
    const hash = window.location.hash;
    window.location.href = (next === 'en' ? '/en/' : '/') + hash;
  });
}
