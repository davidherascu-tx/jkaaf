import Link from 'next/link';
import { listApplications } from '@/lib/shop';
import { Badge, Card } from '@/components/shop/ui';

export default async function AdminApplications() {
  const apps = await listApplications();
  return (
    <>
      <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Dojo applications</h1>
      <Card className="!p-0 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-gray-500 border-b border-gray-200">
            <tr>
              <th className="p-4">Dojo</th>
              <th className="p-4">Chief instructor</th>
              <th className="p-4">Applicant</th>
              <th className="p-4">Submitted (UTC)</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {apps.map((a) => (
              <tr key={a.id}>
                <td className="p-4">
                  <Link href={`/shop-admin/applications/${a.id}`} className="font-semibold text-red-600 hover:underline">
                    {a.dojo_name}
                  </Link>
                </td>
                <td className="p-4">{a.chief_instructor}</td>
                <td className="p-4 text-gray-600">{a.applicant_email}</td>
                <td className="p-4 text-gray-600">{a.created_at}</td>
                <td className="p-4">
                  <Badge value={a.status} />
                </td>
              </tr>
            ))}
            {apps.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-gray-500">
                  No applications yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </>
  );
}
