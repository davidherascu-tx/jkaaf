import Link from 'next/link';
import { logoutAction } from '@/app/account/actions';
import { requireUser } from '@/lib/auth';
import { listApplications, listOrders, ORDER_STATUS_LABEL } from '@/lib/shop';
import { formatCents } from '@/lib/money';
import { ChangePasswordForm } from '@/components/shop/AuthForms';
import { Badge, Card, Notice, PageShell, primaryBtn, secondaryBtn } from '@/components/shop/ui';

export const metadata = { title: 'My account | JKA/AF' };

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ applied?: string }> }) {
  const { applied } = await searchParams;
  const user = await requireUser('/account');
  const orders = (await listOrders(user.id)).slice(0, 5);
  const apps = await listApplications(user.id);

  return (
    <PageShell
      title={`Welcome, ${user.first_name}`}
      subtitle={user.email}
      actions={
        <form action={logoutAction}>
          <button className={secondaryBtn}>Sign out</button>
        </form>
      }
    >
      <div className="space-y-6">
        {applied && (
          <Notice tone="ok">
            <strong>Application received.</strong> JKA/AF will review it. Once approved, the Club Membership unlocks in the shop.
          </Notice>
        )}
        {user.status === 'pending' && (
          <Notice tone="warn">
            <strong>Membership pending.</strong> JKA/AF is reviewing your new account. You can already shop and place orders; this just
            confirms your membership.
          </Notice>
        )}
        {user.status === 'rejected' && (
          <Notice tone="warn">
            Your account was not approved. Please <Link href="/contact" className="font-bold underline">contact JKA/AF</Link>.
          </Notice>
        )}
        {user.status === 'approved' && (
          <Notice tone="ok">Your membership is approved. You can order from the shop.</Notice>
        )}

        <div className="flex flex-wrap gap-3">
          <Link href="/shop" className={primaryBtn}>
            Shop
          </Link>
          <Link href="/membership/application" className={secondaryBtn}>
            Dojo Membership application
          </Link>
          {user.role === 'admin' && (
            <Link href="/shop-admin" className={secondaryBtn}>
              Shop admin
            </Link>
          )}
        </div>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Recent orders</h2>
            <Link href="/shop/orders" className="text-sm font-semibold text-red-600 hover:underline">
              View all
            </Link>
          </div>
          {orders.length === 0 ? (
            <p className="text-gray-600 text-sm">No orders yet.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {orders.map((o) => (
                <li key={o.id} className="py-2.5 flex items-center justify-between gap-3">
                  <Link href={`/shop/orders/${o.id}`} className="font-semibold text-gray-900 hover:text-red-600">
                    Order #{o.id}
                  </Link>
                  <span className="flex items-center gap-3">
                    <Badge value={o.status} label={ORDER_STATUS_LABEL[o.status]} />
                    <span className="font-semibold">{formatCents(o.total_cents)}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Dojo applications</h2>
          {apps.length === 0 ? (
            <p className="text-gray-600 text-sm">
              None yet. Submit one to unlock the JKA/AF Club Membership in the shop.
            </p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {apps.map((a) => (
                <li key={a.id} className="py-2.5 flex items-center justify-between gap-3">
                  <span>
                    <span className="font-semibold text-gray-900">{a.dojo_name}</span>
                    <span className="block text-xs text-gray-500">Submitted {a.created_at} UTC</span>
                    {a.admin_note && <span className="block text-xs text-gray-600">Note: {a.admin_note}</span>}
                  </span>
                  <Badge value={a.status} />
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Change password</h2>
          <ChangePasswordForm />
        </Card>
      </div>
    </PageShell>
  );
}
