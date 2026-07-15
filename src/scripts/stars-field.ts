/**
 * Aceternity shooting-stars + stars-background — vanilla port.
 * @see https://ui.aceternity.com/components/shooting-stars-and-stars-background
 */

type Star = {
  x: number;
  y: number;
  radius: number;
  opacity: number;
  twinkleSpeed: number | null;
  baseOpacity: number;
};

type ShootingStar = {
  id: number;
  x: number;
  y: number;
  angle: number;
  scale: number;
  speed: number;
  distance: number;
};

type StarsFieldOptions = {
  starDensity: number;
  allStarsTwinkle: boolean;
  twinkleProbability: number;
  minTwinkleSpeed: number;
  maxTwinkleSpeed: number;
  minSpeed: number;
  maxSpeed: number;
  minDelay: number;
  maxDelay: number;
  starWidth: number;
  starHeight: number;
  starColor: string;
  trailColor: string;
};

const DEFAULT_OPTIONS: Omit<StarsFieldOptions, 'starColor' | 'trailColor'> = {
  starDensity: 0.00015,
  allStarsTwinkle: true,
  twinkleProbability: 0.7,
  minTwinkleSpeed: 0.5,
  maxTwinkleSpeed: 1,
  minSpeed: 10,
  maxSpeed: 30,
  minDelay: 4200,
  maxDelay: 8700,
  starWidth: 10,
  starHeight: 1,
};

function isLightTheme(): boolean {
  return document.documentElement.getAttribute('data-theme') === 'light';
}

function readThemeColors(host: HTMLElement): { starColor: string; trailColor: string } {
  const light = isLightTheme();
  return {
    starColor: light
      ? (host.dataset.starColorLight ?? '#09090b')
      : (host.dataset.starColorDark ?? '#2b5fff'),
    trailColor: light
      ? (host.dataset.trailColorLight ?? '#525252')
      : (host.dataset.trailColorDark ?? '#5c85ff'),
  };
}

function readOptions(host: HTMLElement): StarsFieldOptions {
  const colors = readThemeColors(host);
  const baseDensity = Number(host.dataset.starDensity) || DEFAULT_OPTIONS.starDensity;

  return {
    ...DEFAULT_OPTIONS,
    ...colors,
    starDensity: isLightTheme() ? baseDensity * 1.35 : baseDensity,
    minDelay: Number(host.dataset.minDelay) || DEFAULT_OPTIONS.minDelay,
    maxDelay: Number(host.dataset.maxDelay) || DEFAULT_OPTIONS.maxDelay,
  };
}

function starFill(opacity: number): string {
  if (isLightTheme()) {
    return `rgba(9, 9, 11, ${Math.min(opacity * 0.9, 1)})`;
  }
  return `rgba(255, 255, 255, ${opacity})`;
}

function starRadius(base: number): number {
  return isLightTheme() ? base * 1.15 : base;
}

function getSiteShell(host: HTMLElement): HTMLElement | null {
  return host.closest('.site-shell');
}

function measureField(host: HTMLElement): { width: number; height: number } {
  const shell = getSiteShell(host);
  const width = Math.max(shell?.clientWidth ?? window.innerWidth, 1);
  const height = Math.max(
    shell?.scrollHeight ?? host.offsetHeight,
    document.documentElement.scrollHeight,
    window.innerHeight,
    1,
  );
  return { width, height };
}

function syncHostSize(host: HTMLElement): { width: number; height: number } {
  const { width, height } = measureField(host);
  host.style.width = `${width}px`;
  host.style.height = `${height}px`;
  return { width, height };
}

function generateStars(width: number, height: number, options: StarsFieldOptions): Star[] {
  const area = width * height;
  const count = Math.floor(area * options.starDensity);
  return Array.from({ length: count }, () => {
    const shouldTwinkle = options.allStarsTwinkle || Math.random() < options.twinkleProbability;
    const baseOpacity = Math.random() * 0.5 + 0.5;
    const radius = Math.random() * 0.05 + 0.5;
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      radius: starRadius(radius),
      opacity: baseOpacity,
      baseOpacity,
      twinkleSpeed: shouldTwinkle
        ? options.minTwinkleSpeed + Math.random() * (options.maxTwinkleSpeed - options.minTwinkleSpeed)
        : null,
    };
  });
}

function randomStartPoint(width: number, height: number): { x: number; y: number; angle: number } {
  const side = Math.floor(Math.random() * 4);
  const offsetX = Math.random() * width;
  const offsetY = Math.random() * height;

  switch (side) {
    case 0:
      return { x: offsetX, y: 0, angle: 45 };
    case 1:
      return { x: width, y: offsetY, angle: 135 };
    case 2:
      return { x: offsetX, y: height, angle: 225 };
    default:
      return { x: 0, y: offsetY, angle: 315 };
  }
}

function applyShootingGradient(svg: SVGSVGElement, options: StarsFieldOptions): void {
  svg.querySelector('[data-shooting-trail-stop]')?.setAttribute('stop-color', options.trailColor);
  svg.querySelector('[data-shooting-star-stop]')?.setAttribute('stop-color', options.starColor);
}

