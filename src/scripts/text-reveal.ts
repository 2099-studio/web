/**
 * Magic UI Text Reveal — vanilla / GSAP port for Astro section titles.
 * @see https://magicui.design/docs/components/text-reveal
 *
 * Note: this project is Astro (no React). Do not use
 * `pnpm dlx shadcn@latest add @magicui/text-reveal` — that targets React/shadcn.
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

interface WordShell {
  root: HTMLSpanElement;
  fill: HTMLSpanElement;
}

const PIN_SECTION_SELECTOR =
  '[data-services-pin], [data-industries], [data-methodology], [data-section-hold]';

function createWord(text: string): WordShell {
  const root = document.createElement('span');
  root.className = 'text-reveal__word';

  const ghost = document.createElement('span');
  ghost.className = 'text-reveal__ghost';
  ghost.setAttribute('aria-hidden', 'true');
  ghost.textContent = text;

  const fill = document.createElement('span');
  fill.className = 'text-reveal__fill';
  fill.dataset.textRevealWord = '';
  fill.textContent = text;

  root.append(ghost, fill);
  return { root, fill };
}

function processNode(node: Node, fills: HTMLSpanElement[]): void {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent ?? '';
    if (!text.trim()) {
      if (text.length) node.parentNode?.removeChild(node);
      return;
    }

    const frag = document.createDocumentFragment();
    const words = text.trim().split(/\s+/);

    words.forEach((part) => {
      if (!part) return;
      const word = createWord(part);
      fills.push(word.fill);
      frag.appendChild(word.root);
    });

    node.parentNode?.replaceChild(frag, node);
    return;
  }

  if (node.nodeType !== Node.ELEMENT_NODE) return;

  const el = node as HTMLElement;
  if (el.tagName === 'BR') return;
  if (el.classList.contains('text-reveal__word')) return;

  Array.from(el.childNodes).forEach((child) => processNode(child, fills));
}

function applyProgress(fills: HTMLSpanElement[], progress: number): void {
  const total = fills.length;
  fills.forEach((fill, i) => {
    const start = i / total;
    const end = start + 1 / total;
    const local = gsap.utils.clamp(0, 1, (progress - start) / (end - start));
    fill.style.opacity = String(local);
  });
}

function mountTextReveal(host: HTMLElement): ScrollTrigger | null {
  if (host.dataset.textRevealReady === 'true') return null;

  const accessibleLabel = host.textContent?.replace(/\s+/g, ' ').trim() ?? '';
  if (accessibleLabel) {
    host.setAttribute('aria-label', accessibleLabel);
  }

  const fills: HTMLSpanElement[] = [];
  Array.from(host.childNodes).forEach((child) => processNode(child, fills));

  host.dataset.textRevealReady = 'true';
  host.classList.add('text-reveal');

  if (!fills.length) return null;

  fills.forEach((fill) => {
    fill.setAttribute('aria-hidden', 'true');
  });

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    fills.forEach((fill) => {
      fill.style.opacity = '1';
    });
    return null;
  }

  gsap.set(fills, { opacity: 0 });

  // Pinned sections keep the title fixed — scrub against the section docking instead
  const pinRoot = host.closest(PIN_SECTION_SELECTOR) as HTMLElement | null;
  const trigger = pinRoot ?? host;

  return ScrollTrigger.create({
    trigger,
    start: 'top 88%',
    // Finish reveal as the section reaches the top (when pins lock)
    end: pinRoot ? 'top 12%' : 'top 40%',
    scrub: 0.35,
    invalidateOnRefresh: true,
    onUpdate: (self) => {
      applyProgress(fills, self.progress);
    },
    onLeave: () => {
      applyProgress(fills, 1);
    },
    onEnterBack: (self) => {
      applyProgress(fills, self.progress);
    },
  });
}

export function initTextReveal(): () => void {
  gsap.registerPlugin(ScrollTrigger);

  const triggers: ScrollTrigger[] = [];
  const hosts = document.querySelectorAll<HTMLElement>('[data-text-reveal]');

  hosts.forEach((host) => {
    const trigger = mountTextReveal(host);
    if (trigger) triggers.push(trigger);
  });

  ScrollTrigger.refresh();

  return () => {
    triggers.forEach((t) => t.kill());
  };
}
