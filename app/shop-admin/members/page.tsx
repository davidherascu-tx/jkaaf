import { setUserStatusAction } from '@/app/shop-admin/actions';
import { getUser } from '@/lib/auth';
import { listUsers } from '@/lib/shop';
import { Badge, Card } from '@/components/shop/ui';

export default async function AdminMembers() {
  const me = await getUser();
  // Pending first, then everyone else.
  const users = listUsers().sort((a, b) => Number(b.status === 'pending') - Number(a.status === 'pending'));
  return (
    <>
      <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Members</h1>
      <Card className="!p-0 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-gray-500 border-b border-gray-200">
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4">Dojo / rank</th>
              <th className="p-4">Phone</th>
              <th className="p-4">Signed up (UTC)</th>
              <th className="p-4">Status</th>
              <th className="p-4" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="p-4">
                  <span className="font-semibold text-gray-900">
                    {u.first_name} {u.last_name}
                  </span>
                  <span className="block text-xs text-gray-500">{u.email}</span>
                </td>
                <td className="p-4 text-gray-700">{[u.dojo, u.rank].filter(Boolean).join(' · ') || '—'}</td>
                <td className="p-4 text-gray-700">{u.phone || '—'}</td>
                <td className="p-4 text-gray-600">{u.created_at}</td>
                <td className="p-4">
                  <Badge value={u.role === 'admin' ? 'admin' : u.status} />
                </td>
                <td className="p-4">
                  {u.id !== me?.id && u.role !== 'admin' && (
                    <div className="flex gap-4 justify-end">
                      {u.status !== 'approved' && (
                        <form action={setUserStatusAction.bind(null, u.id, 'approved')}>
                          <button className="font-semibold text-green-700 hover:underline cursor-pointer">Approve</button>
                        </form>
                      )}
                      {u.status !== 'rejected' && (
                        <form action={setUserStatusAction.bind(null, u.id, 'rejected')}>
                          <button className="font-semibold text-red-600 hover:underline cursor-pointer">
                            {u.status === 'approved' ? 'Revoke' : 'Reject'}
                          </button>
                        </form>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}
