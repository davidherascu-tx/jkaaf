import { redirect } from 'next/navigation';
import { getUser, safeNext } from '@/lib/auth';
import { LoginForm } from '@/components/shop/AuthForms';
import { PageShell } from '@/components/shop/ui';

export const metadata = { title: 'Sign in | JKA/AF' };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  const target = safeNext(next);
  if (await getUser()) redirect(target);
  return (
    <PageShell title="Sign in" subtitle="Access your JKA/AF account, orders and applications.">
      <div className="max-w-md">
        <LoginForm next={target} />
      </div>
    </PageShell>
  );
}
