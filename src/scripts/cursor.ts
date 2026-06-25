import gsap from 'gsap';

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

  const position = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  const target = { ...position };

  const render = () => {
    position.x += (target.x - position.x) * 0.18;
    position.y += (target.y - position.y) * 0.18;
    dot.style.transform = `translate3d(${target.x}px, ${target.y}px, 0)`;
    ring.style.transform = `translate3d(${position.x}px, ${position.y}px, 0)`;
  };

  gsap.ticker.add(render);

  window.addEventListener('mousemove', (event) => {
    target.x = event.clientX;
    target.y = event.clientY;
  });

  document.querySelectorAll<HTMLElement>('a, button, [data-magnetic]').forEach((el) => {
    el.addEventListener('mouseenter', () => ring.classList.add('is-hover'));
    el.addEventListener('mouseleave', () => ring.classList.remove('is-hover'));
  });
}
