import Link from 'next/link';
import { notFound } from 'next/navigation';
import { setOrderStatusAction } from '@/app/shop-admin/actions';
import { getUserById } from '@/lib/auth';
import { getOrder, ORDER_STATUSES, ORDER_STATUS_LABEL } from '@/lib/shop';
import OrderView from '@/components/shop/OrderView';
import { Badge, Card, secondaryBtn } from '@/components/shop/ui';

export default async function AdminOrder({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const found = /^\d+$/.test(id) ? getOrder(Number(id)) : null;
  if (!found) notFound();
  const { order, items } = found;
  const member = getUserById(order.user_id);

  return (
    <div className="max-w-3xl space-y-5">
      <Link href="/shop-admin/orders" className="text-sm font-semibold text-gray-600 hover:text-red-600">
        ← All orders
      </Link>
      <Card className="!p-5">
        <p className="text-sm text-gray-700 mb-3">
          Customer: <strong>{order.customer_name}</strong> ({order.customer_email}) · Member account:{' '}
          {member && <Badge value={member.status} />}
          {member?.status === 'pending' && (
            <Link href="/shop-admin/members" className="ml-2 font-semibold text-red-600 hover:underline">
              Review
            </Link>
          )}
        </p>
        <div className="flex flex-wrap gap-2">
          {ORDER_STATUSES.map((s) => (
            <form key={s} action={setOrderStatusAction.bind(null, order.id, s)}>
              <button
                disabled={order.status === s}
                className={`${secondaryBtn} !py-1.5 text-sm disabled:!bg-red-600 disabled:!text-white disabled:!border-red-600`}
              >
                {ORDER_STATUS_LABEL[s]}
              </button>
            </form>
          ))}
        </div>
      </Card>
      <OrderView order={order} items={items} />
    </div>
  );
}
