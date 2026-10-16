import Link from 'next/link';
import { logoutAction } from '@/app/account/actions';
import { requireAdmin } from '@/lib/auth';
import { adminCounts } from '@/lib/shop';
import AdminNav, { type NavGroup } from '@/components/admin/AdminNav';

export const metadata = { title: 'Admin dashboard | JKA/AF', robots: { index: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  const { pendingUsers, pendingApps, openOrders, lowStock } = await adminCounts();

  // Email, shortcuts and sign out: under the sidebar on desktop, at the bottom of the menu on phones.
  const account = (spacing: string) => (
    <div className={`${spacing} text-sm`}>
      <p className="text-xs text-gray-500 truncate">{admin.email}</p>
      <Link href="/" className="block py-1.5 font-semibold text-gray-600 hover:text-red-600">
        View website
      </Link>
      <Link href="/studio" className="block py-1.5 font-semibold text-gray-600 hover:text-red-600">
        Studio (website content)
      </Link>
      <form action={logoutAction}>
        <button className="py-1.5 font-semibold text-gray-600 hover:text-red-600 cursor-pointer">Sign out</button>
      </form>
    </div>
  );

  const groups: NavGroup[] = [
    { title: 'Overview', items: [{ href: '/admin', label: 'Home', exact: true, icon: 'M3 12l9-8 9 8M5 10v10h5v-6h4v6h5V10' }] },
    {
      title: 'Dojo & Members',
      items: [
        { href: '/admin/dojo', label: 'Overview', exact: true, icon: 'M4 21V8l8-5 8 5v13M9 21v-6h6v6' },
        { href: '/admin/dojo/applications', label: 'Applications', n: pendingApps, icon: 'M9 12h6M9 16h6M7 3h7l5 5v13H7zM14 3v5h5' },
        { href: '/admin/dojo/members', label: 'Members', n: pendingUsers, icon: 'M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM21 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75' },
      ],
    },
    {
      title: 'Shop',
      items: [
        { href: '/admin/shop', label: 'Shop dashboard', exact: true, icon: 'M3 3v18h18M7 14l4-4 3 3 5-6' },
        { href: '/admin/shop/orders', label: 'Orders', n: openOrders, icon: 'M6 2l-2 4v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6l-2-4zM4 6h16M16 10a4 4 0 0 1-8 0' },
        { href: '/admin/shop/subscriptions', label: 'Subscriptions', icon: 'M17 1l4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3' },
        { href: '/admin/shop/customers', label: 'Customers', icon: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z' },
        { href: '/admin/shop/products', label: 'Products', n: lowStock, icon: 'M21 8l-9-5-9 5 9 5 9-5zM3 8v8l9 5 9-5V8M12 13v8' },
        { href: '/admin/shop/reports', label: 'Reports', icon: 'M5 20V10M12 20V4M19 20v-7' },
      ],
    },
    {
      title: 'System',
      items: [{ href: '/admin/backup', label: 'Backup & restore', icon: 'M12 3v12M7 10l5 5 5-5M4 21h16' }],
    },
  ];

  return (
    <div className="bg-gray-50 flex-1 w-full pt-28 md:pt-36 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full grid grid-cols-1 lg:grid-cols-[15rem_minmax(0,1fr)] gap-8 items-start">
        <aside className="lg:sticky lg:top-32 space-y-6">
          <p className="hidden lg:block px-1 text-lg font-extrabold text-gray-900">Admin dashboard</p>
          <AdminNav groups={groups} mobileFooter={account('space-y-1')} />
          <div className="hidden lg:block bg-white rounded-2xl border border-gray-200 shadow-sm px-4 py-3">{account('space-y-1')}</div>
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
