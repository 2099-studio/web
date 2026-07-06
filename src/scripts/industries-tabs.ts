export function initIndustriesTabs(): void {
  const section = document.querySelector<HTMLElement>('[data-industries]');
  if (!section) return;

  const tabs = section.querySelectorAll<HTMLButtonElement>('[data-industry-tab]');
  const panels = section.querySelectorAll<HTMLElement>(
    '[data-industry-panel]:not(.industry-panel--mobile)',
  );
  const mobileTrack = section.querySelector<HTMLElement>('[data-industry-mobile-track]');
  const mobileSlides = section.querySelectorAll<HTMLElement>('[data-industry-mobile-slide]');
  const dots = section.querySelectorAll<HTMLButtonElement>('[data-industry-dot]');

  if (!tabs.length || !panels.length) return;

  let activeIndex = 0;
  let autoplayTimer: ReturnType<typeof setInterval> | undefined;
  let isAutoClick = false;

  const total = tabs.length;

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
    activeIndex = (index + total) % total;
    syncTabs(activeIndex);

    panels.forEach((panel, i) => {
      const show = i === activeIndex;
      panel.hidden = !show;
      if (show) {
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

  const startAutoplay = () => {
    if (window.innerWidth < 768) return;
    stopAutoplay();
    autoplayTimer = setInterval(() => {
      isAutoClick = true;
      setActive(activeIndex + 1);
      isAutoClick = false;
    }, 5000);
  };

  const stopAutoplay = () => {
    if (autoplayTimer) clearInterval(autoplayTimer);
    autoplayTimer = undefined;
  };

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const idx = Number(tab.dataset.tabIndex);
      if (Number.isNaN(idx)) return;
      if (!isAutoClick) setActive(idx, true);
      else setActive(idx);
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
        if (window.innerWidth >= 768) return;
        const width = mobileTrack.clientWidth || 1;
        const idx = Math.round(mobileTrack.scrollLeft / width);
        if (idx !== activeIndex && idx >= 0 && idx < total) {
          activeIndex = idx;
          syncTabs(idx);
          panels.forEach((panel, i) => {
            panel.hidden = i !== idx;
          });
          dots.forEach((dot, i) => {
            dot.classList.toggle('is-active', i === idx);
          });
          updateArrowStates(idx);
        }
      },
      { passive: true },
    );
  }

  setActive(0);
  startAutoplay();

  window.addEventListener('resize', () => {
    if (window.innerWidth >= 768) startAutoplay();
    else stopAutoplay();
  });
}
