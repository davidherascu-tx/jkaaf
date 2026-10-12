import { redirect } from 'next/navigation';
import { getUser } from '@/lib/auth';
import { RegisterForm } from '@/components/shop/AuthForms';
import { PageShell } from '@/components/shop/ui';

export const metadata = { title: 'Create account | JKA/AF' };

export default async function RegisterPage() {
  if (await getUser()) redirect('/account');
  return (
    <PageShell
      title="Create an account"
      subtitle="Create an account to shop and place orders. Approval is only needed for products that require it, such as the Club Membership."
    >
      <div className="max-w-xl">
        <RegisterForm />
      </div>
    </PageShell>
  );
}
