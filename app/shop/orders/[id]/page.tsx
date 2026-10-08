import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireUser } from '@/lib/auth';
import { getOrder } from '@/lib/shop';
import { formatCents } from '@/lib/money';
import OrderView from '@/components/shop/OrderView';
import { Notice, PageShell } from '@/components/shop/ui';

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ placed?: string }>;
}) {
  const { id } = await params;
  const { placed } = await searchParams;
  const user = await requireUser(`/shop/orders/${id}`);
  const found = /^\d+$/.test(id) ? getOrder(Number(id)) : null;
  // Customers can only see their own orders; admins can see all.
  if (!found || (found.order.user_id !== user.id && user.role !== 'admin')) notFound();
  const { order, items } = found;

  const payableTo = process.env.CHECK_PAYABLE_TO || 'JKA/AF';
  const mailTo = process.env.CHECK_MAIL_TO || 'Please contact JKA/AF for the mailing address.';

  return (
    <PageShell title={placed ? 'Thank you! Order placed' : `Order #${order.id}`}>
      <div className="space-y-5">
        {order.status === 'awaiting_payment' && (
          <Notice tone="warn">
            <p className="font-bold mb-1">Pay by check — {formatCents(order.total_cents)}</p>
            <p>Make the check payable to: <strong>{payableTo}</strong></p>
            <p>Mail to: <strong className="whitespace-pre-line">{mailTo}</strong></p>
            <p>Write “Order #{order.id}” on the memo line. Your order is processed once the check is received.</p>
          </Notice>
        )}
        <OrderView order={order} items={items} />
        <Link href="/shop/orders" className="inline-block text-sm font-semibold text-gray-600 hover:text-red-600">
          ← All orders
        </Link>
      </div>
    </PageShell>
  );
}
