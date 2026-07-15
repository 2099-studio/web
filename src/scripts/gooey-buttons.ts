/**
 * Leonardo.ai GooeyCanvas hover — single ellipse rises & expands to fill the pill.
 * Brand fill: #2B5FFF. Timing mirrors Leonardo (~1.2s in / ~1.08s out, power2.out).
 */

type GooeyColors = {
  fill: [number, number, number];
  bg: [number, number, number];
  /** > 0.5 = clear canvas before drawing (outline buttons) */
  alphaFromGoo: number;
};

const BRAND_BLUE: [number, number, number] = [0x2b / 255, 0x5f / 255, 0xff / 255];
const FALLBACK_PRIMARY_BG: [number, number, number] = [0.949, 0.949, 0.941];

const SELECTOR = [
  '.hero__actions .btn-figma-primary',
  '.hero__actions .btn-figma-secondary',
  '.header__cta',
  '.header__pill',
  '.header__mobile .btn-figma-primary',
].join(', ');

export function initGooeyButtons(): () => void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {};
  if (!window.matchMedia('(hover: hover)').matches) return () => {};

  const cleanups: Array<() => void> = [];

  document.querySelectorAll<HTMLElement>(SELECTOR).forEach((btn) => {
    const dispose = enhance(btn);
    if (dispose) cleanups.push(dispose);
  });

  return () => cleanups.forEach((fn) => fn());
}

