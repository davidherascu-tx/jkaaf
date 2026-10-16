import { firstTimeSeen, markOrderPaid, syncExternalRefund } from '@/lib/payments';
import { stripeEnabled } from '@/lib/payments/config';
import { verifyStripeSignature } from '@/lib/payments/pure';

export const dynamic = 'force-dynamic';

interface StripeEvent {
  id: string;
  type: string;
  data: { object: Record<string, unknown> };
}

/**
 * Stripe tells us here when a payment succeeded or a charge was refunded.
 * In the Stripe dashboard add a webhook endpoint  https://YOUR-SITE/api/webhooks/stripe  for the events
 * checkout.session.completed, checkout.session.async_payment_succeeded and charge.refunded,
 * and put its signing secret in STRIPE_WEBHOOK_SECRET.
 */
export async function POST(request: Request) {
  if (!stripeEnabled()) return new Response('Stripe is not set up.', { status: 404 });

  // The signature is calculated over the exact raw text, so read it as text (never parse before verifying).
  const raw = await request.text();
  if (raw.length > 1_000_000) return new Response('Too large', { status: 413 });
  if (!verifyStripeSignature(raw, request.headers.get('stripe-signature'), process.env.STRIPE_WEBHOOK_SECRET!)) {
    return new Response('Invalid signature', { status: 400 });
  }

  let event: StripeEvent;
  try {
    event = JSON.parse(raw) as StripeEvent;
  } catch {
    return new Response('Bad request', { status: 400 });
  }
  if (!(await firstTimeSeen('stripe', event.id))) return Response.json({ received: true, duplicate: true });

  try {
    const obj = event.data.object;
    if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
      const orderId = Number((obj.metadata as Record<string, string> | undefined)?.order_id ?? obj.client_reference_id);
      const paymentIntent = typeof obj.payment_intent === 'string' ? obj.payment_intent : '';
      if (obj.payment_status === 'paid' && Number.isInteger(orderId) && paymentIntent) {
        await markOrderPaid({ orderId, provider: 'stripe', providerRef: paymentIntent, amountCents: Number(obj.amount_total) });
      }
    } else if (event.type === 'charge.refunded') {
      const paymentIntent = typeof obj.payment_intent === 'string' ? obj.payment_intent : '';
      if (paymentIntent) await syncExternalRefund('stripe', paymentIntent, Number(obj.amount_refunded));
    }
  } catch (e) {
    // A non-2xx answer makes Stripe retry later, which is what we want for a temporary problem.
    console.error('[stripe webhook]', event.type, e);
    return new Response('Handler error', { status: 500 });
  }
  return Response.json({ received: true });
}
