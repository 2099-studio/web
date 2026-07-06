const BAYER_8 = [
  [0, 32, 8, 40, 2, 34, 10, 42],
  [48, 16, 56, 24, 50, 18, 58, 26],
  [12, 44, 4, 36, 14, 46, 6, 38],
  [60, 28, 52, 20, 62, 30, 54, 22],
  [3, 35, 11, 43, 1, 33, 9, 41],
  [51, 19, 59, 27, 49, 17, 57, 25],
  [15, 47, 7, 39, 13, 45, 5, 37],
  [63, 31, 55, 23, 61, 29, 53, 21],
];

const HERO_ANCHORS = [
  { y: 0.14, x: 0.5, r: 0.3, w: 0.42 },
  { y: 0.32, x: 0.3, r: 0.24, w: 0.34 },
  { y: 0.32, x: 0.7, r: 0.24, w: 0.34 },
  { y: 0.52, x: 0.5, r: 0.28, w: 0.38 },
  { y: 0.72, x: 0.38, r: 0.22, w: 0.32 },
  { y: 0.72, x: 0.62, r: 0.22, w: 0.32 },
  { y: 0.88, x: 0.5, r: 0.26, w: 0.36 },
];

type FieldPalette = {
  bg: string;
  orange: string;
  orangeDim: string;
};

type FieldParticle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  weight: number;
  phase: number;
};

type GridCell = {
  ox: number;
  oy: number;
  vx: number;
  vy: number;
};

type PointerState = {
  x: number;
  y: number;
  active: boolean;
};

type PointerTrailPoint = {
  x: number;
  y: number;
  age: number;
};

const POINTER_TRAIL_LENGTH = 10;
const POINTER_TRAIL_DECAY = 0.88;

