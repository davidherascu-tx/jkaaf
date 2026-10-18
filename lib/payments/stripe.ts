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

/** Reads a Checkout Session back from Stripe (used to confirm a payment without a webhook). */
export async function retrieveCheckoutSession(sessionId: string) {
  const res = await fetch(`${API}/checkout/sessions/${encodeURIComponent(sessionId)}`, {
    headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}` },
    cache: 'no-store',
  });
  const data = (await res.json().catch(() => ({}))) as {
    error?: { message?: string };
    payment_status?: string;
    payment_intent?: string | null;
    amount_total?: number;
    metadata?: Record<string, string>;
    client_reference_id?: string | null;
  };
  if (!res.ok) throw new Error(data.error?.message || `Stripe error (${res.status})`);
  return data;
}

/** Brand and last four digits of the card behind a PaymentIntent. Best effort: returns null if Stripe does not say. */
export async function getCardDetails(paymentIntentId: string): Promise<{ brand: string; last4: string } | null> {
  try {
    const res = await fetch(`${API}/payment_intents/${encodeURIComponent(paymentIntentId)}?expand[]=latest_charge`, {
      headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}` },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { latest_charge?: { payment_method_details?: { card?: { brand?: string; last4?: string } } } | null };
    const card = data.latest_charge?.payment_method_details?.card;
    return card?.last4 && /^\d{4}$/.test(card.last4) ? { brand: card.brand ?? '', last4: card.last4 } : null;
  } catch {
    return null;
  }
}

/**
 * Starts a Stripe Checkout payment for an order. The amount always comes from our own order (never from the browser).
 * Returns the page to send the customer to; the order is marked paid later by the webhook.
 */
export async function createCheckoutSession(order: Order, items: OrderItem[], email: string, origin: string) {
  // Shipping is its own line on the Stripe page (the product line is the price without shipping).
  const lines = items.map((i) => ({ name: i.name, unit: i.unit_cents - i.ship_cents, qty: i.quantity }));
  const shippingTotal = items.reduce((n, i) => n + i.ship_cents * i.quantity, 0);
  if (shippingTotal > 0) lines.push({ name: 'Shipping', unit: shippingTotal, qty: 1 });
  const itemsTotal = lines.reduce((s, l) => s + l.unit * l.qty, 0);
  // Anything on top of the items (sales tax) becomes its own line so the Stripe total always equals the order total.
  const extra = order.total_cents - itemsTotal;
  if (extra > 0) lines.push({ name: 'Sales tax', unit: extra, qty: 1 });
  const useLines = extra >= 0 ? lines : [{ name: `JKA/AF order #${order.id}`, unit: order.total_cents, qty: 1 }];

  const session = await stripe<{ id: string; url: string }>(
    '/checkout/sessions',
    {
      mode: 'payment',
      // Plain card entry (Apple Pay / Google Pay still work). Stripe Link is left out because it does not reveal the card's last four digits.
      payment_method_types: ['card'],
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
