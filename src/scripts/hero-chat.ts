import { getContent } from '../i18n';
import type { SiteContent } from '../i18n/types';
import { getLocale } from './locale';
import { submitLead } from './submit-lead';

type ChatStep = 'need' | 'contact' | 'details' | 'budget' | 'done';

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const ALLOWED_EXTENSIONS = new Set(['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx']);

interface ChatState {
  step: ChatStep;
  necesidad: string;
  nombre: string;
  email: string;
  proyectoDetalle: string;
  presupuesto: string;
  attachment: File | null;
}

function normalize(text: string): string {
  return text.trim().toLowerCase();
}

function parseNameEmail(input: string): { name: string; email: string } | null {
  const trimmed = input.trim();
  const emailMatch = trimmed.match(/[^\s,]+@[^\s,]+\.[^\s,]+/);
  if (!emailMatch) return null;

  const email = emailMatch[0];
  const namePart = trimmed
    .replace(email, '')
    .replace(/[,;]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!namePart) return null;
  return { name: namePart, email };
}

function isAllowedFile(file: File): boolean {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  return ALLOWED_EXTENSIONS.has(ext);
}

function getBudgetSuggestions(input: string, suggestions: SiteContent['heroChat']['suggestions']['budget']): string[] {
  const value = normalize(input);
  if (!value) return suggestions.default;
  if (value.includes('menos') || value.includes('less')) return suggestions.less;
  if (value.includes('más') || value.includes('mas') || value.includes('more')) return suggestions.more;
  if (/\d/.test(value)) return suggestions.number;
  return suggestions.default;
}

function getSuggestions(step: ChatStep, input: string, chat: SiteContent['heroChat']): string[] {
  if (step === 'need') return chat.suggestions.project.default;
  if (step === 'contact' && input.trim().length > 0) return chat.suggestions.contact;
  if (step === 'budget') return getBudgetSuggestions(input, chat.suggestions.budget);
  return [];
}

function withName(template: string, name: string): string {
  return template.replace('{name}', name);
}

function createMessage(text: string, role: 'assistant' | 'user'): HTMLElement {
  const msg = document.createElement('div');
  msg.className = `hero-chat__msg hero-chat__msg--${role}`;
  const p = document.createElement('p');
  p.textContent = text;
  msg.appendChild(p);
  return msg;
}

function scrollMessages(container: HTMLElement): void {
  container.scrollTop = container.scrollHeight;
}

