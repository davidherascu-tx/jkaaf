import Link from 'next/link';
import { ORDER_STATUS_LABEL } from '@/lib/shop';
import { shopStats } from '@/lib/shopAdmin';
import { formatCents } from '@/lib/money';
import { Badge, Card, primaryBtn, secondaryBtn } from '@/components/shop/ui';

export const metadata = { title: 'Shop | Admin dashboard' };

function Stat({ label, value, sub, href, alert }: { label: string; value: string | number; sub?: string; href?: string; alert?: boolean }) {
  const inner = (
    <Card className={`!p-5 h-full ${href ? 'hover:border-red-300 transition-colors' : ''}`}>
      <p className="text-xs font-bold uppercase tracking-wider text-gray-500">{label}</p>
      <p className={`mt-1 text-3xl font-extrabold ${alert ? 'text-red-600' : 'text-gray-900'}`}>{value}</p>
      {sub && <p className="mt-1 text-xs text-gray-500">{sub}</p>}
    </Card>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

export default async function ShopDashboard() {
  const s = await shopStats();
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-3xl font-extrabold text-gray-900">Shop</h1>
        <div className="flex gap-2">
          <Link href="/admin/shop/products/new" className={primaryBtn}>
            Add product
          </Link>
          <Link href="/admin/shop/orders" className={secondaryBtn}>
            All orders
          </Link>
        </div>
      </div>

      <section>
        <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-3">Sales (paid orders)</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Stat label="Today" value={formatCents(s.revenue.today)} />
          <Stat label="Last 7 days" value={formatCents(s.revenue.week)} />
          <Stat label="Last 30 days" value={formatCents(s.revenue.month)} />
          <Stat label="All time" value={formatCents(s.revenue.all)} />
        </div>
      </section>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Awaiting check" value={s.orders.awaiting} sub={`${formatCents(s.outstandingCents)} outstanding`} href="/admin/shop/orders?status=awaiting_payment" alert={s.orders.awaiting > 0} />
        <Stat label="Paid, to complete" value={s.orders.paid} href="/admin/shop/orders?status=paid" />
        <Stat label="Average order" value={formatCents(s.avgOrderCents)} sub={`${s.orders.total} orders in total`} />
        <Stat label="Customers" value={s.customers} href="/admin/shop/customers" />
      </section>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="!p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-900">Recent orders</h2>
            <Link href="/admin/shop/orders" className="text-sm font-semibold text-red-600 hover:underline">
              View all
            </Link>
          </div>
          {s.recent.length === 0 ? (
            <p className="text-sm text-gray-500">No orders yet.</p>
          ) : (
            <ul className="divide-y divide-gray-100 text-sm">
              {s.recent.map((o) => (
                <li key={o.id} className="py-2.5 flex items-center justify-between gap-3">
                  <span>
                    <Link href={`/admin/shop/orders/${o.id}`} className="font-semibold text-red-600 hover:underline">
                      #{o.id}
                    </Link>{' '}
                    <span className="text-gray-700">{o.customer_name}</span>
                    <span className="block text-xs text-gray-500">{o.created_at.slice(0, 16)}</span>
                  </span>
                  <span className="text-right">
                    <span className="font-semibold">{formatCents(o.total_cents)}</span>
                    <span className="block">
                      <Badge value={o.status} label={ORDER_STATUS_LABEL[o.status]} />
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <div className="space-y-6">
          <Card className="!p-5">
            <h2 className="font-bold text-gray-900 mb-3">Low or out of stock</h2>
            {s.lowStock.length === 0 ? (
              <p className="text-sm text-gray-500">All tracked products have enough stock.</p>
            ) : (
              <ul className="divide-y divide-gray-100 text-sm">
                {s.lowStock.map((p) => (
                  <li key={p.id} className="py-2 flex items-center justify-between gap-3">
                    <Link href={`/admin/shop/products/${p.id}`} className="font-semibold text-gray-900 hover:text-red-600">
                      {p.name}
                    </Link>
                    <span className={`text-xs font-bold ${p.stock <= 0 ? 'text-red-600' : 'text-amber-700'}`}>{p.stock <= 0 ? 'Out of stock' : `${p.stock} left`}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
          <Card className="!p-5">
            <h2 className="font-bold text-gray-900 mb-3">Best sellers</h2>
            {s.topProducts.length === 0 ? (
              <p className="text-sm text-gray-500">No sales yet.</p>
            ) : (
              <ul className="divide-y divide-gray-100 text-sm">
                {s.topProducts.map((p) => (
                  <li key={p.name} className="py-2 flex items-center justify-between gap-3">
                    <span className="text-gray-900">
                      {p.name}
                      <span className="block text-xs text-gray-500">{p.qty} sold</span>
                    </span>
                    <span className="font-semibold">{formatCents(p.cents)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
