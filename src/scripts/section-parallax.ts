import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function initSectionParallax(): void {
  gsap.registerPlugin(ScrollTrigger);

  gsap.utils.toArray<HTMLElement>('[data-parallax-section]').forEach((section) => {
    const layers = section.querySelectorAll<HTMLElement>('[data-parallax]');

    layers.forEach((layer) => {
      const depth = Number.parseFloat(layer.dataset.parallax || '0.2');

      gsap.to(layer, {
        yPercent: depth * 100,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.2,
        },
      });
    });
  });

  gsap.utils.toArray<HTMLElement>('[data-parallax-block]').forEach((block) => {
    const depth = Number.parseFloat(block.dataset.parallaxBlock || '0.14');

    gsap.to(block, {
      y: () => depth * 220,
      ease: 'none',
      scrollTrigger: {
        trigger: block,
        start: 'top 95%',
        end: 'bottom 5%',
        scrub: 1.15,
      },
    });
  });
}