export function initHeroChat(): void {
  const chatWrap = document.querySelector<HTMLElement>('#hero-chat');
  const root = document.querySelector<HTMLElement>('[data-hero-chat]');
  if (!root) return;

  const messagesEl = root.querySelector<HTMLElement>('[data-hero-chat-messages]');
  const suggestionsEl = root.querySelector<HTMLElement>('[data-hero-chat-suggestions]');
  const suggestionsList = suggestionsEl?.querySelector<HTMLElement>('.hero-chat__suggestions-list');
  const form = root.querySelector<HTMLFormElement>('[data-hero-chat-form]');
  const input = root.querySelector<HTMLTextAreaElement>('[data-hero-chat-input]');
  const counterEl = root.querySelector<HTMLElement>('[data-hero-chat-counter]');
  const attachBtn = root.querySelector<HTMLButtonElement>('[data-hero-chat-attach]');
  const fileInput = root.querySelector<HTMLInputElement>('[data-hero-chat-file-input]');
  const fileBar = root.querySelector<HTMLElement>('[data-hero-chat-file]');
  const fileNameEl = root.querySelector<HTMLElement>('[data-hero-chat-file-name]');
  const fileRemoveBtn = root.querySelector<HTMLButtonElement>('[data-hero-chat-file-remove]');
  const sendBtn = form?.querySelector<HTMLButtonElement>('button[type="submit"]');

  if (
    !messagesEl ||
    !suggestionsEl ||
    !suggestionsList ||
    !form ||
    !input ||
    !counterEl ||
    !attachBtn ||
    !fileInput ||
    !fileBar ||
    !fileNameEl ||
    !fileRemoveBtn
  ) {
    return;
  }

  const state: ChatState = {
    step: 'need',
    necesidad: '',
    nombre: '',
    email: '',
    proyectoDetalle: '',
    presupuesto: '',
    attachment: null,
  };

  function content(): SiteContent['heroChat'] {
    return getContent(getLocale()).heroChat;
  }

  function detailsMaxLength(): number {
    return content().projectDetailsMaxLength;
  }

  function resetInputHeight(): void {
    input.style.height = 'auto';
  }

  function resizeInput(): void {
    resetInputHeight();
    input.style.height = `${input.scrollHeight}px`;
  }

  function updatePlaceholder(): void {
    const c = content();
    input.placeholder = state.step === 'done' ? '' : c.inputPlaceholder;
  }

  function updateCharCounter(): void {
    const max = detailsMaxLength();
    if (state.step !== 'details') {
      counterEl.hidden = true;
      input.removeAttribute('maxlength');
      return;
    }

    counterEl.hidden = false;
    input.maxLength = max;
    counterEl.textContent = `${input.value.length}/${max}`;
  }

  function renderFileBar(): void {
    if (!state.attachment) {
      fileBar.hidden = true;
      fileNameEl.textContent = '';
      return;
    }

    fileBar.hidden = false;
    fileNameEl.textContent = `📎 ${state.attachment.name}`;
  }

  function clearAttachment(): void {
    state.attachment = null;
    fileInput.value = '';
    renderFileBar();
  }

  function setDisabled(done: boolean): void {
    input.disabled = done;
    attachBtn.disabled = done;
    sendBtn?.toggleAttribute('disabled', done);
  }

  function renderSuggestions(items: string[]): void {
    suggestionsList.replaceChildren();
    if (state.step === 'done' || items.length === 0) {
      suggestionsEl.hidden = true;
      return;
    }

    suggestionsEl.hidden = false;
    items.forEach((item) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'hero-chat__chip';
      chip.textContent = item;
      chip.addEventListener('click', () => {
        input.value = item;
        resizeInput();
        updateCharCounter();
        form.requestSubmit();
      });
      suggestionsList.appendChild(chip);
    });
  }

  function addAssistantMessage(text: string): void {
    messagesEl.appendChild(createMessage(text, 'assistant'));
    scrollMessages(messagesEl);
  }

  function addUserMessage(text: string): void {
    messagesEl.appendChild(createMessage(text, 'user'));
    scrollMessages(messagesEl);
  }

  function updateSuggestions(): void {
    renderSuggestions(getSuggestions(state.step, input.value, content()));
  }

  async function finishChat(): Promise<void> {
    setDisabled(true);
    suggestionsEl.hidden = true;

    const result = await submitLead({
      name: state.nombre,
      email: state.email,
      budget: state.presupuesto,
      need: state.necesidad,
      projectDetail: state.proyectoDetalle,
      attachmentFile: state.attachment,
      attachmentFileName: state.attachment?.name,
    });

    if (result.ok) {
      state.step = 'done';
      addAssistantMessage(withName(content().thanks, state.nombre));
      updatePlaceholder();
      updateCharCounter();
      return;
    }

    state.step = 'budget';
    setDisabled(false);
    suggestionsEl.hidden = false;
    addAssistantMessage(content().submitError);
    updateSuggestions();
  }

  function handleSubmit(rawValue: string): void {
    const value = rawValue.trim();
    if (!value || state.step === 'done') return;

    const c = content();

    if (state.step === 'details' && value.length > c.projectDetailsMaxLength) {
      addAssistantMessage(c.projectDetailsTooLong);
      return;
    }

    addUserMessage(value);
    input.value = '';
    resetInputHeight();
    updateCharCounter();

    if (state.step === 'need') {
      state.necesidad = value;
      state.step = 'contact';
      addAssistantMessage(c.questionNameEmail);
      updatePlaceholder();
      updateSuggestions();
      return;
    }

    if (state.step === 'contact') {
      const parsed = parseNameEmail(value);
      if (!parsed) {
        const hint = c.suggestions.contact[0];
        if (hint) addAssistantMessage(hint);
        updateSuggestions();
        return;
      }
      state.nombre = parsed.name;
      state.email = parsed.email;
      state.step = 'details';
      addAssistantMessage(withName(c.questionProjectDetails, state.nombre));
      updatePlaceholder();
      updateSuggestions();
      updateCharCounter();
      return;
    }

    if (state.step === 'details') {
      state.proyectoDetalle = value;
      state.step = 'budget';
      addAssistantMessage(c.questionBudget);
      updatePlaceholder();
      updateSuggestions();
      updateCharCounter();
      return;
    }

    if (state.step === 'budget') {
      state.presupuesto = value;
      void finishChat();
    }
  }

  function focusChat(): void {
    chatWrap?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.setTimeout(() => {
      if (state.step !== 'done') input.focus({ preventScroll: true });
    }, 320);
  }

  attachBtn.addEventListener('click', () => {
    if (state.step === 'done') return;
    fileInput.click();
  });

  fileInput.addEventListener('change', () => {
    const file = fileInput.files?.[0];
    if (!file) return;

    const c = content();
    if (!isAllowedFile(file)) {
      addAssistantMessage(c.fileTypeInvalid);
      fileInput.value = '';
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      addAssistantMessage(c.fileTooLarge);
      fileInput.value = '';
      return;
    }

    state.attachment = file;
    renderFileBar();
  });

  fileRemoveBtn.addEventListener('click', () => {
    clearAttachment();
  });

  input.addEventListener('input', () => {
    resizeInput();
    updateCharCounter();
    updateSuggestions();
  });

  input.addEventListener('focus', updateSuggestions);

  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      form.requestSubmit();
    }
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    handleSubmit(input.value);
  });

  window.addEventListener('hashchange', () => {
    if (window.location.hash === '#hero-chat') focusChat();
  });

  document.querySelectorAll('a[href="#hero-chat"]').forEach((link) => {
    link.addEventListener('click', () => {
      window.setTimeout(focusChat, 80);
    });
  });

  if (window.location.hash === '#hero-chat') {
    window.setTimeout(focusChat, 400);
  }

  addAssistantMessage(content().questionProject);
  updatePlaceholder();
  renderFileBar();
  updateCharCounter();
  updateSuggestions();
}
