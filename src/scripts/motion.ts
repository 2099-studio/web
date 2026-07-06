import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initCursor } from './cursor';
import { initMethodology } from './methodology';
import { initWorksFilter } from './works-filter';
import { initContactForm } from './contact-form';
import { initButtonInteractions } from './button-interactions';
import { initIndustriesTabs } from './industries-tabs';
import { initSectionParallax } from './section-parallax';
import { initCanvasText } from './canvas-text';
import { initStarsField } from './stars-field';

export function initMotion(): void {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  initCanvasText();
  initStarsField();

  gsap.registerPlugin(ScrollTrigger);

  const heroTitle = document.querySelector<HTMLElement>('[data-hero-title]');
  const heroContent = document.querySelectorAll<HTMLElement>('[data-hero-content]');

  if (!prefersReduced && heroTitle) {
    gsap.from(heroTitle, {
      opacity: 0,
      y: 32,
      duration: 0.8,
      ease: 'power2.out',
      delay: 0.15,
    });

    gsap.from(heroContent, {
      opacity: 0,
      y: 24,
      duration: 0.6,
      ease: 'power2.out',
      stagger: 0.1,
      delay: 0.35,
    });
  }

  if (prefersReduced) {
    document.querySelectorAll('[data-methodology-step]').forEach((step) => {
      step.classList.add('is-active');
    });
    return;
  }

  const lenis = new Lenis({
    lerp: 0.08,
    smoothWheel: true,
  });

  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
    gsap.from(el, {
      opacity: 0,
      y: 48,
      duration: 0.8,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    });
  });

  const serviceCards = gsap.utils.toArray<HTMLElement>('[data-service-card]');
  if (serviceCards.length) {
    gsap.from(serviceCards, {
      opacity: 0,
      y: 56,
      duration: 0.7,
      ease: 'power2.out',
      stagger: 0.1,
      scrollTrigger: {
        trigger: serviceCards[0]?.parentElement,
        start: 'top 80%',
        toggleActions: 'play none none none',
      },
    });
  }

  const industryLayers = gsap.utils.toArray<HTMLElement>('[data-industry-panel]');
  if (industryLayers.length) {
    gsap.from(industryLayers[0]?.parentElement ?? industryLayers[0], {
      opacity: 0,
      y: 40,
      duration: 0.7,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: industryLayers[0]?.closest('[data-industries]'),
        start: 'top 80%',
        toggleActions: 'play none none none',
      },
    });
  }

  initIndustriesTabs();

  const workCards = gsap.utils.toArray<HTMLElement>('[data-work-card]');
  if (workCards.length) {
    gsap.from(workCards, {
      opacity: 0,
      y: 64,
      duration: 0.75,
      ease: 'power2.out',
      stagger: 0.1,
      scrollTrigger: {
        trigger: workCards[0]?.parentElement,
        start: 'top 80%',
        toggleActions: 'play none none none',
      },
    });
  }

  initMethodology();
  initWorksFilter();
  initContactForm();
  initSectionParallax();
  initButtonInteractions();

  initCursor();
}
