import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';
import { adminCounts } from '@/lib/shop';

export const metadata = { title: 'Shop admin | JKA/AF', robots: { index: false } };

export default async function ShopAdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  const { pendingUsers, pendingApps, openOrders, lowStock } = await adminCounts();

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