function readPalette(): FieldPalette {
  const style = getComputedStyle(document.documentElement);
  return {
    bg: style.getPropertyValue('--color-bg').trim() || '#000000',
    orange: style.getPropertyValue('--color-accent-orange').trim() || '#ff5c1a',
    orangeDim: style.getPropertyValue('--color-accent-orange-dark').trim() || '#cc3a00',
  };
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  if (edge0 === edge1) return x >= edge1 ? 1 : 0;
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function blobDensity(x: number, y: number, bx: number, by: number, radius: number, weight: number): number {
  const dist = Math.hypot(x - bx, y - by);
  return weight * (1 - smoothstep(radius * 0.3, radius, dist));
}

function curlFlow(x: number, y: number, time: number): { ax: number; ay: number } {
  const angle =
    Math.sin(x * 0.0075 + time * 0.00038) + Math.cos(y * 0.0068 - time * 0.00032);
  const strength = 0.0028;
  return {
    ax: Math.cos(angle) * strength,
    ay: Math.sin(angle) * strength,
  };
}

function flowNoise(x: number, y: number, time: number): number {
  const waveA = Math.sin(x * 0.0085 + time * 0.00038 + Math.sin(y * 0.0065 + time * 0.00022) * 2);
  const waveB = Math.cos(y * 0.0078 - time * 0.00034 + Math.cos(x * 0.0072) * 1.7);
  return (waveA + waveB) * 0.5 * 0.14 + 0.07;
}

function copyZoneMask(localX: number, localY: number, host: HTMLElement): number {
  const copy = host.querySelector<HTMLElement>('[data-hero-copy]');
  if (!copy) return 1;

  const hostRect = host.getBoundingClientRect();
  const copyRect = copy.getBoundingClientRect();
  const cx = copyRect.left - hostRect.left + copyRect.width * 0.5;
  const cy = copyRect.top - hostRect.top + copyRect.height * 0.5;
  const nx = (localX - cx) / (copyRect.width * 0.62);
  const ny = (localY - cy) / (copyRect.height * 0.68);
  const ell = Math.hypot(nx, ny);

  return 0.42 + smoothstep(0.35, 1.5, ell) * 0.58;
}

function edgeMask(x: number, y: number, w: number, h: number): number {
  const top = smoothstep(0, h * 0.04, y);
  const bottom = 1 - smoothstep(h * 0.96, h, y);
  const left = smoothstep(0, w * 0.03, x);
  const right = 1 - smoothstep(w * 0.97, w, x);
  return top * bottom * left * right;
}

function warpFieldPoint(
  x: number,
  y: number,
  pointer: PointerState,
  pointerVel: { x: number; y: number },
  span: number,
): { x: number; y: number } {
  if (!pointer.active) return { x, y };

  const dx = x - pointer.x;
  const dy = y - pointer.y;
  const dist = Math.hypot(dx, dy) || 1;
  const radius = span * 0.42;
  const t = Math.max(0, 1 - dist / radius);
  const push = t * t * t * span * 0.072;
  const vel = Math.hypot(pointerVel.x, pointerVel.y);
  const wake = t * t * vel * 0.038;

  return {
    x: x + (dx / dist) * (push + wake),
    y: y + (dy / dist) * (push + wake),
  };
}

function appliedMouseDisplacement(
  cx: number,
  cy: number,
  pointer: PointerState,
  pointerVel: { x: number; y: number },
  trail: PointerTrailPoint[],
  span: number,
): { x: number; y: number } {
  if (!pointer.active) return { x: 0, y: 0 };

  let ox = 0;
  let oy = 0;
  const influence = span * 0.46;
  const voidRadius = span * 0.055;

  const applyPush = (px: number, py: number, strength: number, radius: number) => {
    const dx = cx - px;
    const dy = cy - py;
    const dist = Math.hypot(dx, dy) || 1;
    if (dist > radius) return;

    const t = 1 - dist / radius;
    const falloff = t * t * t;
    const voidBoost = dist < voidRadius ? 1 + (1 - dist / voidRadius) * 0.85 : 1;
    const push = falloff * strength * voidBoost;

    ox += (dx / dist) * push;
    oy += (dy / dist) * push;
  };

  applyPush(pointer.x, pointer.y, span * 0.14, influence);

  const vel = Math.hypot(pointerVel.x, pointerVel.y);
  if (vel > 0.2) {
    const wakeRadius = influence * 1.12;
    const wakeStrength = span * 0.05 + vel * 0.12;
    applyPush(pointer.x, pointer.y, wakeStrength, wakeRadius);
  }

  for (const point of trail) {
    if (point.age < 0.04) continue;
    const trailRadius = influence * (0.55 + point.age * 0.35);
    const trailStrength = span * 0.045 * point.age;
    applyPush(point.x, point.y, trailStrength, trailRadius);
  }

  return { x: ox, y: oy };
}

function createFieldParticles(width: number, height: number): FieldParticle[] {
  const span = Math.min(width, height);
  const count = Math.max(22, Math.min(44, Math.floor((width * height) / 20000)));

  return Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.22,
    vy: (Math.random() - 0.5) * 0.22,
    radius: span * (0.042 + Math.random() * 0.078),
    weight: 0.26 + Math.random() * 0.34,
    phase: Math.random() * Math.PI * 2,
  }));
}

function createGridCells(count: number): GridCell[] {
  return Array.from({ length: count }, () => ({ ox: 0, oy: 0, vx: 0, vy: 0 }));
}

