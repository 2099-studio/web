import { getContent } from '../i18n';
import { getLocale } from './locale';

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

    const t = getContent(getLocale());
    const { contact } = t;
    const subject = encodeURIComponent(`${contact.mailSubject} ${budget}`);
    const body = encodeURIComponent(
      `${contact.mailBodyName} ${name}\n${contact.mailBodyEmail} ${email}\n${contact.mailBodyBudget} ${budget}\n\n${message}`,
    );

    if (success) {
      success.hidden = false;
    }

    // Open the mail client without leaving the page (so the success state stays visible).
    const mailto = `mailto:${t.site.contact.email}?subject=${subject}&body=${body}`;
    const link = document.createElement('a');
    link.href = mailto;
    link.rel = 'noopener';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    link.remove();
  });
}
