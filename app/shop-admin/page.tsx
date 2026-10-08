import Link from 'next/link';
import { db } from '@/lib/db';
import { Card } from '@/components/shop/ui';

const count = (sql: string) => Number((db().prepare(sql).get() as { n: number }).n);

export default function AdminHome() {
  const stats = [
    { label: 'Orders awaiting check', n: count("SELECT COUNT(*) AS n FROM orders WHERE status = 'awaiting_payment'"), href: '/shop-admin/orders' },
    { label: 'Members awaiting approval', n: count("SELECT COUNT(*) AS n FROM users WHERE status = 'pending'"), href: '/shop-admin/members' },
    { label: 'Dojo applications to review', n: count("SELECT COUNT(*) AS n FROM dojo_applications WHERE status = 'pending'"), href: '/shop-admin/applications' },
    { label: 'Products low or out of stock', n: count('SELECT COUNT(*) AS n FROM products WHERE active = 1 AND stock IS NOT NULL AND stock <= 5'), href: '/shop-admin/products' },
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
