/** Magic UI SparklesText — vanilla port for Astro */

interface Sparkle {
  id: string;
  x: string;
  y: string;
  color: string;
  delay: number;
  scale: number;
  lifespan: number;
  el: SVGSVGElement;
}

const STAR_PATH =
  'M10.5 0L13.09 6.36399L20.3478 7.4541L15.1739 12.4541L16.9099 19.545L10.5 16L4.0901 19.545L5.82609 12.4541L0.652174 7.4541L7.91 6.36399L10.5 0Z';

function createStarSvg(sparkle: Omit<Sparkle, 'el' | 'lifespan'>): SVGSVGElement {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'sparkles-text__star');
  svg.setAttribute('width', '21');
  svg.setAttribute('height', '21');
  svg.setAttribute('viewBox', '0 0 21 21');
  svg.style.left = sparkle.x;
  svg.style.top = sparkle.y;
  svg.style.animationDelay = `${sparkle.delay}s`;
  svg.style.setProperty('--sparkle-scale', String(sparkle.scale));

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', STAR_PATH);
  path.setAttribute('fill', sparkle.color);
  svg.appendChild(path);
  return svg;
}

function mountSparkles(host: HTMLElement): () => void {
  const layer = host.querySelector<HTMLElement>('[data-sparkles-layer]');
  if (!layer) return () => undefined;

  const count = Math.max(1, Number(host.dataset.sparklesCount) || 12);
  const colorFirst = host.dataset.sparklesColorFirst || '#2b5fff';
  const colorSecond = host.dataset.sparklesColorSecond || '#92b0ff';

  const generate = (): Sparkle => {
    const x = `${Math.random() * 100}%`;
    const y = `${Math.random() * 100}%`;
    const color = Math.random() > 0.5 ? colorFirst : colorSecond;
    const delay = Math.random() * 2;
    const scale = Math.random() * 1 + 0.3;
    const lifespan = Math.random() * 10 + 5;
    const id = `${x}-${y}-${Math.random().toString(36).slice(2)}`;
    const el = createStarSvg({ id, x, y, color, delay, scale });
    return { id, x, y, color, delay, scale, lifespan, el };
  };

  let sparkles = Array.from({ length: count }, generate);
  sparkles.forEach((s) => layer.appendChild(s.el));

  const interval = window.setInterval(() => {
    sparkles = sparkles.map((star) => {
      if (star.lifespan > 0) {
        return { ...star, lifespan: star.lifespan - 0.1 };
      }
      star.el.remove();
      const next = generate();
      layer.appendChild(next.el);
      return next;
    });
  }, 100);

  return () => {
    window.clearInterval(interval);
    layer.replaceChildren();
  };
}

export function initSparklesText(): () => void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return () => undefined;
  }

  const hosts = document.querySelectorAll<HTMLElement>('[data-sparkles-text]');
  const cleanups = Array.from(hosts).map(mountSparkles);
  return () => cleanups.forEach((fn) => fn());
}
