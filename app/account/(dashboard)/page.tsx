import Link from 'next/link';
import { requireUser } from '@/lib/auth';
import { getAddresses, sameAddress } from '@/lib/addresses';
import { listApplications, listOrders, ORDER_STATUS_LABEL } from '@/lib/shop';
import { formatCents } from '@/lib/money';
import MembershipCard from '@/components/account/MembershipCard';
import { Badge, Card, Notice, primaryBtn, secondaryBtn } from '@/components/shop/ui';

export const metadata = { title: 'My account | JKA/AF' };

function AddressSummary({ title, a }: { title: string; a: { name: string; line1: string; city: string; state: string; zip: string } | null }) {
  return (
    <div>
      <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">{title}</h3>
      {a ? (
        <address className="not-italic text-sm text-gray-700 leading-relaxed">
          {a.name}
          <br />
          {a.line1}, {a.city}, {a.state} {a.zip}
        </address>
      ) : (
        <p className="text-sm text-gray-500">Not set</p>
      )}
    </div>
  );
}

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ applied?: string }> }) {
  const { applied } = await searchParams;
  const user = await requireUser('/account');
  const [allOrders, apps, addresses] = await Promise.all([listOrders(user.id), listApplications(user.id), getAddresses(user.id)]);
  const orders = allOrders.slice(0, 5);
  const open = allOrders.filter((o) => o.status === 'awaiting_payment' || o.status === 'paid').length;

  return (
    <>
      {applied && (
        <Notice tone="ok">
          <strong>Application received.</strong> JKA/AF will review it and email you when it is approved.
        </Notice>
      )}
      {user.pending_email && (
        <Notice tone="warn">
          Waiting for you to confirm <strong>{user.pending_email}</strong>. Open the link we emailed there to finish changing your email.
        </Notice>
      )}

      <MembershipCard user={user} compact />

      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { label: 'Total orders', value: allOrders.length },
          { label: 'Open orders', value: open },
          { label: 'Dojo applications', value: apps.length },
        ].map((t) => (
          <Card key={t.label} className="!p-5">
            <p className="text-sm font-semibold text-gray-500">{t.label}</p>
            <p className="text-3xl font-extrabold text-gray-900 mt-1">{t.value}</p>
          </Card>
        ))}
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Recent orders</h2>
          <Link href="/account/orders" className="text-sm font-semibold text-red-600 hover:underline">
            View all
          </Link>
        </div>
        {orders.length === 0 ? (
          <div>
            <p className="text-gray-600 text-sm mb-4">No orders yet.</p>
            <Link href="/shop" className={primaryBtn}>
              Browse the shop
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {orders.map((o) => (
              <li key={o.id} className="py-3 flex items-center justify-between gap-3">
                <Link href={`/shop/orders/${o.id}`} className="min-w-0">
                  <span className="font-semibold text-gray-900 hover:text-red-600">Order #{o.id}</span>
                  <span className="block text-xs text-gray-500">
                    {o.created_at} UTC{o.status !== 'cancelled' && o.shipping && o.shipping !== 'No shipping' ? ` · ${o.shipping}` : ''}
                  </span>
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
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Addresses</h2>
          <Link href="/account/addresses" className="text-sm font-semibold text-red-600 hover:underline">
            Manage
          </Link>
        </div>
        {sameAddress(addresses.billing, addresses.shipping) ? (
          <AddressSummary title="Billing and shipping address" a={addresses.billing} />
        ) : (
          <div className="grid sm:grid-cols-2 gap-6">
            <AddressSummary title="Billing" a={addresses.billing} />
            <AddressSummary title="Shipping" a={addresses.shipping} />
          </div>
        )}
      </Card>

      <div className="flex flex-wrap gap-3">
        <Link href="/shop" className={primaryBtn}>
          Shop
        </Link>
        <Link href="/membership/application" className={secondaryBtn}>
          Join with your dojo
        </Link>
        {user.role === 'admin' && (
          <Link href="/admin" className={secondaryBtn}>
            Admin dashboard
          </Link>
        )}
      </div>
    </>
  );
}