function updateFieldParticles(
  particles: FieldParticle[],
  width: number,
  height: number,
  span: number,
  pointer: PointerState,
  pointerVel: { x: number; y: number },
  time: number,
): void {
  const attractRadius = span * 0.42;
  const repelRadius = span * 0.16;

  for (const p of particles) {
    const flow = curlFlow(p.x, p.y, time);
    p.vx += flow.ax + Math.sin(time * 0.00085 + p.phase) * 0.0018;
    p.vy += flow.ay + Math.cos(time * 0.00095 + p.phase * 1.3) * 0.0018;

    if (pointer.active) {
      const dx = p.x - pointer.x;
      const dy = p.y - pointer.y;
      const dist = Math.hypot(dx, dy) || 1;

      const attract = Math.max(0, 1 - dist / attractRadius);
      p.vx -= (dx / dist) * attract * 0.06;
      p.vy -= (dy / dist) * attract * 0.06;

      const repel = Math.max(0, 1 - dist / repelRadius);
      const push = repel * repel * 0.14;
      p.vx += (dx / dist) * push;
      p.vy += (dy / dist) * push;

      const vel = Math.hypot(pointerVel.x, pointerVel.y);
      if (vel > 0.15) {
        const wake = Math.max(0, 1 - dist / (span * 0.32));
        p.vx += (dx / dist) * wake * vel * 0.045;
        p.vy += (dy / dist) * wake * vel * 0.045;
      }
    }

    p.vx *= 0.992;
    p.vy *= 0.992;

    const speed = Math.hypot(p.vx, p.vy);
    if (speed > 1.15) {
      p.vx = (p.vx / speed) * 1.15;
      p.vy = (p.vy / speed) * 1.15;
    }

    p.x += p.vx;
    p.y += p.vy;

    const pad = p.radius * 0.4;
    if (p.x < -pad) p.x = width + pad;
    if (p.x > width + pad) p.x = -pad;
    if (p.y < -pad) p.y = height + pad;
    if (p.y > height + pad) p.y = -pad;
  }
}

function fieldParticleDensity(x: number, y: number, particles: FieldParticle[]): number {
  let density = 0;
  for (const p of particles) {
    density += blobDensity(x, y, p.x, p.y, p.radius, p.weight);
  }
  return Math.min(density * 0.4, 1);
}

function sampleFieldDensity(
  x: number,
  y: number,
  w: number,
  h: number,
  particles: FieldParticle[],
  pointer: PointerState,
  pointerVel: { x: number; y: number },
  time: number,
  host: HTMLElement,
): number {
  const span = Math.min(w, h);
  const drift = Math.sin(time * 0.0002) * 20;
  const edge = edgeMask(x, y, w, h);
  const warped = warpFieldPoint(x, y, pointer, pointerVel, span);
  const copyMask = copyZoneMask(x, y, host);

  let ambient = flowNoise(warped.x, warped.y, time);

  for (const anchor of HERO_ANCHORS) {
    const bx = w * anchor.x + Math.sin(time * 0.0002 + anchor.y * 9) * drift * 0.1;
    const by = h * anchor.y + Math.cos(time * 0.00017 + anchor.y * 7) * drift;
    ambient += blobDensity(warped.x, warped.y, bx, by, span * anchor.r, anchor.w);
  }

  ambient += fieldParticleDensity(warped.x, warped.y, particles);
  ambient = Math.min(ambient * 0.52, 1) * edge * copyMask;

  let pointerDensity = 0;

  if (pointer.active) {
    const ringDist = Math.hypot(x - pointer.x, y - pointer.y);
    const voidR = span * 0.07;
    const ringR = span * 0.22;
    const ring =
      smoothstep(voidR, ringR, ringDist) * (1 - smoothstep(ringR, ringR * 1.45, ringDist));
    pointerDensity += ring * 0.36;
    pointerDensity += blobDensity(x, y, pointer.x, pointer.y, span * 0.16, 0.38);
    pointerDensity *= 1 - smoothstep(0, voidR * 1.1, ringDist) * 0.72;
    pointerDensity = Math.min(pointerDensity, 1) * edge;
  }

  return Math.min(ambient + pointerDensity, 1);
}

