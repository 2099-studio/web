import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function initMethodology(): void {
  const section = document.querySelector<HTMLElement>('[data-methodology]');
  if (!section) return;

  const steps = gsap.utils.toArray<HTMLElement>('[data-methodology-step]');
  const progressFill = section.querySelector<HTMLElement>('[data-methodology-progress]');
  if (!steps.length) return;

  const setActiveStep = (index: number) => {
    steps.forEach((step, i) => {
      step.classList.toggle('is-active', i === index);
    });
  };

  const updateProgress = (index: number) => {
    if (!progressFill) return;
    gsap.set(progressFill, { scaleY: (index + 1) / steps.length });
  };

  const canPin =
    window.matchMedia('(min-width: 1024px)').matches &&
    window.matchMedia('(min-height: 900px)').matches;

  setActiveStep(0);
  updateProgress(0);

  if (canPin) {
    ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: `+=${(steps.length - 1) * 75}%`,
      pin: true,
      scrub: 0.5,
      anticipatePin: 1,
      onUpdate: (self) => {
        const index = Math.min(steps.length - 1, Math.floor(self.progress * steps.length));
        setActiveStep(index);
        updateProgress(index);
      },
    });
  } else {
    steps.forEach((step, index) => {
      ScrollTrigger.create({
        trigger: step,
        start: 'top 70%',
        end: 'bottom 30%',
        onEnter: () => {
          setActiveStep(index);
          updateProgress(index);
        },
        onEnterBack: () => {
          setActiveStep(index);
          updateProgress(index);
        },
      });
    });
  }
}
