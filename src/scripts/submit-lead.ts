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

function appendHiddenField(form: HTMLFormElement, name: string, value: string): void {
  const input = document.createElement('input');
  input.type = 'hidden';
  input.name = name;
  input.value = value;
  form.appendChild(input);
}

function isTruthySuccess(value: unknown): boolean {
  return value === true || value === 'true';
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

/**
 * FormSubmit only sends autoresponses on classic POST submissions — not /ajax.
 * Hidden iframe keeps the user on the page and triggers the client confirmation email.
 */
async function submitViaFormSubmitIframe(
  data: LeadData,
  content: SiteContent,
  payload: ReturnType<typeof buildPayload>,
): Promise<SubmitLeadResult> {
  const studioEmail = content.site.contact.email;

  return new Promise((resolve) => {
    const frameName = `formsubmit_${Date.now()}`;
    const iframe = document.createElement('iframe');
    iframe.name = frameName;
    iframe.hidden = true;
    iframe.setAttribute('aria-hidden', 'true');
    document.body.append(iframe);

    const form = document.createElement('form');
    form.method = 'POST';
    form.action = `https://formsubmit.co/${encodeURIComponent(studioEmail)}`;
    form.target = frameName;
    form.acceptCharset = 'UTF-8';
    form.style.display = 'none';

    appendHiddenField(form, '_subject', `${content.contact.mailSubject} ${data.budget}`);
    appendHiddenField(form, '_template', 'table');
    appendHiddenField(form, '_captcha', 'false');
    appendHiddenField(form, '_replyto', data.email);
    appendHiddenField(form, '_autoresponse', payload.clientAutoresponse);
    appendHiddenField(form, '_next', `${window.location.href.split('#')[0]}#lead-sent`);
    appendHiddenField(form, 'name', data.name);
    appendHiddenField(form, 'email', data.email);
    appendHiddenField(form, 'need', data.need);
    appendHiddenField(form, 'project', data.projectDetail);
    appendHiddenField(form, 'budget', data.budget);
    appendHiddenField(form, 'locale', payload.locale);

    if (data.attachmentFile) {
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.name = 'attachment';
      const transfer = new DataTransfer();
      transfer.items.add(data.attachmentFile);
      fileInput.files = transfer.files;
      form.appendChild(fileInput);
    }

    let settled = false;
    const finish = (ok: boolean) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeoutId);
      form.remove();
      iframe.remove();
      resolve({ ok });
    };

    const timeoutId = window.setTimeout(() => finish(true), 4500);

    document.body.append(form);
    form.submit();
  });
}

async function submitViaFormSubmitAjax(
  data: LeadData,
  content: SiteContent,
): Promise<SubmitLeadResult> {
  const studioEmail = content.site.contact.email;

  try {
    const response = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(studioEmail)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        _subject: `${content.contact.mailSubject} ${data.budget}`,
        _template: 'table',
        _captcha: 'false',
        _replyto: data.email,
        name: data.name,
        email: data.email,
        need: data.need,
        project: data.projectDetail,
        budget: data.budget,
      }),
    });

    if (!response.ok) return { ok: false };

    const result = (await response.json()) as { success?: boolean | string; message?: string };
    if (isTruthySuccess(result.success)) return { ok: true };

    console.warn('[submit-lead] formsubmit ajax rejected:', result.message);
    return { ok: false };
  } catch (error) {
    console.error('[submit-lead] formsubmit ajax failed', error);
    return { ok: false };
  }
}

async function submitViaWeb3Forms(
  data: LeadData,
  content: SiteContent,
  payload: ReturnType<typeof buildPayload>,
  accessKey: string,
): Promise<SubmitLeadResult> {
  const message = [
    `Necesidad: ${data.need}`,
    `Proyecto: ${data.projectDetail}`,
    `Presupuesto: ${data.budget}`,
    `Idioma: ${payload.locale}`,
    data.attachmentFileName ? `Adjunto: ${data.attachmentFileName}` : null,
  ]
    .filter(Boolean)
    .join('\n');

  try {
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        access_key: accessKey,
        subject: `${content.contact.mailSubject} ${data.budget}`,
        from_name: data.name,
        name: data.name,
        email: data.email,
        replyto: data.email,
        message,
      }),
    });

    if (!response.ok) return { ok: false };

    const result = (await response.json()) as { success?: boolean; message?: string };
    if (result.success) return { ok: true };

    console.warn('[submit-lead] web3forms rejected:', result.message);
    return { ok: false };
  } catch (error) {
    console.error('[submit-lead] web3forms failed', error);
    return { ok: false };
  }
}

export async function submitLead(data: LeadData): Promise<SubmitLeadResult> {
  const content = getContent(getLocale());
  const payload = buildPayload(data, content);
  const webhookUrl = import.meta.env.PUBLIC_LEAD_WEBHOOK_URL?.trim();
  const web3formsKey = import.meta.env.PUBLIC_WEB3FORMS_ACCESS_KEY?.trim();

  if (webhookUrl) {
    const webhookResult = await submitViaWebhook(webhookUrl, payload);
    if (webhookResult.ok) return webhookResult;
  }

  const iframeResult = await submitViaFormSubmitIframe(data, content, payload);
  if (iframeResult.ok) return iframeResult;

  const ajaxResult = await submitViaFormSubmitAjax(data, content);
  if (ajaxResult.ok) return ajaxResult;

  if (web3formsKey) {
    return submitViaWeb3Forms(data, content, payload, web3formsKey);
  }

  return { ok: false };
}
