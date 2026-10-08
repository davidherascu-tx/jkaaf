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
      subtitle="New accounts are reviewed and approved by JKA/AF."
    >
      <div className="max-w-xl">
        <RegisterForm />
      </div>
    </PageShell>
  );
}
