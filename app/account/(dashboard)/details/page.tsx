import { cancelEmailChangeAction } from '@/app/account/actions';
import { requireUser } from '@/lib/auth';
import { ChangeEmailForm, ProfileForm } from '@/components/account/AccountForms';
import { ChangePasswordForm } from '@/components/shop/AuthForms';
import { Card, Notice, secondaryBtn } from '@/components/shop/ui';

export const metadata = { title: 'Account details | JKA/AF' };

export default async function DetailsPage() {
  const user = await requireUser('/account/details');
  return (
    <>
      <h2 className="text-2xl font-extrabold text-gray-900">Account details</h2>
      <Card>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Personal details</h3>
        <ProfileForm user={user} />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      <Card>
        <h3 className="text-lg font-bold text-gray-900 mb-1">Email address</h3>
        <p className="text-sm text-gray-600 mb-4">
          Current email: <strong>{user.email}</strong>
        </p>
        {user.pending_email && (
          <div className="mb-4 space-y-3">
            <Notice tone="warn">
              Waiting for you to confirm <strong>{user.pending_email}</strong> from the link we emailed there.
            </Notice>
            <form action={cancelEmailChangeAction}>
              <button className={secondaryBtn}>Cancel email change</button>
            </form>
          </div>
        )}
        <ChangeEmailForm />
      </Card>

      <Card>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Change password</h3>
        <ChangePasswordForm />
      </Card>
      </div>
    </>
  );
}
