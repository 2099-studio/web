import { withBase, getClientBaseUrl } from '../utils/paths';

const SIZE = 32;
const CYCLE_MS = 2800;

function faviconPaths() {
  const base = getClientBaseUrl();
  return {
    light: withBase('assets/brand/favicon-light.png', base),
    dark: withBase('assets/brand/favicon-dark.png', base),
  };
}

let rafId = 0;
let started = false;
let lightImage: HTMLImageElement | null = null;
let darkImage: HTMLImageElement | null = null;
let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;
let iconLinks: HTMLLinkElement[] = [];

function getIconLinks(): HTMLLinkElement[] {
  if (iconLinks.length) return iconLinks;
  iconLinks = Array.from(
    document.querySelectorAll<HTMLLinkElement>('link[rel="icon"], link[rel="shortcut icon"]'),
  );
  return iconLinks;
}

function setFaviconHref(href: string): void {
  const links = getIconLinks();
  if (!links.length) return;
  links.forEach((link) => {
    link.href = href;
  });
}

function getTheme(): 'dark' | 'light' {
  return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
}

function staticFaviconForTheme(theme: 'dark' | 'light'): string {
  const paths = faviconPaths();
  return theme === 'light' ? paths.light : paths.dark;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load favicon frame: ${src}`));
    img.src = src;
  });
}

function drawImage(image: HTMLImageElement, alpha = 1): void {
  if (!ctx) return;
  ctx.globalAlpha = alpha;
  ctx.drawImage(image, 0, 0, SIZE, SIZE);
  ctx.globalAlpha = 1;
}

function exportCanvasFavicon(): void {
  if (!canvas) return;
  setFaviconHref(canvas.toDataURL('image/png'));
}

function renderStaticToCanvas(theme: 'dark' | 'light'): void {
  if (!ctx) return;
  const image = theme === 'light' ? lightImage : darkImage;
  if (!image) return;

  ctx.clearRect(0, 0, SIZE, SIZE);
  drawImage(image);
  exportCanvasFavicon();
}

function drawFrame(timestamp: number): void {
  if (!ctx || !lightImage || !darkImage) return;

  const phase = (Math.sin((timestamp / CYCLE_MS) * Math.PI * 2) + 1) / 2;

  ctx.clearRect(0, 0, SIZE, SIZE);
  drawImage(lightImage, 1 - phase);
  drawImage(darkImage, phase);

  exportCanvasFavicon();
  rafId = requestAnimationFrame(drawFrame);
}

function stopAnimation(): void {
  if (rafId) {
    cancelAnimationFrame(rafId);
    rafId = 0;
  }
}

function showStaticFavicon(): void {
  stopAnimation();

  if (canvas && ctx && lightImage && darkImage) {
    renderStaticToCanvas(getTheme());
    return;
  }

  setFaviconHref(staticFaviconForTheme(getTheme()));
}

function startAnimation(): void {
  if (!lightImage || !darkImage || !ctx) return;

  stopAnimation();
  started = true;
  rafId = requestAnimationFrame(drawFrame);
}

export function syncFaviconWithTheme(): void {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced || document.hidden) {
    showStaticFavicon();
    return;
  }
  started = false;
  startAnimation();
}

export async function initFavicon(): Promise<void> {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  canvas = document.createElement('canvas');
  canvas.width = SIZE;
  canvas.height = SIZE;
  ctx = canvas.getContext('2d');

  if (!ctx) return;

  try {
    const { light, dark } = faviconPaths();
    [lightImage, darkImage] = await Promise.all([loadImage(light), loadImage(dark)]);
  } catch {
    setFaviconHref(staticFaviconForTheme(getTheme()));
    return;
  }

  if (prefersReduced) {
    showStaticFavicon();
    return;
  }

  startAnimation();

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      showStaticFavicon();
      started = false;
      return;
    }
    syncFaviconWithTheme();
  });

  window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (event) => {
    if (event.matches) {
      started = false;
      showStaticFavicon();
      return;
    }
    started = false;
    syncFaviconWithTheme();
  });
}
