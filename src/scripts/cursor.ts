const HOVER_SELECTOR = 'a, button, [data-magnetic], [role="button"], input, select, textarea, label';

let scrollCompensateY = 0;
let cursorRoot: HTMLElement | null = null;
let dotEl: HTMLElement | null = null;
let ringEl: HTMLElement | null = null;
let posX = 0;
let posY = 0;

function applyCursorTransform(): void {
  if (!dotEl || !ringEl || !cursorRoot) return;

  const point = `translate3d(${posX}px, ${posY}px, 0) translate(-50%, -50%)`;
  dotEl.style.transform = point;
  ringEl.style.transform = point;

  cursorRoot.style.transform =
    scrollCompensateY !== 0 ? `translate3d(0, ${scrollCompensateY}px, 0)` : '';
}

/** Counter Lenis transform on `<html>` so fixed cursor stays aligned with the pointer. */
export function syncCursorScroll(y: number): void {
  if (scrollCompensateY === y) return;
  scrollCompensateY = y;
  applyCursorTransform();
}

export function initCursor(): void {
  if (window.matchMedia('(pointer: coarse)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  cursorRoot = document.createElement('div');
  cursorRoot.className = 'cursor-root';
  cursorRoot.setAttribute('aria-hidden', 'true');

  dotEl = document.createElement('div');
  dotEl.className = 'cursor-dot';

  ringEl = document.createElement('div');
  ringEl.className = 'cursor-ring';

  cursorRoot.append(dotEl, ringEl);
  document.body.append(cursorRoot);
  document.body.classList.add('has-custom-cursor');

  posX = window.innerWidth / 2;
  posY = window.innerHeight / 2;
  applyCursorTransform();

  window.addEventListener(
    'pointermove',
    (event) => {
      posX = event.clientX;
      posY = event.clientY;
      applyCursorTransform();
    },
    { passive: true },
  );

  let hovering = false;

  const setHover = (next: boolean) => {
    if (!ringEl || hovering === next) return;
    hovering = next;
    ringEl.classList.toggle('is-hover', next);
  };

  document.addEventListener(
    'pointerover',
    (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target === dotEl || target === ringEl || target === cursorRoot) return;
      setHover(Boolean(target.closest(HOVER_SELECTOR)));
    },
    { passive: true },
  );

  document.addEventListener(
    'pointerout',
    (event) => {
      const related = event.relatedTarget;
      if (related instanceof Element && related.closest(HOVER_SELECTOR)) return;
      setHover(false);
    },
    { passive: true },
  );
}
