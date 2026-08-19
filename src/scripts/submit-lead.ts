import { getContent } from '../i18n';
import type { SiteContent } from '../i18n/types';
import { getLocale } from './locale';

export interface LeadData {
  name: string;
  email: string;
  budget: string;
  need: string;
  projectDetail: string;
  attachmentFile?: File | null;
  attachmentFileName?: string;
}

export interface SubmitLeadResult {
  ok: boolean;
}

function fillClientAutoresponse(template: string, data: LeadData): string {
  return template
    .replaceAll('{name}', data.name)
    .replaceAll('{need}', data.need)
    .replaceAll('{projectDetail}', data.projectDetail)
    .replaceAll('{budget}', data.budget);
}

function buildPayload(data: LeadData, content: SiteContent) {
  const locale = getLocale();

  return {
    locale,
    name: data.name,
    email: data.email,
    budget: data.budget,
    need: data.need,
    projectDetail: data.projectDetail,
    attachmentFileName: data.attachmentFileName ?? null,
    studioEmail: content.site.contact.email,
    clientAutoresponse: fillClientAutoresponse(content.heroChat.clientAutoresponse, data),
  };
}

async function submitViaWebhook(webhookUrl: string, payload: Record<string, unknown>): Promise<SubmitLeadResult> {
  const body = JSON.stringify(payload);

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body,
    });

    if (response.ok) {
      try {
        const result = (await response.json()) as { ok?: boolean };
        if (result.ok !== false) return { ok: true };
      } catch {
        return { ok: true };
      }
    }

    return { ok: false };
  } catch (error) {
    console.warn('[submit-lead] webhook request failed', error);
    return { ok: false };
  }
}

async function submitViaFormSubmit(
  data: LeadData,
  content: SiteContent,
  payload: ReturnType<typeof buildPayload>,
): Promise<SubmitLeadResult> {
  const studioEmail = content.site.contact.email;
  const formData = new FormData();

  formData.append('_subject', `${content.contact.mailSubject} ${data.budget}`);
  formData.append('_template', 'table');
  formData.append('_captcha', 'false');
  formData.append('_replyto', data.email);
  formData.append('_autoresponse', payload.clientAutoresponse);
  formData.append('name', data.name);
  formData.append('email', data.email);
  formData.append('need', data.need);
  formData.append('project', data.projectDetail);
  formData.append('budget', data.budget);
  formData.append('locale', payload.locale);

  if (data.attachmentFileName) {
    formData.append('attachment_name', data.attachmentFileName);
  }

  if (data.attachmentFile) {
    formData.append('attachment', data.attachmentFile, data.attachmentFileName || 'attachment');
  }

  try {
    const response = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(studioEmail)}`, {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: formData,
    });

    if (!response.ok) {
      return { ok: false };
    }

    const result = (await response.json()) as { success?: boolean; message?: string };
    return { ok: result.success === true };
  } catch (error) {
    console.error('[submit-lead] formsubmit failed', error);
    return { ok: false };
  }
}

export async function submitLead(data: LeadData): Promise<SubmitLeadResult> {
  const content = getContent(getLocale());
  const payload = buildPayload(data, content);
  const webhookUrl = import.meta.env.PUBLIC_LEAD_WEBHOOK_URL?.trim();

  if (webhookUrl) {
    const webhookResult = await submitViaWebhook(webhookUrl, payload);
    if (webhookResult.ok) return webhookResult;
  }

  return submitViaFormSubmit(data, content, payload);
}
