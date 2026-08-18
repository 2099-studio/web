import { getContent } from '../i18n';
import { getLocale } from './locale';

export interface LeadData {
  name: string;
  email: string;
  budget: string;
  message: string;
}

export function submitLead(data: LeadData): void {
  const t = getContent(getLocale());
  const { contact } = t;
  const subject = encodeURIComponent(`${contact.mailSubject} ${data.budget}`);
  const body = encodeURIComponent(
    `${contact.mailBodyName} ${data.name}\n${contact.mailBodyEmail} ${data.email}\n${contact.mailBodyBudget} ${data.budget}\n\n${data.message}`,
  );

  const mailto = `mailto:${t.site.contact.email}?subject=${subject}&body=${body}`;
  const link = document.createElement('a');
  link.href = mailto;
  link.rel = 'noopener';
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  link.remove();
}
