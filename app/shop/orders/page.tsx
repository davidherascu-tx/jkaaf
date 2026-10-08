import Link from 'next/link';
import { requireUser } from '@/lib/auth';
import { listOrders, ORDER_STATUS_LABEL } from '@/lib/shop';
import { formatCents } from '@/lib/money';
import { Badge, Card, PageShell, primaryBtn } from '@/components/shop/ui';

export const metadata = { title: 'My orders | JKA/AF' };

export default async function OrdersPage() {
  const user = await requireUser('/shop/orders');
  const orders = await listOrders(user.id);
  return (
    <PageShell title="My orders">
      {orders.length === 0 ? (
        <Card>
          <p className="text-gray-600 mb-4">You have not placed any orders yet.</p>
          <Link href="/shop" className={primaryBtn}>
            Browse the shop
          </Link>
        </Card>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <Link key={o.id} href={`/shop/orders/${o.id}`} className="block">
              <Card className="!p-5 hover:border-red-300 transition-colors flex items-center justify-between gap-4">
                <div>
                  <p className="font-bold text-gray-900">Order #{o.id}</p>
                  <p className="text-sm text-gray-500">{o.created_at} UTC</p>
                </div>
                <div className="flex items-center gap-4">
                  <Badge value={o.status} label={ORDER_STATUS_LABEL[o.status]} />
                  <span className="font-bold">{formatCents(o.total_cents)}</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </PageShell>
  );
}
