import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * Light viewport Hold for sections without scrubbed multi-step pins
 * (Works, Investment, Contact). Desktop only.
 */
export function initSectionHold(): () => void {
  const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-section-hold]'));
  if (!sections.length) return () => {};

  const desktopMq = window.matchMedia('(min-width: 1024px)');
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const triggers: ScrollTrigger[] = [];

  const clear = () => {
    triggers.splice(0).forEach((t) => t.kill());
  };

  const setup = () => {
    clear();
    if (prefersReduced.matches || !desktopMq.matches) return;

    sections.forEach((section) => {
      const pinTarget =
        section.querySelector<HTMLElement>('[data-section-hold-pin]') ?? section;

      triggers.push(
        ScrollTrigger.create({
          trigger: section,
          start: 'top top',
          end: () => `+=${Math.round(window.innerHeight * 0.85)}`,
          pin: pinTarget,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        }),
      );
    });
  };

  setup();

  const onChange = () => {
    setup();
    ScrollTrigger.refresh();
  };

  desktopMq.addEventListener('change', onChange);
  prefersReduced.addEventListener('change', onChange);

  return () => {
    clear();
    desktopMq.removeEventListener('change', onChange);
    prefersReduced.removeEventListener('change', onChange);
  };
}
