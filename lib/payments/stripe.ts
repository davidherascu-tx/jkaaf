import 'server-only';
import { formEncode } from '@/lib/payments/pure';
import type { Order, OrderItem } from '@/lib/shop';

// Stripe through its REST API (no extra package). Needs STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET.

const API = 'https://api.stripe.com/v1';

async function stripe<T>(path: string, params: Record<string, unknown>, idempotencyKey?: string): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}),
    },
    body: formEncode(params),
    cache: 'no-store',
  });
  const data = (await res.json().catch(() => ({}))) as { error?: { message?: string } } & T;
  if (!res.ok) throw new Error(data.error?.message || `Stripe error (${res.status})`);
  return data;
}

/**
 * Starts a Stripe Checkout payment for an order. The amount always comes from our own order (never from the browser).
 * Returns the page to send the customer to; the order is marked paid later by the webhook.
 */
export async function createCheckoutSession(order: Order, items: OrderItem[], email: string, origin: string) {
  const lines = items.map((i) => ({ name: i.name, unit: i.unit_cents, qty: i.quantity }));
  const itemsTotal = lines.reduce((s, l) => s + l.unit * l.qty, 0);
  // Anything on top of the items (sales tax) becomes its own line so the Stripe total always equals the order total.
  const extra = order.total_cents - itemsTotal;
  if (extra > 0) lines.push({ name: 'Sales tax', unit: extra, qty: 1 });
  const useLines = extra >= 0 ? lines : [{ name: `JKA/AF order #${order.id}`, unit: order.total_cents, qty: 1 }];

  const session = await stripe<{ id: string; url: string }>(
    '/checkout/sessions',
    {
      mode: 'payment',
      client_reference_id: String(order.id),
      customer_email: email,
      success_url: `${origin}/shop/orders/${order.id}?placed=1&paid=1`,
      cancel_url: `${origin}/shop/orders/${order.id}`,
      metadata: { order_id: order.id },
      payment_intent_data: { description: `JKA/AF order #${order.id}`, metadata: { order_id: order.id } },
      line_items: useLines.map((l) => ({
        quantity: l.qty,
        price_data: { currency: 'usd', unit_amount: l.unit, product_data: { name: l.name } },
      })),
    },
    `checkout-${order.id}-${order.total_cents}-${Date.now()}`,
  );
  if (!session.url) throw new Error('Stripe did not return a payment page.');
  return { id: session.id, url: session.url };
}

/** Sends money back for a PaymentIntent. The idempotency key makes a double click safe. */
export async function refundPaymentIntent(paymentIntentId: string, amountCents: number, orderId: number, note: string, idempotencyKey: string) {
  const r = await stripe<{ id: string }>(
    '/refunds',
    { payment_intent: paymentIntentId, amount: amountCents, reason: 'requested_by_customer', metadata: { order_id: orderId, note: note.slice(0, 400) } },
    idempotencyKey,
  );
  return r.id;
}
