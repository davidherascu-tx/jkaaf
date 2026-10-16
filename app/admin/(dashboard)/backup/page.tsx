import { requireAdmin } from '@/lib/auth';
import { currentCounts } from '@/lib/backup';
import RestoreForm from '@/components/admin/RestoreForm';
import { Card, Notice, primaryBtn } from '@/components/shop/ui';

export const metadata = { title: 'Backup & restore | Admin dashboard' };

export default async function BackupPage() {
  await requireAdmin();
  const n = await currentCounts();
  const rows: [string, number][] = [
    ['Accounts (customers and admins)', n.users],
    ['Addresses', n.addresses],
    ['Orders', n.orders],
    ['Order items (including yearly subscriptions and cancellations)', n.order_items],
    ['Payments', n.payments],
    ['Refunds', n.refunds],
    ['Dojo applications', n.dojo_applications],
    ['Products', n.products],
    ['Shopping carts', n.cart_items],
  ];
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900">Backup &amp; restore</h1>
        <p className="text-gray-600 mt-1">Download everything the shop stores as one file, and restore it if something ever goes wrong.</p>
      </div>

      <Card>
        <h2 className="text-lg font-bold text-gray-900 mb-1">Download a backup</h2>
        <p className="text-sm text-gray-600 mb-4">A file with all the data listed below. Make one regularly and keep it somewhere safe.</p>
        <ul className="text-sm text-gray-700 mb-5 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1">
          {rows.map(([label, count]) => (
            <li key={label} className="flex justify-between gap-4 border-b border-gray-100 py-1">
              <span>{label}</span>
              <span className="font-semibold">{count}</span>
            </li>
          ))}
        </ul>
        <a href="/admin/backup/export" className={primaryBtn}>
          Download backup
        </a>
        <div className="mt-4">
          <Notice tone="warn">
            The file contains customers&apos; personal details and password hashes. Store it privately and never send it by email or share it.
            Website content (events, news, dojos) is in Sanity and is not part of this file.
          </Notice>
        </div>
      </Card>

      <Card className="!border-red-200">
        <h2 className="text-lg font-bold text-gray-900 mb-1">Restore from a backup</h2>
        <p className="text-sm text-gray-600 mb-4">
          Replaces <strong>all</strong> current accounts, orders, subscriptions, payments, applications and products with the contents of a
          backup file. It runs all-or-nothing: if the file has a problem, nothing is changed. Everyone is signed out afterwards.
          Download a fresh backup first if you may need today&apos;s data.
        </p>
        <RestoreForm />
      </Card>
    </div>
  );
}
