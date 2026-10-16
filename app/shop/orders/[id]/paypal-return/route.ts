import { NextResponse, type NextRequest } from 'next/server';
import { getUser } from '@/lib/auth';
import { queryOne } from '@/lib/db';
import { markOrderPaid } from '@/lib/payments';
import { paypalEnabled } from '@/lib/payments/config';
import { capturePayPalOrder } from '@/lib/payments/paypal';
import { siteOrigin } from '@/lib/emailVerification';
import { getOrder } from '@/lib/shop';

export const dynamic = 'force-dynamic';

/**
 * The customer comes back here from PayPal after approving the payment. We take the money (capture) on the server.
 * Only the order's owner can do this, and the PayPal order id must be the one we started for this exact order.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const origin = await siteOrigin();
  const back = (query: string) => NextResponse.redirect(`${origin}/shop/orders/${id}${query}`);

  const user = await getUser();
  const found = /^\d+$/.test(id) ? await getOrder(Number(id)) : null;
  if (!user || !found || found.order.user_id !== user.id || !paypalEnabled()) return NextResponse.redirect(`${origin}/account/orders`);

  const token = request.nextUrl.searchParams.get('token') ?? '';
  const stored = (await queryOne('select provider_ref from orders where id = $1', [found.order.id]))?.provider_ref;
  if (!token || token !== stored) return back('?payerror=1');

  try {
    const cap = await capturePayPalOrder(token);
    if (cap.status !== 'COMPLETED' && cap.status !== 'PENDING') return back('?payerror=1');
    if (cap.status === 'COMPLETED') {
      await markOrderPaid({ orderId: found.order.id, provider: 'paypal', providerRef: cap.captureId, amountCents: cap.amountCents });
    }
    return back('?placed=1&paid=1');
  } catch (e) {
    console.error('[paypal return]', e);
    return back('?payerror=1');
  }
}
