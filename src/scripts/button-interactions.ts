import gsap from 'gsap';

const MAGNETIC_SELECTOR = '.btn-primary, .btn-secondary, .btn-hero, [data-magnetic]';

export function initButtonInteractions(): void {
  if (window.matchMedia('(pointer: coarse)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  document.querySelectorAll<HTMLElement>(MAGNETIC_SELECTOR).forEach((el) => {
    const strength = el.classList.contains('btn-hero') ? 0.16 : 0.22;

    const quickX = gsap.quickTo(el, '--magnet-x', {
      duration: 0.45,
      ease: 'power3.out',
      unit: 'px',
    });
    const quickY = gsap.quickTo(el, '--magnet-y', {
      duration: 0.45,
      ease: 'power3.out',
      unit: 'px',
    });

    el.addEventListener('mousemove', (event) => {
      const rect = el.getBoundingClientRect();
      const offsetX = (event.clientX - rect.left - rect.width / 2) * strength;
      const offsetY = (event.clientY - rect.top - rect.height / 2) * strength;
      quickX(offsetX);
      quickY(offsetY);
    });

    el.addEventListener('mouseleave', () => {
      quickX(0);
      quickY(0);
    });
  });
}
