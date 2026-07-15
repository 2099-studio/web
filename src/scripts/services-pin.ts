import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Sticky services panels:
 * - Scroll advances 01 → 02 → 03 → 04 once
 * - After the last panel, the pin releases and scroll continues to the next section
 */
export function initServicesPin(): () => void {
  const section = document.querySelector<HTMLElement>('[data-services-pin]');
  const sticky = section?.querySelector<HTMLElement>('[data-services-sticky]');
  const panels = Array.from(section?.querySelectorAll<HTMLElement>('[data-services-panel]') ?? []);
  const ticks = Array.from(section?.querySelectorAll<HTMLElement>('[data-services-tick]') ?? []);

  if (!section || !sticky || panels.length < 2) return () => {};

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.matchMedia('(max-width: 900px)').matches;

  const showPanel = (index: number) => {
    const clamped = Math.max(0, Math.min(panels.length - 1, index));
    panels.forEach((panel, i) => {
      panel.classList.toggle('is-active', i === clamped);
      panel.setAttribute('aria-hidden', String(i !== clamped));
    });
    ticks.forEach((tick, i) => tick.classList.toggle('is-active', i === clamped));
  };

  if (prefersReduced || isMobile) {
    let index = 0;
    let timer = 0;

    const start = () => {
      window.clearInterval(timer);
      if (prefersReduced) return;
      timer = window.setInterval(() => {
        index = (index + 1) % panels.length;
        showPanel(index);
      }, 2800);
    };

    sticky.addEventListener('click', () => {
      index = (index + 1) % panels.length;
      showPanel(index);
      start();
    });

    showPanel(0);
    start();
    return () => window.clearInterval(timer);
  }

  const panelCount = panels.length;
  showPanel(0);

  const trigger = ScrollTrigger.create({
    trigger: section,
    start: 'top top',
    // One viewport of travel per panel, then release into Industries
    end: () => `+=${Math.round(window.innerHeight * panelCount * 0.85)}`,
    pin: sticky,
    scrub: 0.65,
    anticipatePin: 1,
    invalidateOnRefresh: true,
    onUpdate: (self) => {
      const stepped = Math.min(
        panelCount - 1,
        Math.floor(self.progress * panelCount),
      );
      showPanel(stepped);
    },
  });

  return () => {
    trigger.kill();
  };
}
