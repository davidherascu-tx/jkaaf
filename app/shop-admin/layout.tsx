import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/lib/db';

export const metadata = { title: 'Shop admin | JKA/AF', robots: { index: false } };

const count = (sql: string) => Number((db().prepare(sql).get() as { n: number }).n);

export default async function ShopAdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  const pendingUsers = count("SELECT COUNT(*) AS n FROM users WHERE status = 'pending'");
  const pendingApps = count("SELECT COUNT(*) AS n FROM dojo_applications WHERE status = 'pending'");
  const lowStock = count('SELECT COUNT(*) AS n FROM products WHERE active = 1 AND stock IS NOT NULL AND stock <= 5');
  const openOrders = count("SELECT COUNT(*) AS n FROM orders WHERE status = 'awaiting_payment'");

  const tabs = [
    { href: '/shop-admin', label: 'Overview' },
    { href: '/shop-admin/orders', label: 'Orders', n: openOrders },
    { href: '/shop-admin/products', label: 'Products', n: lowStock },
    { href: '/shop-admin/members', label: 'Members', n: pendingUsers },
    { href: '/shop-admin/applications', label: 'Dojo applications', n: pendingApps },
  ];

  return (
    <div className="bg-gray-50 flex-1 w-full pt-28 md:pt-36 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <nav className="flex flex-wrap gap-2 mb-8" aria-label="Shop admin">
          {tabs.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className="px-4 py-2 rounded-full bg-white border border-gray-200 text-sm font-semibold text-gray-800 hover:border-red-400 hover:text-red-600 transition-colors"
            >
              {t.label}
              {!!t.n && <span className="ml-2 inline-block min-w-5 text-center rounded-full bg-red-600 text-white text-xs px-1.5 py-0.5">{t.n}</span>}
            </Link>
          ))}
        </nav>
        {children}
      </div>
    </div>
  );
}
