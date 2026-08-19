const HOVER_SELECTOR = 'a, button, [data-magnetic], [role="button"], input, select, textarea, label';
const HOVER_SCALE = 52 / 36;

let dotEl: HTMLElement | null = null;
let ringEl: HTMLElement | null = null;
let posX = 0;
let posY = 0;
let pendingX = 0;
let pendingY = 0;
let hovering = false;
let visible = true;
let rafId = 0;

function applyCursorTransform(): void {
  if (!dotEl || !ringEl) return;

  const opacity = visible ? '1' : '0';
  dotEl.style.opacity = opacity;
  ringEl.style.opacity = opacity;

  if (!visible) return;

  const base = `translate3d(${posX}px, ${posY}px, 0) translate(-50%, -50%)`;
  dotEl.style.transform = base;
  ringEl.style.transform = `${base} scale(${hovering ? HOVER_SCALE : 1})`;
}

function updateHover(): void {
  if (!ringEl) return;

  const target = document.elementFromPoint(pendingX, pendingY);
  const next =
    target instanceof Element &&
    !target.closest('.cursor-root') &&
    Boolean(target.closest(HOVER_SELECTOR));

  if (hovering === next) return;
  hovering = next;
  ringEl.classList.toggle('is-hover', next);
}

function tick(): void {
  rafId = 0;
  posX = pendingX;
  posY = pendingY;
  updateHover();
  applyCursorTransform();
}

function scheduleTick(): void {
  if (rafId) return;
  rafId = requestAnimationFrame(tick);
}

export function initCursor(): void {
  if (window.matchMedia('(pointer: coarse)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const cursorRoot = document.createElement('div');
  cursorRoot.className = 'cursor-root';
  cursorRoot.setAttribute('aria-hidden', 'true');

  dotEl = document.createElement('div');
  dotEl.className = 'cursor-dot';

  ringEl = document.createElement('div');
  ringEl.className = 'cursor-ring';

  cursorRoot.append(dotEl, ringEl);
  document.body.append(cursorRoot);
  document.body.classList.add('has-custom-cursor');

  pendingX = window.innerWidth / 2;
  pendingY = window.innerHeight / 2;
  posX = pendingX;
  posY = pendingY;
  applyCursorTransform();

  window.addEventListener(
    'pointermove',
    (event) => {
      pendingX = event.clientX;
      pendingY = event.clientY;
      visible = true;
      scheduleTick();
    },
    { passive: true },
  );

  window.addEventListener(
    'pointerleave',
    () => {
      visible = false;
      scheduleTick();
    },
    { passive: true },
  );

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      visible = false;
      scheduleTick();
    }
  });
}
