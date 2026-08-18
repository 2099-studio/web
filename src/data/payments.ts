/**
 * Checkout links for Investment "Buy Now" CTAs.
 * Replace placeholders with Mercado Pago / PayPal payment URLs when ready.
 */
export type InvestmentPlanId = 'local' | 'branding360' | 'ecosystem';

export const investmentCheckoutUrls: Record<InvestmentPlanId, string> = {
  local: '',
  branding360: '',
  ecosystem: '',
};

export function getInvestmentCheckoutUrl(planId: InvestmentPlanId): string {
  return investmentCheckoutUrls[planId] || '#investment';
}
