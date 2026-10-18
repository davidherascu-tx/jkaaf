import 'server-only';
import { query, queryOne, ts } from '@/lib/db';
import { getOrder, setPaymentReceived } from '@/lib/shop';
import { sendOrderCompletedEmail, sendPaymentReceivedEmail, sendRefundEmail } from '@/lib/customerEmails';
import { isMethodEnabled, type PayMethod } from '@/lib/payments/config';
import { createCheckoutSession, getCardDetails, refundPaymentIntent, retrieveCheckoutSession } from '@/lib/payments/stripe';
import { createPayPalOrder, refundCapture } from '@/lib/payments/paypal';

export interface Payment {
  id: number;
  order_id: number;
  provider: PayMethod;
  provider_ref: string;
  amount_cents: number;
  refunded_cents: number;
  card_brand: string;
  card_last4: string;
  created_at: string;
}

export interface Refund {
  id: number;
  payment_id: number;
  provider: string;
  provider_ref: string;
  amount_cents: number;
  reason: string;
  created_at: string;
}

const toPayment = (r: Record<string, unknown>): Payment => ({
  id: r.id as number,
  order_id: r.order_id as number,
  provider: r.provider as PayMethod,
  provider_ref: r.provider_ref as string,
  amount_cents: r.amount_cents as number,
  refunded_cents: r.refunded_cents as number,
  card_brand: (r.card_brand as string) ?? '',
  card_last4: (r.card_last4 as string) ?? '',
  created_at: ts(r.created_at as Date),
});

export async function listPayments(orderId: number): Promise<Payment[]> {
  return (await query('select * from payments where order_id = $1 order by id', [orderId])).map(toPayment);
}

export async function listRefunds(orderId: number): Promise<Refund[]> {
  return (await query('select * from refunds where order_id = $1 order by id', [orderId])).map((r) => ({
    id: r.id as number,
    payment_id: r.payment_id as number,
    provider: r.provider as string,
    provider_ref: r.provider_ref as string,
    amount_cents: r.amount_cents as number,
    reason: r.reason as string,
    created_at: ts(r.created_at as Date),
  }));
}

/** Webhook providers resend events. True the first time we see an event id, false for repeats. */
export async function firstTimeSeen(provider: string, eventId: string): Promise<boolean> {
  const r = await queryOne('insert into webhook_events (provider, event_id) values ($1, $2) on conflict do nothing returning event_id', [provider, eventId]);
  return !!r;
}

// ───────── Taking payment ─────────

/** Starts a card (Stripe) or PayPal payment for an unpaid order and returns the page to send the customer to. */
export async function startOnlinePayment(orderId: number, method: PayMethod, origin: string): Promise<{ url: string } | { error: string }> {
  if (method === 'check' || !isMethodEnabled(method)) return { error: 'That payment method is not available.' };
  const found = await getOrder(orderId);
  if (!found) return { error: 'Order not found.' };
  const { order, items } = found;
  if (order.status !== 'awaiting_payment') return { error: 'This order is not waiting for payment.' };
  try {
    const started =
      method === 'stripe'
        ? await createCheckoutSession(order, items, order.customer_email ?? '', origin)
        : await createPayPalOrder(order, origin);
    await query('update orders set payment_method = $2, provider_ref = $3 where id = $1', [orderId, method, started.id]);
    return { url: started.url };
  } catch (e) {
    console.error(`[payments] could not start ${method} payment for order ${orderId}:`, e);
    return { error: e instanceof Error ? e.message : 'Could not start the payment.' };
  }
}

/**
 * Records money received for an order (from a webhook or a PayPal return) and marks the order paid.
 * Safe to call many times for the same payment: the provider reference is unique, so it only counts once.
 */
export async function markOrderPaid(opts: { orderId: number; provider: 'stripe' | 'paypal'; providerRef: string; amountCents: number }): Promise<'recorded' | 'duplicate' | 'underpaid' | 'unknown_order'> {
  const found = await getOrder(opts.orderId);
  if (!found) return 'unknown_order';
  const { order } = found;

  const card = opts.provider === 'stripe' ? await getCardDetails(opts.providerRef) : null;
  const inserted = await queryOne(
    'insert into payments (order_id, provider, provider_ref, amount_cents, card_brand, card_last4) values ($1, $2, $3, $4, $5, $6) on conflict do nothing returning id',
    [opts.orderId, opts.provider, opts.providerRef, opts.amountCents, card?.brand ?? '', card?.last4 ?? ''],
  );
  if (!inserted) return 'duplicate';

  // The money is real, so it is recorded above even if something is off. Only mark paid when it covers the order.
  if (opts.amountCents < order.total_cents) {
    console.error(`[payments] order ${order.id} paid ${opts.amountCents} but total is ${order.total_cents}; not marked paid.`);
    return 'underpaid';
  }
  if (order.status === 'cancelled') {
    console.error(`[payments] order ${order.id} was cancelled but a payment arrived; refund it from the admin dashboard.`);
    return 'recorded';
  }
  await query('update orders set payment_method = $2 where id = $1', [order.id, opts.provider]);
  if (order.status === 'awaiting_payment') {
    await setPaymentReceived(order.id, true);
    await sendPaymentReceivedEmail(order.id);
    const now = await getOrder(order.id);
    if (now?.order.status === 'completed') await sendOrderCompletedEmail(order.id);
  }
  return 'recorded';
}

/**
 * Confirms a Stripe payment without a webhook: asks Stripe about the Checkout Session started for this order and,
 * if it was paid, marks the order paid. Safe to call on every visit to the order page (it only counts once).
 */
