/**
 * Checkout modal for the Investment "Buy Now" buttons.
 * Each button carries the plan data and payment links as data-* attributes;
 * the modal lets the visitor pick Mercado Pago (ARS) or crypto (ADA) and
 * opens the chosen provider link in a new tab.
 */
type Provider = 'mercadopago' | 'nowpayments';
type LenisLike = { stop: () => void; start: () => void };

const PROVIDERS: Provider[] = ['mercadopago', 'nowpayments'];

export function initCheckout(): void {
  const root = document.querySelector<HTMLElement>('[data-checkout]');
  if (!root || root.dataset.ready) return;
  root.dataset.ready = 'true';

  // Escape pinned / transformed ancestors so position:fixed covers the viewport
  document.body.append(root);

  const panel = root.querySelector<HTMLElement>('.checkout__panel')!;
  const form = root.querySelector<HTMLFormElement>('[data-checkout-form]')!;
  const submit = root.querySelector<HTMLButtonElement>('[data-checkout-submit]')!;
  const radios = Array.from(form.querySelectorAll<HTMLInputElement>('input[name="checkout-method"]'));
  const text = (sel: string, value: string) => {
    const el = root.querySelector<HTMLElement>(sel);
    if (el) {
      el.textContent = value;
      el.hidden = !value;
    }
  };

  let urls: Record<Provider, string> = { mercadopago: '', nowpayments: '' };
  let opener: HTMLElement | null = null;
  let closeTimer = 0;

  const lenis = () => (window as Window & { __lenis?: LenisLike }).__lenis;

  const selected = (): Provider | null =>
    (radios.find((r) => r.checked)?.value as Provider | undefined) ?? null;

  const syncSubmit = () => {
    const provider = selected();
    submit.disabled = !provider || !urls[provider];
    if (provider) submit.textContent = submit.dataset[`label${provider === 'mercadopago' ? 'Mercadopago' : 'Nowpayments'}`] ?? '';
  };

  const open = (trigger: HTMLElement) => {
    const d = trigger.dataset;
    urls = { mercadopago: d.urlMercadopago ?? '', nowpayments: d.urlNowpayments ?? '' };

    text('[data-checkout-plan]', d.planName ?? '');
    text('[data-checkout-price]', d.planPrice ?? '');
    text('[data-checkout-ars]', d.planPriceArs ? `≈ ${d.planPriceArs}` : '');
    text('[data-checkout-line-name]', d.planName ?? '');
    text('[data-checkout-line-price]', d.planPrice ?? '');
    text('[data-checkout-total]', d.planPrice ?? '');
    text('[data-checkout-note]', d.planNote ?? '');

    radios.forEach((radio) => {
      const provider = radio.value as Provider;
      const available = Boolean(urls[provider]);
      radio.disabled = !available;
      radio.checked = false;
      const soon = root.querySelector<HTMLElement>(`[data-checkout-soon="${provider}"]`);
      if (soon) soon.hidden = available;
    });
    const first = PROVIDERS.find((p) => urls[p]);
    const firstRadio = radios.find((r) => r.value === first);
    if (firstRadio) firstRadio.checked = true;
    syncSubmit();

    opener = trigger;
    window.clearTimeout(closeTimer);
    root.hidden = false;
    document.documentElement.style.overflow = 'hidden';
    lenis()?.stop();
    void root.offsetWidth; // commit the hidden→visible change so the transition runs
    root.classList.add('is-open');
    (firstRadio ?? panel).focus({ preventScroll: true });
  };

  const close = () => {
    if (root.hidden) return;
    root.classList.remove('is-open');
    document.documentElement.style.overflow = '';
    lenis()?.start();
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    closeTimer = window.setTimeout(() => {
      root.hidden = true;
    }, reduced ? 0 : 260);
    opener?.focus({ preventScroll: true });
    opener = null;
  };

  document.querySelectorAll<HTMLElement>('[data-checkout-open]').forEach((trigger) => {
    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      open(trigger);
    });
  });

  root.querySelectorAll('[data-checkout-close]').forEach((el) => el.addEventListener('click', close));
  radios.forEach((radio) => radio.addEventListener('change', syncSubmit));

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const provider = selected();
    const url = provider ? urls[provider] : '';
    if (!url) return;
    window.open(url, '_blank', 'noopener,noreferrer');
    close();
  });

  document.addEventListener('keydown', (event) => {
    if (root.hidden) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
      return;
    }
    if (event.key !== 'Tab') return;
    // Keep focus inside the panel
    const focusable = Array.from(
      panel.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled)'),
    ).filter((el) => el.offsetParent !== null);
    // Radios share one tab stop
    const stops = focusable.filter(
      (el) => !(el instanceof HTMLInputElement && el.type === 'radio' && !el.checked),
    );
    if (!stops.length) return;
    const firstEl = stops[0];
    const lastEl = stops[stops.length - 1];
    if (event.shiftKey && document.activeElement === firstEl) {
      event.preventDefault();
      lastEl.focus();
    } else if (!event.shiftKey && document.activeElement === lastEl) {
      event.preventDefault();
      firstEl.focus();
    }
  });
}
