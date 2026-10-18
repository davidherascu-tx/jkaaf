import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';
import { adminCounts, ORDER_STATUS_LABEL } from '@/lib/shop';
import { listOrdersAdmin } from '@/lib/shopAdmin';
import { listPendingRequests, REQUEST_LABEL } from '@/lib/orderRequests';
import { formatCents } from '@/lib/money';
import { Badge, Card } from '@/components/shop/ui';

export default async function AdminHome() {
  await requireAdmin();
  const [c, paid, unpaid, requests] = await Promise.all([
    adminCounts(),
    listOrdersAdmin({ status: 'paid', limit: 8 }),
    listOrdersAdmin({ status: 'awaiting_payment', limit: 8 }),
    listPendingRequests(),
  ]);
  // New orders = paid but not finished yet, plus orders still waiting for payment. Newest first.
  const newOrders = [...paid, ...unpaid].sort((a, b) => b.id - a.id).slice(0, 8);
  const areas = [
    {
      href: '/admin/dojo',
      title: 'Dojo & Members',
      text: 'Review Dojo Membership applications and approve member accounts.',
      stats: [
        { label: 'Applications to review', n: c.pendingApps },
        { label: 'Members awaiting approval', n: c.pendingUsers },
      ],
    },
    {
      href: '/admin/shop',
      title: 'Shop',
      text: 'Orders, customers, products, stock and sales reports.',
      stats: [
        { label: 'Orders awaiting check', n: c.openOrders },
        { label: 'Products low or out of stock', n: c.lowStock },
      ],
    },
  ];
  return (
    <>
      <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Dashboard</h1>
      <p className="text-gray-600 mb-8">Choose what you want to manage.</p>

      {requests.length > 0 && (
        <Card className="!p-0 mb-8 overflow-hidden !border-amber-300">
          <div className="px-5 py-4 border-b border-amber-100 bg-amber-50">
            <h2 className="text-lg font-extrabold text-gray-900">
              Customer requests{' '}
              <span className="ml-1 rounded-full bg-amber-500 text-white text-xs font-bold px-2 py-0.5 align-middle">{requests.length}</span>
            </h2>
            <p className="text-xs text-gray-600">Cancel, return and refund requests waiting for you.</p>
          </div>
          <ul className="divide-y divide-gray-100">
            {requests.map((r) => (
              <li key={r.id}>
                <Link href={`/admin/shop/orders/${r.order_id}`} className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 px-5 py-3 hover:bg-gray-50">
                  <span className="font-semibold text-red-600">#{r.order_id}</span>
                  <span className="flex-1 min-w-40 text-sm text-gray-800">
                    {r.customer_name}
                    <span className="block text-xs text-gray-500">{r.created_at} UTC</span>
                  </span>
                  <span className="text-sm font-semibold text-gray-900">{REQUEST_LABEL[r.type]}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card className="!p-0 mb-8 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-4 border-b border-gray-100">
          <h2 className="text-lg font-extrabold text-gray-900">
            New orders{' '}
            {newOrders.length > 0 && <span className="ml-1 rounded-full bg-red-600 text-white text-xs font-bold px-2 py-0.5 align-middle">{newOrders.length}</span>}
          </h2>
          <Link href="/admin/shop/orders" className="text-sm font-semibold text-red-600 hover:underline">
            All orders &rarr;
          </Link>
        </div>
        {newOrders.length === 0 ? (
          <p className="px-5 py-6 text-sm text-gray-500">No new orders right now.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {newOrders.map((o) => (
              <li key={o.id}>
                <Link href={`/admin/shop/orders/${o.id}`} className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 px-5 py-3 hover:bg-gray-50">
                  <span className="font-semibold text-red-600">#{o.id}</span>
                  <span className="flex-1 min-w-40 text-sm text-gray-800">
                    {o.customer_name}
                    <span className="block text-xs text-gray-500">{o.created_at} UTC</span>
                  </span>
                  <span className="text-sm font-semibold text-gray-900">{formatCents(o.total_cents)}</span>
                  <Badge value={o.status} label={ORDER_STATUS_LABEL[o.status]} />
                  <span className="text-sm text-gray-600">{o.shipping}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {areas.map((a) => (
          <Link key={a.href} href={a.href} className="group">
            <Card className="!p-7 h-full group-hover:border-red-300 transition-colors">
              <h2 className="text-xl font-extrabold text-gray-900 group-hover:text-red-600">{a.title}</h2>
              <p className="mt-1 text-sm text-gray-600">{a.text}</p>
              <div className="mt-6 grid grid-cols-2 gap-4">
                {a.stats.map((s) => (
                  <div key={s.label}>
                    <p className={`text-4xl font-extrabold ${s.n ? 'text-red-600' : 'text-gray-300'}`}>{s.n}</p>
                    <p className="text-xs font-semibold text-gray-600 mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </>
  );
}
