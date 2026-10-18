import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireUser } from '@/lib/auth';
import { getOrder } from '@/lib/shop';
import { formatCents } from '@/lib/money';
import OrderView from '@/components/shop/OrderView';
import OrderRequests from '@/components/shop/OrderRequests';
import { listOrderRequests, orderActions } from '@/lib/orderRequests';
import { Notice, PageShell, primaryBtn, secondaryBtn } from '@/components/shop/ui';
import { enabledMethods, METHOD_LABEL } from '@/lib/payments/config';
import { payNowAction } from '@/app/shop/actions';
import { confirmStripePayment } from '@/lib/payments';

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ placed?: string; paid?: string; payerror?: string }>;
}) {
  const { id } = await params;
  const { placed, paid, payerror } = await searchParams;
  const user = await requireUser(`/shop/orders/${id}`);
  // No webhook needed: ask Stripe whether this order's card payment went through (only counts once).
  if (/^\d+$/.test(id)) await confirmStripePayment(Number(id));
  const found = /^\d+$/.test(id) ? await getOrder(Number(id)) : null;
  // Customers can only see their own orders; admins can see all.
  if (!found || (found.order.user_id !== user.id && user.role !== 'admin')) notFound();
  const { order, items } = found;

  const requests = await listOrderRequests(order.id);
  const actions = orderActions(order, items, requests.some((r) => r.status === 'pending'));
  const isOwner = order.user_id === user.id;

  const payableTo = process.env.CHECK_PAYABLE_TO || 'JKA/AF';
  const mailTo = process.env.CHECK_MAIL_TO || 'Please contact JKA/AF for the mailing address.';

  return (
    <PageShell title={placed ? 'Thank you! Order placed' : `Order #${order.id}`}>
      <div className="space-y-5">
        {payerror && (
          <Notice tone="warn">We could not complete the online payment. Nothing was charged. You can try again below, or pay by check.</Notice>
        )}
        {paid && order.status === 'awaiting_payment' && !payerror && (
          <Notice tone="ok">Thank you! We are confirming your payment. This page updates as soon as it is confirmed, and you will get an email.</Notice>
        )}
        {order.status === 'awaiting_payment' && order.payment_method === 'check' && (
          <Notice tone="warn">
            <p className="font-bold mb-1">Pay by check — {formatCents(order.total_cents)}</p>
            <p>Make the check payable to: <strong>{payableTo}</strong></p>
            <p>Mail to: <strong className="whitespace-pre-line">{mailTo}</strong></p>
            <p>Write “Order #{order.id}” on the memo line. Your order is processed once the check is received.</p>
          </Notice>
        )}
        {order.status === 'awaiting_payment' && enabledMethods().some((m) => m !== 'check') && (
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-semibold text-gray-700">{order.payment_method === 'check' ? 'Or pay online:' : 'Pay now:'}</span>
            {enabledMethods()
              .filter((m) => m !== 'check')
              .map((m) => (
                <form key={m} action={payNowAction.bind(null, order.id, m)}>
                  <button className={primaryBtn}>{METHOD_LABEL[m]}</button>
                </form>
              ))}
          </div>
        )}
        <OrderView order={order} items={items} />
        {isOwner && <OrderRequests orderId={order.id} actions={actions} requests={requests} />}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/account/orders" className="text-sm font-semibold text-gray-600 hover:text-red-600">
            ← All orders
          </Link>
          <a href={`/shop/orders/${order.id}/invoice`} className={secondaryBtn}>
            Download invoice (PDF)
          </a>
        </div>
      </div>
    </PageShell>
  );
}
