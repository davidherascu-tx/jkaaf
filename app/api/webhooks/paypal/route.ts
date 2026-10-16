import { firstTimeSeen, markOrderPaid } from '@/lib/payments';
import { paypalEnabled } from '@/lib/payments/config';
import { verifyPayPalWebhook } from '@/lib/payments/paypal';
import { decimalToCents } from '@/lib/payments/pure';

export const dynamic = 'force-dynamic';

interface PayPalEvent {
  id: string;
  event_type: string;
  resource: { id?: string; status?: string; custom_id?: string; amount?: { value?: string } };
}

/**
 * PayPal tells us here when a payment was captured, even if the customer closed the browser before coming back.
 * In the PayPal developer dashboard add a webhook  https://YOUR-SITE/api/webhooks/paypal  for PAYMENT.CAPTURE.COMPLETED
 * and put its Webhook ID in PAYPAL_WEBHOOK_ID.
 */
export async function POST(request: Request) {
  if (!paypalEnabled()) return new Response('PayPal is not set up.', { status: 404 });

  const raw = await request.text();
  if (raw.length > 1_000_000) return new Response('Too large', { status: 413 });
  let event: PayPalEvent;
  try {
    event = JSON.parse(raw) as PayPalEvent;
  } catch {
    return new Response('Bad request', { status: 400 });
  }
  // PayPal confirms the sender for us; anything it does not confirm is ignored.
  if (!(await verifyPayPalWebhook(request.headers, event))) return new Response('Invalid signature', { status: 400 });
  if (!(await firstTimeSeen('paypal', event.id))) return Response.json({ received: true, duplicate: true });

  try {
    if (event.event_type === 'PAYMENT.CAPTURE.COMPLETED' && event.resource.id && event.resource.custom_id && /^\d+$/.test(event.resource.custom_id)) {
      await markOrderPaid({
        orderId: Number(event.resource.custom_id),
        provider: 'paypal',
        providerRef: event.resource.id,
        amountCents: decimalToCents(event.resource.amount?.value ?? '0'),
      });
    }
  } catch (e) {
    console.error('[paypal webhook]', event.event_type, e);
    return new Response('Handler error', { status: 500 });
  }
  return Response.json({ received: true });
}
