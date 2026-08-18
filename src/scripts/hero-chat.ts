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

function createUserMessage(text: string): HTMLElement {
  const msg = document.createElement('div');
  msg.className = 'hero-chat__msg hero-chat__msg--user';
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
  const promptTextEl = root.querySelector<HTMLElement>('[data-hero-chat-prompt-text]');
  const suggestionsEl = root.querySelector<HTMLElement>('[data-hero-chat-suggestions]');
  const suggestionsList = suggestionsEl?.querySelector<HTMLElement>('.hero-chat__suggestions-list');
  const form = root.querySelector<HTMLFormElement>('[data-hero-chat-form]');
  const input = root.querySelector<HTMLTextAreaElement>('[data-hero-chat-input]');

  if (!messagesEl || !promptTextEl || !suggestionsEl || !suggestionsList || !form || !input) return;

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

  function resetInputHeight(): void {
    input.style.height = 'auto';
  }

  function resizeInput(): void {
    resetInputHeight();
    input.style.height = `${input.scrollHeight}px`;
  }

  function setPrompt(text: string): void {
    promptTextEl.textContent = text;
  }

  function promptForStep(step: ChatStep): string {
    const c = content();
    if (step === 'project') return c.initialMessage;
    if (step === 'contact') return c.questionNameEmail;
    if (step === 'budget') return c.questionBudget;
    return '';
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
        form.requestSubmit();
      });
      suggestionsList.appendChild(chip);
    });
  }

  function addUserMessage(text: string): void {
    messagesEl.appendChild(createUserMessage(text));
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
  }

  function handleSubmit(rawValue: string): void {
    const value = rawValue.trim();
    if (!value || state.step === 'done') return;

    addUserMessage(value);
    input.value = '';
    resetInputHeight();

    if (state.step === 'project') {
      state.proyecto = value;
      state.step = 'contact';
      setPrompt(promptForStep('contact'));
      updateSuggestions();
      return;
    }

    if (state.step === 'contact') {
      const parsed = parseNameEmail(value);
      if (!parsed) {
        setPrompt(promptForStep('contact'));
        updateSuggestions();
        return;
      }
      state.nombre = parsed.name;
      state.email = parsed.email;
      state.step = 'budget';
      setPrompt(promptForStep('budget'));
      updateSuggestions();
      return;
    }

    if (state.step === 'budget') {
      state.presupuesto = value;
      state.step = 'done';
      setPrompt(content().thanks.replace('{name}', state.nombre));
      finishChat();

      submitLead({
        name: state.nombre,
        email: state.email,
        budget: state.presupuesto,
        message: state.proyecto,
      });
    }
  }

  input.addEventListener('input', () => {
    resizeInput();
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

  setPrompt(promptForStep('project'));
  updateSuggestions();
}
