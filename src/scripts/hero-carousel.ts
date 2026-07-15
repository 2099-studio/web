export function initHeroCarousel(): () => void {
  const root = document.querySelector<HTMLElement>('[data-hero-carousel]');
  if (!root) return () => {};

  const slides = Array.from(root.querySelectorAll<HTMLElement>('[data-carousel-slide]'));
  const dots = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-carousel-dot]'));
  const prev = root.querySelector<HTMLButtonElement>('[data-carousel-prev]');
  const next = root.querySelector<HTMLButtonElement>('[data-carousel-next]');
  if (!slides.length) return () => {};

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let index = 0;
  let timer = 0;

  const classNames = ['is-active', 'is-prev', 'is-next', 'is-far-prev', 'is-far-next'] as const;

  const setIndex = (nextIndex: number) => {
    const total = slides.length;
    index = ((nextIndex % total) + total) % total;

    slides.forEach((slide, i) => {
      classNames.forEach((name) => slide.classList.remove(name));
      const delta = (i - index + total) % total;
      let role = '';
      if (delta === 0) role = 'is-active';
      else if (delta === total - 1) role = 'is-prev';
      else if (delta === 1) role = 'is-next';
      else if (delta === total - 2) role = 'is-far-prev';
      else if (delta === 2) role = 'is-far-next';
      if (role) slide.classList.add(role);
      slide.setAttribute('aria-hidden', String(delta !== 0));
    });

    dots.forEach((dot, i) => {
      dot.classList.toggle('is-active', i === index);
    });
  };

  const stop = () => {
    window.clearInterval(timer);
    timer = 0;
  };

  const start = () => {
    if (prefersReduced) return;
    stop();
    timer = window.setInterval(() => setIndex(index + 1), 3200);
  };

  prev?.addEventListener('click', () => {
    setIndex(index - 1);
    start();
  });
  next?.addEventListener('click', () => {
    setIndex(index + 1);
    start();
  });
  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      setIndex(Number(dot.dataset.carouselDot) || 0);
      start();
    });
  });

  root.addEventListener('mouseenter', stop);
  root.addEventListener('mouseleave', start);
  root.addEventListener('focusin', stop);
  root.addEventListener('focusout', start);

  setIndex(0);
  start();

  return () => {
    stop();
  };
}
