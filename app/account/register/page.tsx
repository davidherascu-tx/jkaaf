import { redirect } from 'next/navigation';
import { getUser } from '@/lib/auth';
import { RegisterForm } from '@/components/shop/AuthForms';
import { AuthShell } from '@/components/shop/ui';

export const metadata = { title: 'Create account | JKA/AF' };

export default async function RegisterPage() {
  if (await getUser()) redirect('/account');
  return (
    <AuthShell
      size="xl"
      title="Create an account"
      subtitle="Create an account and we will email you a link to activate it. To order from the shop you also need your JKA/AF Individual Membership approved."
    >
      <RegisterForm />
    </AuthShell>
  );
}
