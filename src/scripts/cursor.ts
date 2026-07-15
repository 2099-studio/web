const HOVER_SELECTOR = 'a, button, [data-magnetic], [role="button"]';

export function initCursor(): void {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const dot = document.createElement('div');
  dot.className = 'cursor-dot';
  dot.setAttribute('aria-hidden', 'true');

  const ring = document.createElement('div');
  ring.className = 'cursor-ring';
  ring.setAttribute('aria-hidden', 'true');

  document.body.append(dot, ring);
  document.body.classList.add('has-custom-cursor');

  // Direct transform writes — sync with pointer events (60/120/144Hz), zero tween lag
  const place = (x: number, y: number) => {
    const t = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
    dot.style.transform = t;
    ring.style.transform = t;
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
