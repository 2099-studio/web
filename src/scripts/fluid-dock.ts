import gsap from 'gsap';
import { Flip } from 'gsap/Flip';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(Flip, ScrollTrigger);

type DockState = 'main' | 'works';

export function initFluidDock(): void {
  const dock = document.querySelector<HTMLElement>('[data-fluid-dock]');
  const shell = document.querySelector<HTMLElement>('[data-dock-shell]');
  const overlay = document.querySelector<HTMLElement>('[data-studio-overlay]');
  if (!dock || !shell) return;

  const states = {
    main: shell.querySelector<HTMLElement>('[data-dock-state="main"]'),
    works: shell.querySelector<HTMLElement>('[data-dock-state="works"]'),
  };

  let current: DockState = 'main';
  let flipping = false;

  const setState = (next: DockState) => {
    if (next === current || flipping || !states.main || !states.works) return;
    flipping = true;

    const from = states[current];
    const to = states[next];
    if (!from || !to) {
      flipping = false;
      return;
    }

    const state = Flip.getState(shell);

    from.hidden = true;
    from.classList.remove('is-active');
    to.hidden = false;
    to.classList.add('is-active');

    Flip.from(state, {
      duration: 0.45,
      ease: 'power2.out',
      absolute: false,
      onComplete: () => {
        current = next;
        flipping = false;
      },
    });
  };

  const openStudio = () => {
    if (!overlay) return;
    overlay.hidden = false;
    document.body.classList.add('is-overlay-open');
    gsap.fromTo(
      overlay.querySelector('.studio-overlay__panel'),
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.4, ease: 'power2.out' },
    );
    gsap.fromTo(
      overlay.querySelector('.studio-overlay__backdrop'),
      { opacity: 0 },
      { opacity: 1, duration: 0.3, ease: 'power1.out' },
    );
  };

  const closeStudio = () => {
    if (!overlay || overlay.hidden) return;
    const panel = overlay.querySelector('.studio-overlay__panel');
    const backdrop = overlay.querySelector('.studio-overlay__backdrop');
    gsap.to(panel, {
      y: 24,
      opacity: 0,
      duration: 0.25,
      ease: 'power2.in',
    });
    gsap.to(backdrop, {
      opacity: 0,
      duration: 0.25,
      ease: 'power1.in',
      onComplete: () => {
        overlay.hidden = true;
        document.body.classList.remove('is-overlay-open');
      },
    });
  };

  dock.querySelectorAll('[data-dock-open="studio"]').forEach((btn) => {
    btn.addEventListener('click', openStudio);
  });

  document.querySelectorAll('[data-studio-close]').forEach((btn) => {
    btn.addEventListener('click', (event) => {
      const target = event.currentTarget as HTMLElement;
      if (target.tagName === 'A') {
        // allow hash navigation, then close
        closeStudio();
        return;
      }
      event.preventDefault();
      closeStudio();
    });
  });

  dock.querySelector('[data-dock-back]')?.addEventListener('click', () => setState('main'));

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeStudio();
  });

  const works = document.querySelector('#works');
  if (works) {
    ScrollTrigger.create({
      trigger: works,
      start: 'top 55%',
      end: 'bottom 45%',
      onEnter: () => setState('works'),
      onEnterBack: () => setState('works'),
      onLeave: () => setState('main'),
      onLeaveBack: () => setState('main'),
    });
  }

  // Active link highlight by section
  const sectionMap: Array<{ id: string; link: string }> = [
    { id: 'works', link: 'works' },
    { id: 'services', link: 'services' },
    { id: 'contact', link: 'contact' },
  ];

  sectionMap.forEach(({ id, link }) => {
    const section = document.querySelector(`#${id}`);
    if (!section) return;
    ScrollTrigger.create({
      trigger: section,
      start: 'top 50%',
      end: 'bottom 50%',
      onToggle: (self) => {
        dock.querySelectorAll(`[data-dock-link="${link}"]`).forEach((el) => {
          el.classList.toggle('is-active', self.isActive);
        });
      },
    });
  });
}
