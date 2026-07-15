import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * Scale pinned/fullscreen section content to fit the notebook viewport
 * without changing Figma proportions (uniform transform only).
 */
export function initViewportFit(): () => void {
  const nodes = Array.from(document.querySelectorAll<HTMLElement>('[data-viewport-fit]'));
  if (!nodes.length) return () => {};

  const desktopMq = window.matchMedia('(min-width: 768px)');

  const apply = () => {
    const viewportH = window.innerHeight;
    const enabled = desktopMq.matches;

    nodes.forEach((el) => {
      if (!enabled) {
        el.style.setProperty('--viewport-fit-scale', '1');
        return;
      }

      el.style.setProperty('--viewport-fit-scale', '1');
      // Force layout with scale = 1 before measuring
      void el.offsetHeight;

      const rect = el.getBoundingClientRect();
      const contentH = Math.max(el.scrollHeight, rect.height);
      if (!contentH) return;

      // Leave a little breathing room inside the pinned viewport
      const budget = Math.max(320, viewportH - 24);
      const next = Math.min(1, budget / contentH);
      // Floor so ultra-short screens stay readable
      el.style.setProperty('--viewport-fit-scale', String(Math.max(0.68, next)));
    });

    ScrollTrigger.refresh();
  };

  apply();

  const onResize = () => {
    window.requestAnimationFrame(apply);
  };

  window.addEventListener('resize', onResize, { passive: true });
  window.addEventListener('orientationchange', onResize, { passive: true });
  desktopMq.addEventListener?.('change', onResize);

  // After fonts/images/pins settle
  window.setTimeout(apply, 120);
  window.setTimeout(apply, 600);

  return () => {
    window.removeEventListener('resize', onResize);
    window.removeEventListener('orientationchange', onResize);
    desktopMq.removeEventListener?.('change', onResize);
  };
}
