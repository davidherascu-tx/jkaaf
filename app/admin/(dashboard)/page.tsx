import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';
import { adminCounts } from '@/lib/shop';
import { Card } from '@/components/shop/ui';

export default async function AdminHome() {
  await requireAdmin();
  const c = await adminCounts();
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
