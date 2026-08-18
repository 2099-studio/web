import { submitLead } from './submit-lead';

export function initContactForm(): void {
  const form = document.querySelector<HTMLFormElement>('[data-contact-form]');
  if (!form) return;

  const success = form.querySelector<HTMLElement>('[data-contact-success]');

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const data = new FormData(form);
    const name = String(data.get('name') ?? '').trim();
    const email = String(data.get('email') ?? '').trim();
    const budget = String(data.get('budget') ?? '').trim();
    const message = String(data.get('message') ?? '').trim();

    if (!name || !email || !budget || !message) {
      form.reportValidity();
      return;
    }

    if (success) {
      success.hidden = false;
    }

    submitLead({ name, email, budget, message });
  });
}
