import Link from 'next/link';
import { adminLogoutAction } from '@/app/account/actions';
import { requireAdmin } from '@/lib/auth';
import { adminCounts } from '@/lib/shop';
import AdminNav, { type NavGroup } from '@/components/admin/AdminNav';

export const metadata = { title: 'Admin dashboard | JKA/AF', robots: { index: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  const { pendingUsers, pendingApps, openOrders, lowStock } = await adminCounts();

  const groups: NavGroup[] = [
    { title: 'Overview', items: [{ href: '/admin', label: 'Home', exact: true }] },
    {
      title: 'Dojo & Members',
      items: [
        { href: '/admin/dojo', label: 'Overview', exact: true },
        { href: '/admin/dojo/applications', label: 'Applications', n: pendingApps },
        { href: '/admin/dojo/members', label: 'Members', n: pendingUsers },
      ],
    },
    {
      title: 'Shop',
      items: [
        { href: '/admin/shop', label: 'Dashboard', exact: true },
        { href: '/admin/shop/orders', label: 'Orders', n: openOrders },
        { href: '/admin/shop/customers', label: 'Customers' },
        { href: '/admin/shop/products', label: 'Products', n: lowStock },
        { href: '/admin/shop/reports', label: 'Reports' },
      ],
    },
  ];

  return (
    <div className="bg-gray-50 flex-1 w-full pt-28 md:pt-36 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full grid lg:grid-cols-[15rem_minmax(0,1fr)] gap-8 items-start">
        <aside className="lg:sticky lg:top-32 space-y-6">
          <p className="px-3 text-lg font-extrabold text-gray-900">Admin dashboard</p>
          <AdminNav groups={groups} />
          <div className="border-t border-gray-200 pt-4 px-3 space-y-2 text-sm">
            <p className="text-xs text-gray-500 truncate">{admin.email}</p>
            <Link href="/" className="block font-semibold text-gray-600 hover:text-red-600">
              View website
            </Link>
            <Link href="/studio" className="block font-semibold text-gray-600 hover:text-red-600">
              Studio (website content)
            </Link>
            <form action={adminLogoutAction}>
              <button className="font-semibold text-gray-600 hover:text-red-600 cursor-pointer">Sign out</button>
            </form>
          </div>
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
