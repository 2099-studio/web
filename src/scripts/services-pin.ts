import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Sticky services panels:
 * - Desktop: pin while scroll advances 01 → 02 → 03 → 04, then release
 * - Mobile (≤900px width): click/autoplay — no pin
 */
export function initServicesPin(): () => void {
  const section = document.querySelector<HTMLElement>('[data-services-pin]');
  const sticky = section?.querySelector<HTMLElement>('[data-services-sticky]');
  const panels = Array.from(section?.querySelectorAll<HTMLElement>('[data-services-panel]') ?? []);
  const ticks = Array.from(section?.querySelectorAll<HTMLElement>('[data-services-tick]') ?? []);

  if (!section || !sticky || panels.length < 2) return () => {};

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobileMq = window.matchMedia('(max-width: 900px)');

  const showPanel = (index: number) => {
    const clamped = Math.max(0, Math.min(panels.length - 1, index));
    panels.forEach((panel, i) => {
      panel.classList.toggle('is-active', i === clamped);
      panel.setAttribute('aria-hidden', String(i !== clamped));
    });
    ticks.forEach((tick, i) => tick.classList.toggle('is-active', i === clamped));
  };

  let trigger: ScrollTrigger | undefined;
  let timer = 0;
  let index = 0;

  const stopTimer = () => {
    window.clearInterval(timer);
    timer = 0;
  };

  const startTimer = () => {
    stopTimer();
    if (prefersReduced) return;
    timer = window.setInterval(() => {
      index = (index + 1) % panels.length;
      showPanel(index);
    }, 2800);
  };

  const onClick = () => {
    index = (index + 1) % panels.length;
    showPanel(index);
    startTimer();
  };

  const enableCompact = () => {
    trigger?.kill();
    trigger = undefined;
    sticky.addEventListener('click', onClick);
    showPanel(index);
    startTimer();
  };

  const enablePin = () => {
    stopTimer();
    sticky.removeEventListener('click', onClick);
    trigger?.kill();
    showPanel(0);
    index = 0;

    const panelCount = panels.length;
    trigger = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: () => `+=${Math.round(window.innerHeight * panelCount * 0.85)}`,
      pin: sticky,
      scrub: 0.65,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const stepped = Math.min(panelCount - 1, Math.floor(self.progress * panelCount));
        index = stepped;
        showPanel(stepped);
      },
    });
  };

  const syncMode = () => {
    if (prefersReduced || isMobileMq.matches) enableCompact();
    else enablePin();
    ScrollTrigger.refresh();
  };

  syncMode();
  isMobileMq.addEventListener('change', syncMode);

  return () => {
    stopTimer();
    sticky.removeEventListener('click', onClick);
    isMobileMq.removeEventListener('change', syncMode);
    trigger?.kill();
  };
}
