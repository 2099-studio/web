import { getContent } from '../i18n';
import { getLocale } from './locale';
import { syncFaviconWithTheme } from './favicon';

const STORAGE_KEY = '2099-theme';

export function getTheme(): 'dark' | 'light' {
  const attr = document.documentElement.getAttribute('data-theme');
  return attr === 'light' ? 'light' : 'dark';
}

function syncToggleAttrs(theme: 'dark' | 'light'): void {
  const t = getContent(getLocale()).theme;
  const label = theme === 'dark' ? t.ariaLight : t.ariaDark;
  const title = theme === 'dark' ? t.titleLight : t.titleDark;

  document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]').forEach((toggle) => {
    toggle.setAttribute('aria-label', label);
    toggle.setAttribute('aria-pressed', theme === 'light' ? 'true' : 'false');
    toggle.setAttribute('title', title);
  });
}

export function setTheme(theme: 'dark' | 'light', animate = true): void {
  if (animate) {
    document.body.classList.add('is-theme-transitioning');
    window.setTimeout(() => {
      document.body.classList.remove('is-theme-transitioning');
    }, 300);
  }

  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(STORAGE_KEY, theme);

  const themeColor = theme === 'light' ? '#FFFFFF' : '#000000';
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', themeColor);

  syncToggleAttrs(theme);
}

export function initTheme(): void {
  const toggles = document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]');
  if (!toggles.length) return;

  setTheme(getTheme(), false);

  toggles.forEach((toggle) => {
    toggle.addEventListener('click', () => {
      setTheme(getTheme() === 'dark' ? 'light' : 'dark');
      syncFaviconWithTheme();
    });
  });
}