function updateGridCell(
  cell: GridCell,
  cx: number,
  cy: number,
  span: number,
  pointer: PointerState,
  pointerVel: { x: number; y: number },
  trail: PointerTrailPoint[],
): void {
  const spring = 0.085;
  const damping = 0.82;
  const maxOffset = span * 0.058;

  let fx = -cell.ox * spring;
  let fy = -cell.oy * spring;

  if (pointer.active) {
    const target = appliedMouseDisplacement(cx, cy, pointer, pointerVel, trail, span);
    const follow = 0.14;
    fx += (target.x - cell.ox) * follow;
    fy += (target.y - cell.oy) * follow;

    const px = cx + cell.ox;
    const py = cy + cell.oy;
    const dx = px - pointer.x;
    const dy = py - pointer.y;
    const dist = Math.hypot(dx, dy) || 1;
    const influence = span * 0.4;

    if (dist < influence) {
      const t = 1 - dist / influence;
      const force = t * t * t * 2.4;
      fx += (dx / dist) * force;
      fy += (dy / dist) * force;
    }

    const vel = Math.hypot(pointerVel.x, pointerVel.y);
    if (vel > 0.08 && dist < influence * 1.2) {
      const wake = (1 - dist / (influence * 1.2)) * vel * 0.14;
      fx += (dx / dist) * wake;
      fy += (dy / dist) * wake;
    }
  }

  cell.vx = (cell.vx + fx) * damping;
  cell.vy = (cell.vy + fy) * damping;
  cell.ox += cell.vx;
  cell.oy += cell.vy;

  const offset = Math.hypot(cell.ox, cell.oy);
  if (offset > maxOffset) {
    cell.ox = (cell.ox / offset) * maxOffset;
    cell.oy = (cell.oy / offset) * maxOffset;
  }
}

function decayGridCell(cell: GridCell): void {
  cell.ox *= 0.9;
  cell.oy *= 0.9;
  cell.vx *= 0.86;
  cell.vy *= 0.86;
}

