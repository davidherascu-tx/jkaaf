import Link from 'next/link';
import { requireUser } from '@/lib/auth';
import { listApplications, listMembershipPurchases, ORDER_STATUS_LABEL } from '@/lib/shop';
import { dateOnlyText, isExpired, membershipYear, timeLeftText, validThroughText } from '@/lib/membership';
import CancelSubscriptionButton from '@/components/account/CancelSubscriptionButton';
import RequestApprovalForm from '@/components/account/RequestApprovalForm';
import MembershipCard from '@/components/account/MembershipCard';
import { Badge, Card, secondaryBtn } from '@/components/shop/ui';

export const metadata = { title: 'Membership | JKA/AF' };


export default async function MembershipPage() {
  const user = await requireUser('/account/membership');
  const [apps, purchases] = await Promise.all([listApplications(user.id), listMembershipPurchases(user.id)]);
  const thisYear = new Date().getUTCFullYear();
  const paidYears = purchases.filter((m) => m.order_status === 'paid' || m.order_status === 'completed').map((m) => membershipYear(m.ordered_at));
  const activeThisYear = paidYears.includes(thisYear);
  return (
    <>
      <h2 className="text-2xl font-extrabold text-gray-900">Membership</h2>
      <MembershipCard user={user} />
      {user.status !== 'approved' && (user.status === 'rejected' || !user.approval_requested) && (
        <Card>
          <h3 className="text-lg font-bold text-gray-900 mb-1">
            {user.status === 'rejected' ? 'Request approval again' : 'Request JKA/AF Individual Membership approval'}
          </h3>
          <p className="text-sm text-gray-600 mb-4">Tell us your dojo and rank. An administrator reviews every request and emails you the result.</p>
          <RequestApprovalForm dojo={user.dojo} rank={user.rank} />
        </Card>
      )}

      <Card>
        <h3 className="text-lg font-bold text-gray-900 mb-1">JKA/AF Individual Membership</h3>
        <p className="text-sm text-gray-600 mb-4">
          A membership is valid for the calendar year, January 1 to December 31.
          {purchases.length > 0 && (activeThisYear ? ` Your ${thisYear} membership is active.` : ` You have no active ${thisYear} membership.`)}
        </p>
        {purchases.length === 0 ? (
          <p className="text-gray-600 text-sm">
            No membership purchased yet.{' '}
            <Link href="/shop/jkaaf-individual-membership" className="font-semibold text-red-600 hover:underline">
              Get your Individual Membership
            </Link>
          </p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {purchases.map((m) => (
              <li key={m.item_id} className="py-3 flex flex-wrap items-center justify-between gap-3">
                <span>
                  <span className="font-semibold text-gray-900">{membershipYear(m.ordered_at)} Membership</span>
                  <Link href={`/shop/orders/${m.order_id}`} className="ml-2 text-sm text-gray-500 hover:text-red-600">
                    Order #{m.order_id}
                  </Link>
                  <span className={`block text-xs font-semibold ${isExpired(membershipYear(m.ordered_at)) ? 'text-gray-500' : 'text-green-700'}`}>
                    {isExpired(membershipYear(m.ordered_at))
                      ? `Expired ${validThroughText(membershipYear(m.ordered_at))}`
                      : `Active until ${validThroughText(membershipYear(m.ordered_at))} · ${timeLeftText(membershipYear(m.ordered_at))}`}
                  </span>
                  <span className="block text-xs text-gray-500">Ordered {m.ordered_at} UTC</span>
                  {m.selections.length > 0 && <span className="block text-xs text-gray-600">{m.selections.map((x) => x.value).join(' · ')}</span>}
                  {m.recurring && (
                    <span className={`block text-xs font-semibold ${m.canceled ? 'text-gray-500' : 'text-amber-700'}`}>
                      {m.canceled
                        ? `Subscription canceled ${m.canceled_at ? dateOnlyText(m.canceled_at) : ''}. It will not renew; your membership stays active until ${validThroughText(membershipYear(m.ordered_at))}.`
                        : 'Renews every January until canceled'}
                    </span>
                  )}
                </span>
                <span className="flex items-center gap-3">
                  <Badge value={m.order_status} label={ORDER_STATUS_LABEL[m.order_status]} />
                  {m.recurring && !m.canceled && <CancelSubscriptionButton itemId={m.item_id} />}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h3 className="text-lg font-bold text-gray-900">Dojo Membership applications</h3>
          <Link href="/membership/application" className={secondaryBtn}>
            New application
          </Link>
        </div>
        {apps.length === 0 ? (
          <p className="text-gray-600 text-sm">None yet. Submit one to join with your dojo and unlock the JKA/AF Club Membership in the shop.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {apps.map((a) => (
              <li key={a.id} className="py-3 flex items-center justify-between gap-3">
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
    </>
  );
}
