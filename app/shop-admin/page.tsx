import Link from 'next/link';
import { adminCounts } from '@/lib/shop';
import { Card } from '@/components/shop/ui';

export default async function AdminHome() {
  const c = await adminCounts();
  const stats = [
    { label: 'Orders awaiting check', n: c.openOrders, href: '/shop-admin/orders' },
    { label: 'Members awaiting approval', n: c.pendingUsers, href: '/shop-admin/members' },
    { label: 'Dojo applications to review', n: c.pendingApps, href: '/shop-admin/applications' },
    { label: 'Products low or out of stock', n: c.lowStock, href: '/shop-admin/products' },
  ];
  return (
    <>
      <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Shop admin</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href}>
            <Card className="!p-5 hover:border-red-300 transition-colors">
              <p className="text-4xl font-extrabold text-red-600">{s.n}</p>
              <p className="text-sm font-semibold text-gray-700 mt-1">{s.label}</p>
            </Card>
          </Link>
        ))}
      </div>
    </>
  );
}
