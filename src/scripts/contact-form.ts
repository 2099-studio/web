import { getContent } from '../i18n';
import { getLocale } from './locale';

export function initContactForm(): void {
  const form = document.querySelector<HTMLFormElement>('[data-contact-form]');
  if (!form) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const data = new FormData(form);
    const name = String(data.get('name') ?? '').trim();
    const email = String(data.get('email') ?? '').trim();
    const type = String(data.get('type') ?? '').trim();
    const message = String(data.get('message') ?? '').trim();

    if (!name || !email || !type) {
      form.reportValidity();
      return;
    }

    const t = getContent(getLocale());
    const { contact } = t;
    const subject = encodeURIComponent(`${contact.mailSubject} ${type}`);
    const body = encodeURIComponent(
      `${contact.mailBodyName} ${name}\n${contact.mailBodyEmail} ${email}\n${contact.mailBodyType} ${type}\n\n${message}`,
    );

    window.location.href = `mailto:${t.site.contact.email}?subject=${subject}&body=${body}`;
  });
}
