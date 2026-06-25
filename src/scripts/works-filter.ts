export function initWorksFilter(): void {
  const section = document.querySelector('[data-works]');
  if (!section) return;

  const cards = section.querySelectorAll<HTMLElement>('[data-work-item]');
  const industryBtns = section.querySelectorAll<HTMLButtonElement>('[data-works-filter-industry]');
  const serviceBtns = section.querySelectorAll<HTMLButtonElement>('[data-works-filter-service]');

  let industry = 'all';
  let service = 'all';

  const apply = () => {
    cards.forEach((card) => {
      const cardIndustries = card.dataset.industries?.split(',') ?? [];
      const cardServices = card.dataset.services?.split(',') ?? [];
      const matchIndustry = industry === 'all' || cardIndustries.includes(industry);
      const matchService = service === 'all' || cardServices.includes(service);
      const visible = matchIndustry && matchService;
      card.hidden = !visible;
      card.style.display = visible ? '' : 'none';
    });
  };

  industryBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      industry = btn.dataset.worksFilterIndustry ?? 'all';
      industryBtns.forEach((b) => b.classList.toggle('is-active', b === btn));
      apply();
    });
  });

  serviceBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      service = btn.dataset.worksFilterService ?? 'all';
      serviceBtns.forEach((b) => b.classList.toggle('is-active', b === btn));
      apply();
    });
  });
}