function enhance(btn: HTMLElement): (() => void) | void {
  if (btn.dataset.gooeyReady === '1') return;
  btn.dataset.gooeyReady = '1';
  btn.classList.add('btn-gooey');

  const isOutline =
    btn.classList.contains('btn-figma-secondary') || btn.classList.contains('header__pill');

  if (isOutline) btn.classList.add('btn-gooey--light');
  else btn.classList.add('btn-gooey--ink');

  const colors: GooeyColors = isOutline
    ? { fill: BRAND_BLUE, bg: [0, 0, 0], alphaFromGoo: 1 }
    : { fill: BRAND_BLUE, bg: readBg(btn), alphaFromGoo: 0 };

  const label = document.createElement('span');
  label.className = 'btn-gooey__label';
  while (btn.firstChild) label.appendChild(btn.firstChild);
  btn.appendChild(label);

  const canvas = document.createElement('canvas');
  canvas.className = 'btn-gooey__canvas';
  canvas.setAttribute('aria-hidden', 'true');
  btn.insertBefore(canvas, label);

  let progress = 0;
  let from = 0;
  let target = 0;
  let startedAt = 0;
  let duration = 1200;
  let raf = 0;
  let timer = 0;

  const paint = () => {
    const parent = canvas.parentElement;
    if (!parent) return;

    const tw = parent.offsetWidth;
    const th = parent.offsetHeight;
    if (tw < 1 || th < 1) return;

    // Keep primary resting bg in sync with theme toggles
    if (!isOutline) colors.bg = readBg(btn);

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const cssW = tw + 2;
    const cssH = th + 2;
    const bufW = Math.max(1, Math.floor(cssW * dpr));
    const bufH = Math.max(1, Math.floor(cssH * dpr));

    if (canvas.width !== bufW || canvas.height !== bufH) {
      canvas.width = bufW;
      canvas.height = bufH;
      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;
      canvas.style.left = '-1px';
      canvas.style.top = '-1px';
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    drawGooey(ctx, bufW, bufH, progress, colors);
  };

  const sampleProgress = (now: number) => {
    const t = Math.min(1, Math.max(0, (now - startedAt) / duration));
    const eased = 1 - (1 - t) * (1 - t);
    progress = from + (target - from) * eased;
    return t >= 1;
  };

  const stopLoop = () => {
    if (raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
    if (timer) {
      clearInterval(timer);
      timer = 0;
    }
  };

  const frame = (now: number) => {
    const done = sampleProgress(now);
    paint();
    if (done) {
      progress = target;
      paint();
      stopLoop();
      return;
    }
    raf = requestAnimationFrame(frame);
  };

  const startAnim = (next: number, ms: number) => {
    from = progress;
    target = next;
    duration = ms;
    startedAt = performance.now();
    stopLoop();
    raf = requestAnimationFrame(frame);
    timer = window.setInterval(() => {
      const done = sampleProgress(performance.now());
      paint();
      if (done) {
        progress = target;
        paint();
        stopLoop();
      }
    }, 32);
  };

  const onEnter = () => {
    btn.classList.add('is-gooey');
    startAnim(1, 1200);
  };

  const onLeave = () => {
    btn.classList.remove('is-gooey');
    startAnim(0, 1080);
  };

  const ro = new ResizeObserver(() => paint());
  ro.observe(btn);

  btn.addEventListener('pointerenter', onEnter);
  btn.addEventListener('pointerleave', onLeave);
  paint();

  return () => {
    stopLoop();
    ro.disconnect();
    btn.removeEventListener('pointerenter', onEnter);
    btn.removeEventListener('pointerleave', onLeave);
    btn.classList.remove('btn-gooey', 'btn-gooey--ink', 'btn-gooey--light', 'is-gooey');
    delete btn.dataset.gooeyReady;
    canvas.remove();
    while (label.firstChild) btn.appendChild(label.firstChild);
    label.remove();
  };
}

function readBg(el: HTMLElement): [number, number, number] {
  const token =
    getComputedStyle(el).getPropertyValue('--color-btn-primary-bg').trim() ||
    getComputedStyle(document.documentElement).getPropertyValue('--color-btn-primary-bg').trim();
  return parseCssColor(token) ?? FALLBACK_PRIMARY_BG;
}

function parseCssColor(input: string): [number, number, number] | null {
  if (!input) return null;
  if (input.startsWith('#')) {
    const hex = input.slice(1);
    const full =
      hex.length === 3
        ? hex
            .split('')
            .map((c) => c + c)
            .join('')
        : hex;
    if (full.length !== 6) return null;
    return [
      parseInt(full.slice(0, 2), 16) / 255,
      parseInt(full.slice(2, 4), 16) / 255,
      parseInt(full.slice(4, 6), 16) / 255,
    ];
  }
  const m = input.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/i);
  if (!m) return null;
  return [Number(m[1]) / 255, Number(m[2]) / 255, Number(m[3]) / 255];
}

/** Leonardo GooeyCanvas ellipse: rises from bottom and expands to fill. */
function drawGooey(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  progress: number,
  colors: GooeyColors,
): void {
  const a = progress;
  const swell = 4 * a * (1 - a);
  const center = { x: 0.5, y: -0.35 + 0.85 * a };
  const ryNorm = 0.12 + 1.5 * a;
  const aspect = 0.5 + 0.5 * (1 - (1 - a) * (1 - a)) + 0.4 * swell;
  const cx = center.x * width;
  const cy = (1 - center.y) * height;
  const rx = (ryNorm / (3.2 - a * a * 2.42 - 0.25 * swell)) * width;
  const ry = ryNorm * aspect * height;

  if (colors.alphaFromGoo > 0.5) {
    ctx.clearRect(0, 0, width, height);
  } else {
    const [br, bg, bb] = colors.bg;
    ctx.fillStyle = `rgb(${Math.round(255 * br)},${Math.round(255 * bg)},${Math.round(255 * bb)})`;
    ctx.fillRect(0, 0, width, height);
  }

  if (colors.alphaFromGoo > 0.5 && a < 0.01) return;

  const [fr, fg, fb] = colors.fill;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.beginPath();
  ctx.ellipse(0, 0, Math.max(0.1, rx), Math.max(0.1, ry), 0, 0, Math.PI * 2);
  ctx.fillStyle = `rgb(${Math.round(255 * fr)},${Math.round(255 * fg)},${Math.round(255 * fb)})`;
  ctx.fill();
  ctx.restore();
}
