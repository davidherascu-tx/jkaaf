import { redirect } from 'next/navigation';
import { activateAccountAction } from '@/app/account/actions';
import { activationTokenValid } from '@/lib/emailVerification';
import { AuthShell, Card, primaryBtn } from '@/components/shop/ui';

export const metadata = { title: 'Activate your account | JKA/AF', robots: { index: false } };

export default async function ActivateTokenPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!/^[a-f0-9]{64}$/.test(token) || !(await activationTokenValid(token))) redirect('/account/activate');
  // A button (not an automatic GET) so email scanners that open links cannot use up the link.
  return (
    <AuthShell title="Activate your account">
      <Card>
          <form action={activateAccountAction.bind(null, token)} className="space-y-4">
            <p className="text-gray-700">Confirm your email address to activate your JKA/AF account.</p>
            <button type="submit" className={`${primaryBtn} w-full`}>
              Activate my account
            </button>
          </form>
      </Card>
    </AuthShell>
  );
}
