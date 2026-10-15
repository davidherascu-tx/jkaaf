import Link from 'next/link';
import { adminCounts, listApplications, listUsers } from '@/lib/shop';
import { Badge, Card } from '@/components/shop/ui';

export const metadata = { title: 'Dojo & Members | Dashboard' };

export default async function DojoOverview() {
  const c = await adminCounts();
  const apps = (await listApplications()).filter((a) => a.status === 'pending').slice(0, 6);
  const members = (await listUsers('pending')).filter((u) => u.role !== 'admin').slice(0, 6);
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-extrabold text-gray-900">Dojo &amp; Members</h1>
      <div className="grid sm:grid-cols-2 gap-4">
        <Link href="/admin/dojo/applications">
          <Card className="!p-5 hover:border-red-300 transition-colors">
            <p className={`text-4xl font-extrabold ${c.pendingApps ? 'text-red-600' : 'text-gray-300'}`}>{c.pendingApps}</p>
            <p className="text-sm font-semibold text-gray-700 mt-1">Applications to review</p>
          </Card>
        </Link>
        <Link href="/admin/dojo/members">
          <Card className="!p-5 hover:border-red-300 transition-colors">
            <p className={`text-4xl font-extrabold ${c.pendingUsers ? 'text-red-600' : 'text-gray-300'}`}>{c.pendingUsers}</p>
            <p className="text-sm font-semibold text-gray-700 mt-1">Members awaiting approval</p>
          </Card>
        </Link>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="!p-5">
          <h2 className="font-bold text-gray-900 mb-3">Pending applications</h2>
          {apps.length === 0 ? (
            <p className="text-sm text-gray-500">Nothing waiting for review.</p>
          ) : (
            <ul className="divide-y divide-gray-100 text-sm">
              {apps.map((a) => (
                <li key={a.id} className="py-2.5 flex items-center justify-between gap-3">
                  <Link href={`/admin/dojo/applications/${a.id}`} className="font-semibold text-red-600 hover:underline">
                    #{a.id} · {a.dojo_name}
                  </Link>
                  <span className="text-xs text-gray-500">{a.created_at.slice(0, 10)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card className="!p-5">
          <h2 className="font-bold text-gray-900 mb-3">Members awaiting approval</h2>
          {members.length === 0 ? (
            <p className="text-sm text-gray-500">No members are waiting.</p>
          ) : (
            <ul className="divide-y divide-gray-100 text-sm">
              {members.map((u) => (
                <li key={u.id} className="py-2.5 flex items-center justify-between gap-3">
                  <span>
                    <span className="font-semibold text-gray-900">
                      {u.first_name} {u.last_name}
                    </span>
                    <span className="block text-xs text-gray-500">{u.email}</span>
                  </span>
                  <Badge value={u.status} />
                </li>
              ))}
            </ul>
          )}
          <Link href="/admin/dojo/members" className="mt-3 inline-block text-sm font-semibold text-red-600 hover:underline">
            Manage members →
          </Link>
        </Card>
      </div>
    </div>
  );
}