export function initHeroPixelField(canvas: HTMLCanvasElement): () => void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return () => {};

  const host = canvas.closest<HTMLElement>('[data-hero-field]');
  if (!host) return () => {};

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pointer: PointerState = { x: -9999, y: -9999, active: false };
  const smoothPointer = { x: -9999, y: -9999 };
  const pointerVel = { x: 0, y: 0 };
  const lastPointer = { x: -9999, y: -9999 };
  const pointerTrail: PointerTrailPoint[] = Array.from({ length: POINTER_TRAIL_LENGTH }, () => ({
    x: -9999,
    y: -9999,
    age: 0,
  }));

  let fieldParticles: FieldParticle[] = [];
  let gridCells: GridCell[] = [];
  let cellSize = 20;
  let pixelSize = 4;
  let cols = 0;
  let rows = 0;
  let rafId = 0;
  let width = 0;
  let height = 0;
  let dpr = 1;
  let startTime = performance.now();
  let palette = readPalette();
  let lastDrawTime = startTime;

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = Math.max(host.clientWidth, 1);
    height = Math.max(host.clientHeight, 1);
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    if (width < 640) {
      cellSize = 18;
      pixelSize = 4;
    } else if (width < 1024) {
      cellSize = 20;
      pixelSize = 4;
    } else {
      cellSize = 22;
      pixelSize = 5;
    }
    cols = Math.ceil(width / cellSize);
    rows = Math.ceil(height / cellSize);
    fieldParticles = createFieldParticles(width, height);
    gridCells = createGridCells(cols * rows);
  };

  const draw = (time: number) => {
    lastDrawTime = time;
    const elapsed = time - startTime;
    const span = Math.min(width, height);

    if (pointer.active) {
      smoothPointer.x = lerp(smoothPointer.x, pointer.x, 0.065);
      smoothPointer.y = lerp(smoothPointer.y, pointer.y, 0.065);

      for (let i = pointerTrail.length - 1; i > 0; i -= 1) {
        pointerTrail[i].x = pointerTrail[i - 1].x;
        pointerTrail[i].y = pointerTrail[i - 1].y;
        pointerTrail[i].age = pointerTrail[i - 1].age * POINTER_TRAIL_DECAY;
      }
      pointerTrail[0].x = smoothPointer.x;
      pointerTrail[0].y = smoothPointer.y;
      pointerTrail[0].age = 1;
    } else {
      for (const point of pointerTrail) {
        point.age *= POINTER_TRAIL_DECAY;
      }
    }

    const activePointer: PointerState = pointer.active
      ? { x: smoothPointer.x, y: smoothPointer.y, active: true }
      : pointer;

    if (!prefersReduced && fieldParticles.length) {
      updateFieldParticles(fieldParticles, width, height, span, activePointer, pointerVel, elapsed);
    }

    ctx.clearRect(0, 0, width, height);

    const pixelInset = (cellSize - pixelSize) * 0.5;
    const pointerInfluence = span * 0.48;
    let cellIndex = 0;

    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        const cx = col * cellSize + cellSize * 0.5;
        const cy = row * cellSize + cellSize * 0.5;
        const density = sampleFieldDensity(
          cx,
          cy,
          width,
          height,
          fieldParticles,
          activePointer,
          pointerVel,
          elapsed,
          host,
        );

        const threshold = ((BAYER_8[row % 8][col % 8] + 0.5) / 64) * 1.08;
        const isLit = density > 0.008 && density >= Math.min(threshold, 0.98);
        const cell = gridCells[cellIndex];
        cellIndex += 1;

        if (!prefersReduced && isLit) {
          const nearPointer =
            !activePointer.active ||
            Math.hypot(cx - activePointer.x, cy - activePointer.y) < pointerInfluence;
          if (nearPointer || Math.hypot(cell.ox, cell.oy) > 0.08) {
            updateGridCell(cell, cx, cy, span, activePointer, pointerVel, pointerTrail);
          }
        } else if (!prefersReduced) {
          decayGridCell(cell);
        }

        if (!isLit) continue;

        ctx.fillStyle = density > 0.78 ? palette.orange : palette.orangeDim;
        ctx.fillRect(
          col * cellSize + pixelInset + cell.ox,
          row * cellSize + pixelInset + cell.oy,
          pixelSize,
          pixelSize,
        );
      }
    }
  };

  const tick = (time: number) => {
    draw(time);
    rafId = window.requestAnimationFrame(tick);
  };

  const setPointerFromEvent = (event: PointerEvent) => {
    const rect = host.getBoundingClientRect();
    const inside =
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom;

    if (!inside) {
      pointer.active = false;
      pointerVel.x = 0;
      pointerVel.y = 0;
      return;
    }

    const nextX = event.clientX - rect.left;
    const nextY = event.clientY - rect.top;

    if (pointer.active && lastPointer.x > -1000) {
      pointerVel.x = lerp(pointerVel.x, nextX - lastPointer.x, 0.22);
      pointerVel.y = lerp(pointerVel.y, nextY - lastPointer.y, 0.22);
    }

    lastPointer.x = nextX;
    lastPointer.y = nextY;
    pointer.x = nextX;
    pointer.y = nextY;
    pointer.active = true;

    if (smoothPointer.x < -1000) {
      smoothPointer.x = pointer.x;
      smoothPointer.y = pointer.y;
    }
  };

  const onPointerMove = (event: PointerEvent) => setPointerFromEvent(event);

  const onPointerLeave = () => {
    pointer.active = false;
    pointer.x = -9999;
    pointer.y = -9999;
    pointerVel.x = 0;
    pointerVel.y = 0;
    lastPointer.x = -9999;
    lastPointer.y = -9999;
  };

  const scheduleResize = () => {
    resize();
    draw(performance.now());
    window.requestAnimationFrame(() => {
      resize();
      draw(performance.now());
    });
  };

  const onThemeChange = () => {
    palette = readPalette();
    draw(lastDrawTime);
  };

  const themeObserver = new MutationObserver(onThemeChange);
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  });

  scheduleResize();
  rafId = window.requestAnimationFrame(tick);

  document.addEventListener('pointermove', onPointerMove, { passive: true });
  document.addEventListener('pointerleave', onPointerLeave);
  window.addEventListener('resize', scheduleResize, { passive: true });

  const ro = new ResizeObserver(scheduleResize);
  ro.observe(host);

  return () => {
    window.cancelAnimationFrame(rafId);
    document.removeEventListener('pointermove', onPointerMove);
    document.removeEventListener('pointerleave', onPointerLeave);
    window.removeEventListener('resize', scheduleResize);
    themeObserver.disconnect();
    ro.disconnect();
  };
}
