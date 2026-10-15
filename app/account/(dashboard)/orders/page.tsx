import Link from 'next/link';
import { requireUser } from '@/lib/auth';
import { listOrders, ORDER_STATUS_LABEL, type Order } from '@/lib/shop';
import { formatCents } from '@/lib/money';
import { Badge, Card, primaryBtn, secondaryBtn } from '@/components/shop/ui';

export const metadata = { title: 'My orders | JKA/AF' };

const STEPS: { status: Order['status']; label: string }[] = [
  { status: 'awaiting_payment', label: 'Placed' },
  { status: 'paid', label: 'Paid' },
  { status: 'completed', label: 'Completed' },
];

function Tracker({ status }: { status: Order['status'] }) {
  if (status === 'cancelled') return <p className="text-sm font-semibold text-gray-500">This order was cancelled.</p>;
  const at = STEPS.findIndex((s) => s.status === status);
  return (
    <ol className="flex flex-wrap items-center gap-2 text-xs font-semibold" aria-label="Order progress">
      {STEPS.map((s, i) => (
        <li key={s.status} className="flex items-center gap-2">
          <span className={`flex items-center gap-1.5 ${i <= at ? 'text-green-700' : 'text-gray-400'}`}>
            <span className={`w-2.5 h-2.5 rounded-full ${i <= at ? 'bg-green-600' : 'bg-gray-300'}`} />
            {s.label}
          </span>
          {i < STEPS.length - 1 && <span className={`w-6 h-0.5 ${i < at ? 'bg-green-600' : 'bg-gray-200'}`} />}
        </li>
      ))}
    </ol>
  );
}

const SHIP_TONE: Record<string, string> = {
  'Not shipped': 'text-amber-700',
  'Partly shipped': 'text-blue-700',
  Shipped: 'text-blue-700',
  Delivered: 'text-green-700',
};

function ShippingText({ value }: { value: string }) {
  return <span className={SHIP_TONE[value] ?? 'text-gray-500'}>{value}</span>;
}

export default async function AccountOrdersPage() {
  const user = await requireUser('/account/orders');
  const orders = await listOrders(user.id);
  return (
    <>
      <h2 className="text-2xl font-extrabold text-gray-900">Orders</h2>
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
            <Card key={o.id} className="!p-5 hover:border-red-300 transition-colors">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Link href={`/shop/orders/${o.id}`} className="min-w-0">
                  <p className="font-bold text-gray-900 hover:text-red-600">Order #{o.id}</p>
                  <p className="text-sm text-gray-500">{o.created_at} UTC</p>
                </Link>
                <div className="flex items-center gap-4">
                  <Badge value={o.status} label={ORDER_STATUS_LABEL[o.status]} />
                  <span className="font-bold">{formatCents(o.total_cents)}</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
                <Tracker status={o.status} />
                {o.status !== 'cancelled' && (
                  <p className="text-sm font-semibold text-gray-700">
                    Shipping: <ShippingText value={o.shipping ?? ''} />
                  </p>
                )}
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link href={`/shop/orders/${o.id}`} className={secondaryBtn + ' !py-1.5 text-sm'}>
                  View order
                </Link>
                <a href={`/shop/orders/${o.id}/invoice`} className={secondaryBtn + ' !py-1.5 text-sm'}>
                  Download invoice
                </a>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
