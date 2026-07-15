/** Magic UI Text Reveal — vanilla / GSAP port for section titles.
 * @see https://magicui.design/docs/components/text-reveal
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

interface WordShell {
  root: HTMLSpanElement;
  fill: HTMLSpanElement;
}

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
      // Drop whitespace-only nodes — spacing comes from word margins
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

  const total = fills.length;

  return ScrollTrigger.create({
    trigger: host,
    start: 'top 88%',
    end: 'top 42%',
    scrub: true,
    onUpdate: (self) => {
      const progress = self.progress;
      fills.forEach((fill, i) => {
        const start = i / total;
        const end = start + 1 / total;
        const local = gsap.utils.clamp(0, 1, (progress - start) / (end - start));
        fill.style.opacity = String(local);
      });
    },
  });
}

export function initTextReveal(): void {
  gsap.registerPlugin(ScrollTrigger);

  const hosts = document.querySelectorAll<HTMLElement>('[data-text-reveal]');
  hosts.forEach((host) => {
    mountTextReveal(host);
  });
}
