const HOVER_SELECTOR = 'a, button, [data-magnetic], [role="button"], input, select, textarea, label';

export function initCursor(): void {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const dot = document.createElement('div');
  dot.className = 'cursor-dot';
  dot.setAttribute('aria-hidden', 'true');

  const ring = document.createElement('div');
  ring.className = 'cursor-ring';
  ring.setAttribute('aria-hidden', 'true');

  // Outside transformed Lenis/ScrollTrigger trees so fixed coords stay viewport-true
  document.documentElement.append(dot, ring);
  document.body.classList.add('has-custom-cursor');

  // Position via left/top only — never fight CSS scale/width on the same transform
  const place = (x: number, y: number) => {
    dot.style.left = `${x}px`;
    dot.style.top = `${y}px`;
    ring.style.left = `${x}px`;
    ring.style.top = `${y}px`;
  };

  place(window.innerWidth / 2, window.innerHeight / 2);

  window.addEventListener(
    'pointermove',
    (event) => {
      place(event.clientX, event.clientY);
    },
    { passive: true },
  );

  let hovering = false;

  const setHover = (next: boolean) => {
    if (hovering === next) return;
    hovering = next;
    ring.classList.toggle('is-hover', next);
  };

  document.addEventListener(
    'pointerover',
    (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target === dot || target === ring) return;
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
