import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const COLS = 20;
const ROWS = 20;

export function initPixelDisintegration(container: HTMLElement): void {
  const grid = container.querySelector<HTMLElement>('[data-pixel-grid]');
  if (!grid) return;

  grid.style.setProperty('--pixel-cols', String(COLS));
  grid.style.setProperty('--pixel-rows', String(ROWS));

  const centerX = (COLS - 1) / 2;
  const centerY = (ROWS - 1) / 2;
  const maxDist = Math.hypot(centerX, centerY);
  const fragment = document.createDocumentFragment();

  for (let row = 0; row < ROWS; row += 1) {
    for (let col = 0; col < COLS; col += 1) {
      const pixel = document.createElement('span');
      pixel.className = 'pixel-grid__cell';
      const dist = Math.hypot(col - centerX, row - centerY) / maxDist;
      pixel.style.setProperty('--dist', dist.toFixed(3));
      pixel.dataset.dist = dist.toFixed(3);
      fragment.appendChild(pixel);
    }
  }

  grid.appendChild(fragment);

  const cells = grid.querySelectorAll<HTMLElement>('.pixel-grid__cell');

  gsap.set(cells, {
    opacity: 0,
    scale: 0.2,
  });

  gsap.to(cells, {
    opacity: (index, el) => {
      const dist = Number((el as HTMLElement).dataset.dist);
      return Math.max(0.08, 1 - dist * 0.92);
    },
    scale: 1,
    duration: 1.2,
    ease: 'power3.out',
    stagger: {
      amount: 0.9,
      from: 'center',
      grid: [COLS, ROWS],
    },
    delay: 0.15,
  });

  gsap.to(cells, {
    x: (index, el) => {
      const dist = Number((el as HTMLElement).dataset.dist);
      const col = index % COLS;
      return (col - centerX) * dist * 6;
    },
    y: (index, el) => {
      const dist = Number((el as HTMLElement).dataset.dist);
      const row = Math.floor(index / COLS);
      return (row - centerY) * dist * 6;
    },
    opacity: (index, el) => {
      const dist = Number((el as HTMLElement).dataset.dist);
      return dist > 0.55 ? 0 : Math.max(0.08, 1 - dist * 0.92);
    },
    duration: 1.4,
    ease: 'power2.inOut',
    delay: 1.1,
    stagger: {
      amount: 0.6,
      from: 'edges',
      grid: [COLS, ROWS],
    },
  });
}
