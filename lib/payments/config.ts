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

export const stripeEnabled = () => !!process.env.STRIPE_SECRET_KEY && !!process.env.STRIPE_WEBHOOK_SECRET;
export const paypalEnabled = () => !!process.env.PAYPAL_CLIENT_ID && !!process.env.PAYPAL_CLIENT_SECRET;

export const isMethodEnabled = (m: string): m is PayMethod =>
  m === 'check' || (m === 'stripe' && stripeEnabled()) || (m === 'paypal' && paypalEnabled());

/** The methods a customer can pick right now, in display order. */
export function enabledMethods(): PayMethod[] {
  return (['stripe', 'paypal', 'check'] as const).filter(isMethodEnabled);
}

export const paypalBase = () =>
  process.env.PAYPAL_ENV === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';
