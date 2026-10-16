import 'server-only';
import { paypalBase } from '@/lib/payments/config';
import { centsToDecimal } from '@/lib/payments/pure';
import type { Order } from '@/lib/shop';

// PayPal Orders v2 through its REST API (no extra package).
// Needs PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET; PAYPAL_ENV=live for real money (default is the sandbox).
// PAYPAL_WEBHOOK_ID is optional but recommended: it lets PayPal confirm payments even if the customer closes the tab.

async function accessToken(): Promise<string> {
  const basic = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString('base64');
  const res = await fetch(`${paypalBase()}/v1/oauth2/token`, {
    method: 'POST',
    headers: { Authorization: `Basic ${basic}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=client_credentials',
    cache: 'no-store',
  });
  const data = (await res.json().catch(() => ({}))) as { access_token?: string };
  if (!res.ok || !data.access_token) throw new Error('Could not sign in to PayPal.');
  return data.access_token;
}

async function paypal<T>(path: string, body: unknown, requestId?: string): Promise<T> {
  const res = await fetch(`${paypalBase()}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${await accessToken()}`,
      'Content-Type': 'application/json',
      ...(requestId ? { 'PayPal-Request-Id': requestId } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: 'no-store',
  });
  const data = (await res.json().catch(() => ({}))) as { message?: string; details?: { description?: string }[] } & T;
  if (!res.ok) throw new Error(data.details?.[0]?.description || data.message || `PayPal error (${res.status})`);
  return data;
}

/** Creates a PayPal order for our order total and returns the PayPal page to send the customer to. */
export async function createPayPalOrder(order: Order, origin: string) {
  const data = await paypal<{ id: string; links: { rel: string; href: string }[] }>(
    '/v2/checkout/orders',
    {
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: `order-${order.id}`,
          custom_id: String(order.id),
          description: `JKA/AF order #${order.id}`,
          amount: { currency_code: 'USD', value: centsToDecimal(order.total_cents) },
        },
      ],
      payment_source: {
        paypal: {
          experience_context: {
            brand_name: 'JKA/AF',
            user_action: 'PAY_NOW',
            shipping_preference: 'NO_SHIPPING',
            return_url: `${origin}/shop/orders/${order.id}/paypal-return`,
            cancel_url: `${origin}/shop/orders/${order.id}`,
          },
        },
      },
    },
    `create-${order.id}-${order.total_cents}-${Date.now()}`,
  );
  const url = data.links.find((l) => l.rel === 'payer-action' || l.rel === 'approve')?.href;
  if (!url) throw new Error('PayPal did not return a payment page.');
  return { id: data.id, url };
}

export interface PayPalCapture {
  captureId: string;
  amountCents: number;
  status: string;
  orderId: number | null;
}

/** Takes the money after the customer approved it at PayPal. Safe to call twice (same request id). */
export async function capturePayPalOrder(paypalOrderId: string): Promise<PayPalCapture> {
  const data = await paypal<{
    purchase_units?: { custom_id?: string; payments?: { captures?: { id: string; status: string; amount: { value: string } }[] } }[];
  }>(`/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}/capture`, undefined, `capture-${paypalOrderId}`);
  const unit = data.purchase_units?.[0];
  const cap = unit?.payments?.captures?.[0];
  if (!cap) throw new Error('PayPal did not confirm the payment.');
  return {
    captureId: cap.id,
    amountCents: Math.round(Number(cap.amount.value) * 100),
    status: cap.status,
    orderId: unit?.custom_id && /^\d+$/.test(unit.custom_id) ? Number(unit.custom_id) : null,
  };
}

export async function refundCapture(captureId: string, amountCents: number, note: string, requestId: string) {
  const r = await paypal<{ id: string }>(
    `/v2/payments/captures/${encodeURIComponent(captureId)}/refund`,
    { amount: { currency_code: 'USD', value: centsToDecimal(amountCents) }, note_to_payer: note.slice(0, 255) || undefined },
    requestId,
  );
  return r.id;
}

/** Asks PayPal whether a webhook really came from PayPal. */
export async function verifyPayPalWebhook(headers: Headers, event: unknown): Promise<boolean> {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) return false;
  const h = (n: string) => headers.get(n) ?? '';
  try {
    const r = await paypal<{ verification_status?: string }>('/v1/notifications/verify-webhook-signature', {
      auth_algo: h('paypal-auth-algo'),
      cert_url: h('paypal-cert-url'),
      transmission_id: h('paypal-transmission-id'),
      transmission_sig: h('paypal-transmission-sig'),
      transmission_time: h('paypal-transmission-time'),
      webhook_id: webhookId,
      webhook_event: event,
    });
    return r.verification_status === 'SUCCESS';
  } catch {
    return false;
  }
}