function initStarsBackground(
  host: HTMLElement,
  canvas: HTMLCanvasElement,
  getOptions: () => StarsFieldOptions,
  prefersReduced: boolean,
): () => void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return () => {};

  let stars: Star[] = [];
  let width = 0;
  let height = 0;
  let rafId = 0;

  const resize = () => {
    const size = syncHostSize(host);
    width = size.width;
    height = size.height;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    stars = generateStars(width, height, getOptions());
  };

  const draw = () => {
    ctx.clearRect(0, 0, width, height);
    for (const star of stars) {
      if (!prefersReduced && star.twinkleSpeed !== null) {
        star.opacity =
          star.baseOpacity * (0.5 + Math.abs(Math.sin((Date.now() * 0.001) / star.twinkleSpeed) * 0.5));
      }
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fillStyle = starFill(star.opacity);
      ctx.fill();
    }
    if (!prefersReduced) {
      rafId = window.requestAnimationFrame(draw);
    }
  };

  const refresh = () => {
    resize();
    draw();
  };

  refresh();

  window.addEventListener('resize', refresh, { passive: true });
  window.addEventListener('load', refresh, { passive: true });

  const shell = getSiteShell(host);
  const ro = shell ? new ResizeObserver(refresh) : null;
  ro?.observe(shell!);
  if (document.body) ro?.observe(document.body);

  return () => {
    window.cancelAnimationFrame(rafId);
    window.removeEventListener('resize', refresh);
    window.removeEventListener('load', refresh);
    ro?.disconnect();
  };
}

function initShootingStars(
  host: HTMLElement,
  svg: SVGSVGElement,
  getOptions: () => StarsFieldOptions,
): () => void {
  let width = 0;
  let height = 0;
  let star: ShootingStar | null = null;
  let rafId = 0;
  let spawnTimeout = 0;

  const resize = () => {
    const size = syncHostSize(host);
    width = size.width;
    height = size.height;
    applyShootingGradient(svg, getOptions());
  };

  const clearRect = () => {
    svg.querySelectorAll('[data-shooting-rect]').forEach((node) => node.remove());
  };

  const renderStar = () => {
    clearRect();
    if (!star) return;

    const options = getOptions();
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    const w = options.starWidth * star.scale;
    const h = options.starHeight;
    rect.setAttribute('data-shooting-rect', 'true');
    rect.setAttribute('x', String(star.x));
    rect.setAttribute('y', String(star.y));
    rect.setAttribute('width', String(w));
    rect.setAttribute('height', String(h));
    rect.setAttribute('fill', 'url(#site-shooting-gradient)');
    rect.setAttribute(
      'transform',
      `rotate(${star.angle}, ${star.x + w / 2}, ${star.y + h / 2})`,
    );
    svg.appendChild(rect);
  };

  const spawn = () => {
    const { x, y, angle } = randomStartPoint(width, height);
    const options = getOptions();
    star = {
      id: Date.now(),
      x,
      y,
      angle,
      scale: 1,
      speed: Math.random() * (options.maxSpeed - options.minSpeed) + options.minSpeed,
      distance: 0,
    };
  };

  const scheduleSpawn = () => {
    window.clearTimeout(spawnTimeout);
    const options = getOptions();
    const delay = Math.random() * (options.maxDelay - options.minDelay) + options.minDelay;
    spawnTimeout = window.setTimeout(() => {
      spawn();
      scheduleSpawn();
    }, delay);
  };

  const tick = () => {
    if (star) {
      const rad = (star.angle * Math.PI) / 180;
      star.x += star.speed * Math.cos(rad);
      star.y += star.speed * Math.sin(rad);
      star.distance += star.speed;
      star.scale = 1 + star.distance / 100;

      if (star.x < -20 || star.x > width + 20 || star.y < -20 || star.y > height + 20) {
        star = null;
      }
    }
    renderStar();
    rafId = window.requestAnimationFrame(tick);
  };

  resize();
  spawn();
  scheduleSpawn();
  rafId = window.requestAnimationFrame(tick);

  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('load', resize, { passive: true });

  const shell = getSiteShell(host);
  const ro = shell ? new ResizeObserver(resize) : null;
  ro?.observe(shell!);
  if (document.body) ro?.observe(document.body);

  return () => {
    window.cancelAnimationFrame(rafId);
    window.clearTimeout(spawnTimeout);
    window.removeEventListener('resize', resize);
    window.removeEventListener('load', resize);
    ro?.disconnect();
    clearRect();
  };
}

export function initStarsField(): () => void {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hosts = document.querySelectorAll<HTMLElement>('[data-stars-field]');
  if (!hosts.length) return () => {};

  const cleanups: Array<() => void> = [];

  hosts.forEach((host) => {
    const canvas = host.querySelector<HTMLCanvasElement>('[data-stars-bg]');
    const svg = host.querySelector<SVGSVGElement>('[data-shooting-stars]');
    if (!canvas || !svg) return;

    const getOptions = () => readOptions(host);
    let bgCleanup = initStarsBackground(host, canvas, getOptions, prefersReduced);

    const onThemeChange = () => {
      bgCleanup();
      bgCleanup = initStarsBackground(host, canvas, getOptions, prefersReduced);
      applyShootingGradient(svg, getOptions());
    };

    const themeObserver = new MutationObserver(onThemeChange);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    cleanups.push(bgCleanup);
    cleanups.push(() => themeObserver.disconnect());

    if (!prefersReduced) {
      cleanups.push(initShootingStars(host, svg, getOptions));
    }
  });

  return () => cleanups.forEach((fn) => fn());
}
