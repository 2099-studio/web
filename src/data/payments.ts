/**
 * Payment links for the Investment (pricing) cards.
 *
 * - mercadopago: Mercado Pago "Link de pago" in ARS (https://mpago.la/... or https://link.mercadopago.com.ar/...)
 * - nowpayments: NOWPayments payment link in ADA (https://nowpayments.io/payment/?iid=...)
 *
 * "Buy Now" opens a checkout modal (scripts/checkout.ts) to pick the method.
 * An empty link shows that method as "coming soon".
 */
export type InvestmentPlanId = 'local' | 'branding360' | 'ecosystem';
export type PaymentProvider = 'mercadopago' | 'nowpayments';

export const investmentPaymentLinks: Record<InvestmentPlanId, Record<PaymentProvider, string>> = {
  local: { mercadopago: 'https://mpago.li/1RFHzeK', nowpayments: '' },
  branding360: { mercadopago: 'https://mpago.li/2csWVBc', nowpayments: '' },
  ecosystem: { mercadopago: 'https://mpago.li/2WFkume', nowpayments: '' },
};

/** Interest-free installments configured on each Mercado Pago link. */
export const mercadoPagoInstallments: Record<InvestmentPlanId, number> = {
  local: 3,
  branding360: 3,
  ecosystem: 6,
};

/** Returns the provider link, or '' when it is not configured yet. */
export function getPaymentUrl(planId: InvestmentPlanId, provider: PaymentProvider): string {
  return investmentPaymentLinks[planId]?.[provider]?.trim() ?? '';
}

export function isExternalUrl(url: string): boolean {
  return /^https?:\/\//i.test(url);
}
