import { getContent } from '../i18n';
import type { SiteContent } from '../i18n/types';
import { getLocale } from './locale';
import { submitLead } from './submit-lead';

type ChatStep = 'project' | 'contact' | 'budget' | 'done';

interface ChatState {
  step: ChatStep;
  proyecto: string;
  nombre: string;
  email: string;
  presupuesto: string;
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

function getProjectSuggestions(input: string, suggestions: SiteContent['heroChat']['suggestions']['project']): string[] {
  const value = normalize(input);
  if (!value) return suggestions.default;
  if (value.includes('landing')) return suggestions.landing;
  if (value.includes('logo') || value.includes('marca') || value.includes('brand')) return suggestions.brand;
  if (value.includes('video')) return suggestions.video;
  if (value.includes('app')) return suggestions.app;
  if (value.includes('plan') || value.includes('todo') || value.includes('full')) return suggestions.plan;
  return suggestions.default;
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
  if (step === 'project') return getProjectSuggestions(input, chat.suggestions.project);
  if (step === 'contact' && input.trim().length > 0) return chat.suggestions.contact;
  if (step === 'budget') return getBudgetSuggestions(input, chat.suggestions.budget);
  return [];
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
  const root = document.querySelector<HTMLElement>('[data-hero-chat]');
  if (!root) return;

  const messagesEl = root.querySelector<HTMLElement>('[data-hero-chat-messages]');
  const suggestionsEl = root.querySelector<HTMLElement>('[data-hero-chat-suggestions]');
  const form = root.querySelector<HTMLFormElement>('[data-hero-chat-form]');
  const input = root.querySelector<HTMLInputElement>('[data-hero-chat-input]');

  if (!messagesEl || !suggestionsEl || !form || !input) return;

  const state: ChatState = {
    step: 'project',
    proyecto: '',
    nombre: '',
    email: '',
    presupuesto: '',
  };

  function content(): SiteContent['heroChat'] {
    return getContent(getLocale()).heroChat;
  }

  function renderSuggestions(items: string[]): void {
    suggestionsEl.replaceChildren();
    if (state.step === 'done' || items.length === 0) {
      suggestionsEl.hidden = true;
      return;
    }

    suggestionsEl.hidden = false;
    const label = document.createElement('span');
    label.className = 'hero-chat__suggestions-label';
    label.textContent = content().suggestionsLabel;
    suggestionsEl.appendChild(label);

    const list = document.createElement('div');
    list.className = 'hero-chat__suggestions-list';
    items.forEach((item) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'hero-chat__chip';
      chip.textContent = item;
      chip.addEventListener('click', () => {
        input.value = item;
        form.requestSubmit();
      });
      list.appendChild(chip);
    });
    suggestionsEl.appendChild(list);
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

  function finishChat(): void {
    state.step = 'done';
    input.disabled = true;
    form.querySelector<HTMLButtonElement>('button[type="submit"]')?.setAttribute('disabled', 'true');
    suggestionsEl.hidden = true;

    submitLead({
      name: state.nombre,
      email: state.email,
      budget: state.presupuesto,
      message: state.proyecto,
    });
  }

  function handleSubmit(rawValue: string): void {
    const value = rawValue.trim();
    if (!value || state.step === 'done') return;

    addUserMessage(value);
    input.value = '';

    if (state.step === 'project') {
      state.proyecto = value;
      state.step = 'contact';
      addAssistantMessage(content().questionNameEmail);
      updateSuggestions();
      return;
    }

    if (state.step === 'contact') {
      const parsed = parseNameEmail(value);
      if (!parsed) {
        addAssistantMessage(content().questionNameEmail);
        updateSuggestions();
        return;
      }
      state.nombre = parsed.name;
      state.email = parsed.email;
      state.step = 'budget';
      addAssistantMessage(content().questionBudget);
      updateSuggestions();
      return;
    }

    if (state.step === 'budget') {
      state.presupuesto = value;
      state.step = 'done';
      const thanks = content().thanks.replace('{name}', state.nombre);
      addAssistantMessage(thanks);
      finishChat();
    }
  }

  input.addEventListener('input', updateSuggestions);
  input.addEventListener('focus', updateSuggestions);

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    handleSubmit(input.value);
  });

  updateSuggestions();
}
