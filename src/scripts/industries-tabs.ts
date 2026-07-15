import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Industries tabs + scroll pin:
 * - Desktop: pin the frame while scroll advances Web2 → SaaS → Web3 once
 * - After the last layer, the pin releases into the next section
 * - Mobile: swipe/arrows + optional autoplay
 */
export function initIndustriesTabs(): () => void {
  const section = document.querySelector<HTMLElement>('[data-industries]');
  if (!section) return () => {};

  const frame = section.querySelector<HTMLElement>('[data-industries-sticky]') ?? section.querySelector<HTMLElement>('.industries__frame');
  const tabs = Array.from(section.querySelectorAll<HTMLButtonElement>('[data-industry-tab]'));
  const panels = Array.from(
    section.querySelectorAll<HTMLElement>('[data-industry-panel]:not(.industry-panel--mobile)'),
  );
  const desktopBody = section.querySelector<HTMLElement>('[data-industries-desktop]');
  const mobileBody = section.querySelector<HTMLElement>('[data-industries-mobile]');
  const mobileTrack = section.querySelector<HTMLElement>('[data-industry-mobile-track]');
  const mobileSlides = Array.from(section.querySelectorAll<HTMLElement>('[data-industry-mobile-slide]'));
  const dots = Array.from(section.querySelectorAll<HTMLButtonElement>('[data-industry-dot]'));

  if (!tabs.length || !panels.length || !frame) return () => {};

  let activeIndex = 0;
  let autoplayTimer: ReturnType<typeof setInterval> | undefined;
  let pinTrigger: ScrollTrigger | undefined;

  const total = tabs.length;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobileMq = window.matchMedia('(max-width: 767px)');
  const isShortMq = window.matchMedia('(max-height: 820px)');

  const syncLayoutA11y = () => {
    const isMobile = isMobileMq.matches;
    desktopBody?.setAttribute('aria-hidden', String(isMobile));
    mobileBody?.setAttribute('aria-hidden', String(!isMobile));
  };

  const updateArrowStates = (index: number) => {
    section.querySelectorAll('[data-industry-arrows]').forEach((group) => {
      const prev = group.querySelector<HTMLButtonElement>('[data-industry-prev]');
      const next = group.querySelector<HTMLButtonElement>('[data-industry-next]');
      prev?.toggleAttribute('disabled', index === 0);
      next?.toggleAttribute('disabled', index === total - 1);
      prev?.classList.toggle('is-inactive', index === 0);
      next?.classList.toggle('is-inactive', index === total - 1);
    });
  };

  const syncTabs = (index: number) => {
    tabs.forEach((tab, i) => {
      const match = i === index;
      tab.classList.toggle('is-active', match);
      tab.setAttribute('aria-selected', String(match));
    });
  };

  const setActive = (index: number, fromUser = false) => {
    const next = Math.max(0, Math.min(total - 1, index));
    const changed = next !== activeIndex;
    activeIndex = next;
    syncTabs(activeIndex);

    panels.forEach((panel, i) => {
      const show = i === activeIndex;
      panel.hidden = !show;
      if (show && (changed || fromUser)) {
        panel.classList.remove('is-entering');
        void panel.offsetWidth;
        panel.classList.add('is-entering');
      }
    });

    updateArrowStates(activeIndex);

    if (mobileTrack && mobileSlides.length) {
      const slide = mobileSlides[activeIndex];
      if (slide) {
        mobileTrack.scrollTo({
          left: slide.offsetLeft,
          behavior: fromUser ? 'smooth' : 'auto',
        });
      }
    }

    dots.forEach((dot, i) => {
      dot.classList.toggle('is-active', i === activeIndex);
    });

    if (fromUser) stopAutoplay();
  };

  const stopAutoplay = () => {
    if (autoplayTimer) clearInterval(autoplayTimer);
    autoplayTimer = undefined;
  };

  const startAutoplay = () => {
    if (!isMobileMq.matches || prefersReduced) return;
    stopAutoplay();
    autoplayTimer = setInterval(() => {
      setActive((activeIndex + 1) % total);
    }, 5000);
  };

  const killPin = () => {
    pinTrigger?.kill();
    pinTrigger = undefined;
  };

  const setupPin = () => {
    killPin();
    if (prefersReduced || isMobileMq.matches || isShortMq.matches) return;

    setActive(0);

    pinTrigger = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      // Hold long enough to scrub through every industry layer, then release
      end: () => `+=${Math.round(window.innerHeight * total * 1.05)}`,
      pin: frame,
      scrub: 0.7,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const stepped = Math.min(total - 1, Math.floor(self.progress * total));
        if (stepped !== activeIndex) setActive(stepped);
      },
    });
  };

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const idx = Number(tab.dataset.tabIndex);
      if (Number.isNaN(idx)) return;
      setActive(idx, true);
    });
  });

  section.querySelectorAll('[data-industry-prev]').forEach((btn) => {
    btn.addEventListener('click', () => setActive(activeIndex - 1, true));
  });

  section.querySelectorAll('[data-industry-next]').forEach((btn) => {
    btn.addEventListener('click', () => setActive(activeIndex + 1, true));
  });

  section.querySelector('[data-industry-mobile-prev]')?.addEventListener('click', () => {
    setActive(activeIndex - 1, true);
  });

  section.querySelector('[data-industry-mobile-next]')?.addEventListener('click', () => {
    setActive(activeIndex + 1, true);
  });

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const idx = Number(dot.dataset.industryDot);
      if (!Number.isNaN(idx)) setActive(idx, true);
    });
  });

  if (mobileTrack) {
    mobileTrack.addEventListener(
      'scroll',
      () => {
        if (!isMobileMq.matches) return;
        const width = mobileTrack.clientWidth || 1;
        const idx = Math.round(mobileTrack.scrollLeft / width);
        if (idx !== activeIndex && idx >= 0 && idx < total) {
          setActive(idx, true);
        }
      },
      { passive: true },
    );
  }

  const onResize = () => {
    syncLayoutA11y();
    setupPin();
    if (isMobileMq.matches) startAutoplay();
    else stopAutoplay();
    ScrollTrigger.refresh();
  };

  setActive(0);
  syncLayoutA11y();
  setupPin();
  if (isMobileMq.matches) startAutoplay();

  isMobileMq.addEventListener('change', onResize);
  isShortMq.addEventListener('change', onResize);
  window.addEventListener('resize', onResize);

  return () => {
    stopAutoplay();
    killPin();
    isMobileMq.removeEventListener('change', onResize);
    isShortMq.removeEventListener('change', onResize);
    window.removeEventListener('resize', onResize);
  };
}
