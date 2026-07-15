import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initCursor } from './cursor';
import { initMethodology } from './methodology';
import { initWorksFilter } from './works-filter';
import { initContactForm } from './contact-form';
import { initButtonInteractions } from './button-interactions';
import { initGooeyButtons } from './gooey-buttons';
import { initIndustriesTabs } from './industries-tabs';
import { initSectionParallax } from './section-parallax';
import { initCanvasText, refreshCanvasText } from './canvas-text';
import { initSparklesText } from './sparkles-text';
import { initTextReveal } from './text-reveal';
import { initStarsField } from './stars-field';
import { initHeroCarousel } from './hero-carousel';
import { initServicesPin } from './services-pin';

export function initMotion(): void {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  initCanvasText();
  initSparklesText();
  initStarsField();
  initHeroCarousel();

  gsap.registerPlugin(ScrollTrigger);

  const heroTitle = document.querySelector<HTMLElement>('[data-hero-title]');
  const heroContent = document.querySelectorAll<HTMLElement>('[data-hero-content]');

  if (!prefersReduced && heroTitle) {
    gsap.from(heroTitle, {
      opacity: 0,
      y: 36,
      duration: 0.85,
      ease: 'power2.out',
      delay: 0.12,
      onComplete: refreshCanvasText,
    });

    gsap.from(heroContent, {
      opacity: 0,
      y: 24,
      duration: 0.65,
      ease: 'power2.out',
      stagger: 0.08,
      delay: 0.28,
    });
  }

  if (prefersReduced) {
    document.querySelectorAll('[data-methodology-step]').forEach((step) => {
      step.classList.add('is-active');
    });
    initTextReveal();
    initWorksFilter();
    initContactForm();
    initIndustriesTabs();
    initServicesPin();
    initButtonInteractions();
    initGooeyButtons();
    return;
  }

  const lenis = new Lenis({
    lerp: 0.07,
    smoothWheel: true,
    wheelMultiplier: 0.9,
  });

  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
    const hasTextReveal = Boolean(el.querySelector('[data-text-reveal]'));
    gsap.from(el, {
      opacity: hasTextReveal ? 1 : 0,
      y: 64,
      duration: 0.95,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 88%',
        toggleActions: 'play none none none',
      },
      onComplete: refreshCanvasText,
    });
  });

  // Pins first, then text-reveal — scrub must account for pinned layouts
  initServicesPin();
  initIndustriesTabs();
  initMethodology();
  initTextReveal();

  const workCards = gsap.utils.toArray<HTMLElement>('[data-work-card]');
  if (workCards.length) {
    gsap.from(workCards, {
      opacity: 0,
      y: 96,
      duration: 0.95,
      ease: 'power3.out',
      stagger: 0.12,
      scrollTrigger: {
        trigger: workCards[0]?.parentElement,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    });
  }

  const methodologySteps = gsap.utils.toArray<HTMLElement>('[data-methodology-step]');
  if (methodologySteps.length) {
    gsap.from(methodologySteps, {
      opacity: 0,
      y: 48,
      duration: 0.75,
      ease: 'power3.out',
      stagger: 0.08,
      scrollTrigger: {
        trigger: methodologySteps[0]?.closest('[data-methodology]'),
        start: 'top 80%',
        toggleActions: 'play none none none',
      },
    });
  }

  initWorksFilter();
  initContactForm();
  initSectionParallax();
  initButtonInteractions();
  initGooeyButtons();
  initCursor();
}
