const DEFAULT_COLORS = [
  'rgba(43, 95, 255, 1)',
  'rgba(43, 95, 255, 0.9)',
  'rgba(43, 95, 255, 0.8)',
  'rgba(43, 95, 255, 0.7)',
  'rgba(43, 95, 255, 0.6)',
  'rgba(43, 95, 255, 0.5)',
  'rgba(43, 95, 255, 0.4)',
  'rgba(43, 95, 255, 0.3)',
  'rgba(43, 95, 255, 0.2)',
  'rgba(43, 95, 255, 0.1)',
];

function parseColors(raw: string | undefined): string[] {
  if (!raw) return DEFAULT_COLORS;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed) && parsed.every((c) => typeof c === 'string')) {
      return parsed;
    }
  } catch {
    /* legacy comma-separated hex fallback */
    return raw.split(',').map((c) => c.trim()).filter(Boolean);
  }
  return DEFAULT_COLORS;
}

type CanvasTextOptions = {
  colors: string[];
  animationDuration: number;
  lineWidth: number;
  lineGap: number;
  curveIntensity: number;
};

function readOptions(host: HTMLElement): CanvasTextOptions {
  return {
    colors: parseColors(host.dataset.canvasColors),
    animationDuration: Number(host.dataset.canvasDuration) || 20,
    lineWidth: Number(host.dataset.canvasLineWidth) || 1.5,
    lineGap: Number(host.dataset.canvasLineGap) || 4,
    curveIntensity: Number(host.dataset.canvasCurve) || 60,
  };
}

function readBgColor(probe: HTMLElement | null): string {
  if (probe) {
    const fromProbe = getComputedStyle(probe).backgroundColor;
    if (fromProbe && fromProbe !== 'rgba(0, 0, 0, 0)') return fromProbe;
  }

  return '#2b5fff';
}

export function initCanvasText(): () => void {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return () => {};

  const hosts = document.querySelectorAll<HTMLElement>('[data-canvas-text]');
  if (!hosts.length) return () => {};

  const cleanups: Array<() => void> = [];
  let cancelled = false;

  const setup = () => {
    if (cancelled) return;

    hosts.forEach((host) => {
      const label = host.querySelector<HTMLElement>('.canvas-text__label');
      const canvas = host.querySelector<HTMLCanvasElement>('.canvas-text__canvas');
      const probe = host.querySelector<HTMLElement>('.canvas-text__bg-probe');
      if (!label || !canvas) return;

      const options = readOptions(host);
      let bgColor = readBgColor(probe);
    let width = 0;
    let height = 0;
    let font = '';
    let rafId = 0;
    let startTime = performance.now();

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const measure = () => {
      const rect = label.getBoundingClientRect();
      const computed = getComputedStyle(label);
      width = Math.ceil(rect.width) || 1;
      height = Math.ceil(rect.height) || 1;
      font = `${computed.fontWeight} ${computed.fontSize} ${computed.fontFamily}`;
      bgColor = readBgColor(probe);
    };

    const draw = (currentTime: number) => {
      if (!width || !height || !font) return;

      const text = label.textContent ?? '';
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      const elapsed = (currentTime - startTime) / 1000;
      const phase = (elapsed / options.animationDuration) * Math.PI * 2;
      const numLines = Math.floor(height / options.lineGap) + 10;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      ctx.globalCompositeOperation = 'source-over';
      ctx.font = font;
      ctx.textBaseline = 'alphabetic';
      ctx.textAlign = 'left';
      ctx.fillStyle = '#000';
      const metrics = ctx.measureText(text);
      const ascent = metrics.actualBoundingBoxAscent || height * 0.78;
      const descent = metrics.actualBoundingBoxDescent || height * 0.22;
      const baselineY = (height + ascent - descent) / 2;
      ctx.fillText(text, 0, baselineY);

      ctx.globalCompositeOperation = 'source-in';
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, width, height);

      ctx.globalCompositeOperation = 'source-atop';
      for (let i = 0; i < numLines; i += 1) {
        const y = i * options.lineGap;
        const curve1 = Math.sin(phase) * options.curveIntensity;
        const curve2 = Math.sin(phase + 0.5) * options.curveIntensity * 0.6;
        ctx.strokeStyle = options.colors[i % options.colors.length] ?? DEFAULT_COLORS[0];
        ctx.lineWidth = options.lineWidth;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.bezierCurveTo(width * 0.33, y + curve1, width * 0.66, y + curve2, width, y);
        ctx.stroke();
      }

      rafId = window.requestAnimationFrame(draw);
    };

    const start = () => {
      measure();
      startTime = performance.now();
      window.cancelAnimationFrame(rafId);
      rafId = window.requestAnimationFrame(draw);
    };

    start();

    const ro = new ResizeObserver(() => start());
    ro.observe(label);

    const onThemeChange = () => {
      bgColor = readBgColor(probe);
    };

    const themeObserver = new MutationObserver(onThemeChange);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    window.addEventListener('resize', start, { passive: true });

    cleanups.push(() => {
      window.cancelAnimationFrame(rafId);
      ro.disconnect();
      themeObserver.disconnect();
      window.removeEventListener('resize', start);
    });
    });
  };

  void document.fonts.ready.then(setup);

  return () => {
    cancelled = true;
    cleanups.forEach((fn) => fn());
  };
}