export async function confirmStripePayment(orderId: number): Promise<void> {
  if (!isMethodEnabled('stripe')) return;
  try {
    const row = await queryOne('select status, payment_method, provider_ref from orders where id = $1', [orderId]);
    const ref = (row?.provider_ref as string | null) ?? '';
    if (!row || row.status !== 'awaiting_payment' || row.payment_method !== 'stripe' || !ref.startsWith('cs_')) return;
    const session = await retrieveCheckoutSession(ref);
    const sessionOrder = Number(session.metadata?.order_id ?? session.client_reference_id);
    if (session.payment_status === 'paid' && sessionOrder === orderId && session.payment_intent) {
      await markOrderPaid({ orderId, provider: 'stripe', providerRef: session.payment_intent, amountCents: Number(session.amount_total) });
    }
  } catch (e) {
    console.error(`[payments] could not confirm Stripe payment for order ${orderId}:`, e);
  }
}

// ───────── Check payments (recorded by the admin) ─────────

/** Admin marked a check as received: record it so it can be refunded like any other payment. */
export async function recordCheckPayment(orderId: number) {
  const found = await getOrder(orderId);
  if (!found) return;
  await query(
    "insert into payments (order_id, provider, amount_cents) select $1, 'check', $2 where not exists (select 1 from payments where order_id = $1)",
    [orderId, found.order.total_cents],
  );
}

/** Admin undid "payment received": drop the check record, but only when nothing was refunded against it. */
export async function removeCheckPayment(orderId: number) {
  await query("delete from payments where order_id = $1 and provider = 'check' and refunded_cents = 0", [orderId]);
}

// ───────── Refunds ─────────

export type RefundResult = { ok: true; amountCents: number; provider: string } | { ok: false; error: string };

/**
 * Sends money back for one payment. Card and PayPal refunds go through the provider; a check refund is recorded
 * after the admin has mailed a check. The amount is reserved in the database first, so two clicks cannot refund twice.
 */
export async function refundPayment(opts: { orderId: number; paymentId: number; amountCents: number; reason: string; adminId: number }): Promise<RefundResult> {
  const { orderId, paymentId, amountCents, reason, adminId } = opts;
  if (!Number.isInteger(amountCents) || amountCents <= 0) return { ok: false, error: 'Enter an amount greater than zero.' };

  const row = await queryOne('select * from payments where id = $1 and order_id = $2', [paymentId, orderId]);
  if (!row) return { ok: false, error: 'Payment not found.' };
  const payment = toPayment(row);
  if (payment.provider !== 'check' && !isMethodEnabled(payment.provider)) {
    return { ok: false, error: `${payment.provider} is not set up, so this refund cannot be sent from here.` };
  }

  // Reserve the amount (fails when it is more than what is left to refund).
  const reserved = await queryOne(
    'update payments set refunded_cents = refunded_cents + $2 where id = $1 and refunded_cents + $2 <= amount_cents returning refunded_cents',
    [paymentId, amountCents],
  );
  if (!reserved) return { ok: false, error: 'That is more than what is left to refund for this payment.' };
  const alreadyRefunded = (reserved.refunded_cents as number) - amountCents;

  let providerRef = '';
  try {
    const key = `refund-${paymentId}-${alreadyRefunded}-${amountCents}`;
    if (payment.provider === 'stripe') providerRef = await refundPaymentIntent(payment.provider_ref, amountCents, orderId, reason, key);
    else if (payment.provider === 'paypal') providerRef = await refundCapture(payment.provider_ref, amountCents, reason, key);
  } catch (e) {
    await query('update payments set refunded_cents = refunded_cents - $2 where id = $1', [paymentId, amountCents]); // give the reservation back
    console.error(`[payments] refund failed for payment ${paymentId}:`, e);
    return { ok: false, error: e instanceof Error ? e.message : 'The refund could not be sent.' };
  }

  await query('insert into refunds (payment_id, order_id, provider, provider_ref, amount_cents, reason, created_by) values ($1, $2, $3, $4, $5, $6, $7)', [
    paymentId,
    orderId,
    payment.provider,
    providerRef,
    amountCents,
    reason.slice(0, 500),
    adminId,
  ]);
  await sendRefundEmail(orderId, amountCents, payment.provider);
  return { ok: true, amountCents, provider: payment.provider };
}

/**
 * A refund made outside this site (for example in the Stripe dashboard): bring our records in line.
 * `totalRefundedCents` is what the provider says has been refunded in total for that payment.
 */
export async function syncExternalRefund(provider: 'stripe' | 'paypal', providerRef: string, totalRefundedCents: number) {
  const row = await queryOne('select * from payments where provider = $1 and provider_ref = $2', [provider, providerRef]);
  if (!row) return;
  const payment = toPayment(row);
  const diff = Math.min(totalRefundedCents, payment.amount_cents) - payment.refunded_cents;
  if (diff <= 0) return;
  await query('update payments set refunded_cents = refunded_cents + $2 where id = $1', [payment.id, diff]);
  await query("insert into refunds (payment_id, order_id, provider, provider_ref, amount_cents, reason) values ($1, $2, $3, 'dashboard', $4, 'Refunded in the payment provider dashboard')", [
    payment.id,
    payment.order_id,
    provider,
    diff,
  ]);
  await sendRefundEmail(payment.order_id, diff, provider);
}

/** Money received for an order minus what was refunded. */
export async function netPaidCents(orderId: number): Promise<number> {
  const r = await queryOne('select coalesce(sum(amount_cents - refunded_cents), 0) as n from payments where order_id = $1', [orderId]);
  return Number(r?.n ?? 0);
}
