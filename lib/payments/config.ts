import 'server-only';

// Payment methods the shop can offer. Check is always on. Card (Stripe) and PayPal switch on by themselves
// as soon as their keys are in .env.local (see .env.example), so nothing here needs editing when you are ready.

export type PayMethod = 'check' | 'stripe' | 'paypal';

export const METHOD_LABEL: Record<string, string> = {
  check: 'Check',
  stripe: 'Credit or debit card',
  paypal: 'PayPal',
};

/** Shorter text for sentences such as "Payment by ...". */
export const METHOD_SHORT: Record<string, string> = { check: 'check', stripe: 'card', paypal: 'PayPal' };

// Only the secret key is required. Payments are confirmed when the customer returns to the order page; a webhook
// (STRIPE_WEBHOOK_SECRET) is an optional extra that also catches customers who close the tab after paying.
export const stripeEnabled = () => !!process.env.STRIPE_SECRET_KEY;
export const stripeWebhookEnabled = () => stripeEnabled() && !!process.env.STRIPE_WEBHOOK_SECRET;
export const paypalEnabled = () => !!process.env.PAYPAL_CLIENT_ID && !!process.env.PAYPAL_CLIENT_SECRET;

export const isMethodEnabled = (m: string): m is PayMethod =>
  m === 'check' || (m === 'stripe' && stripeEnabled()) || (m === 'paypal' && paypalEnabled());

/** The methods a customer can pick right now, in display order. */
export function enabledMethods(): PayMethod[] {
  return (['stripe', 'paypal', 'check'] as const).filter(isMethodEnabled);
}

export const paypalBase = () =>
  process.env.PAYPAL_ENV === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';

const CARD_BRANDS: Record<string, string> = {
  visa: 'Visa', mastercard: 'Mastercard', amex: 'American Express', discover: 'Discover', diners: 'Diners Club', jcb: 'JCB', unionpay: 'UnionPay',
};
/** "Visa ending in 4242" (or "Card ending in 4242" when the brand is unknown). Empty when there is no card. */
export const cardLabel = (brand?: string | null, last4?: string | null) =>
  last4 ? `${CARD_BRANDS[(brand ?? '').toLowerCase()] ?? 'Card'} ending in ${last4}` : '';
