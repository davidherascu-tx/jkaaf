import { redirect } from 'next/navigation';
import { getUser, safeNext } from '@/lib/auth';
import { LoginForm } from '@/components/shop/AuthForms';
import { AuthShell, Notice } from '@/components/shop/ui';

export const metadata = { title: 'Sign in | JKA/AF' };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; reset?: string; activate?: string; activated?: string }> }) {
  const { next, reset, activate, activated } = await searchParams;
  const target = safeNext(next);
  const user = await getUser();
  if (user) redirect(user.role === 'admin' && target === '/account' ? '/admin' : target);
  return (
    <AuthShell title="Sign in" subtitle="Access your JKA/AF account, orders and applications.">
      {activate && (
        <Notice tone="ok">
          <strong>Check your email.</strong> We sent you a link to activate your account. You can sign in once you have clicked it.
        </Notice>
      )}
      {activated && <Notice tone="ok">Your account is activated. Sign in below.</Notice>}
      {reset && <Notice tone="ok">Your password was changed. Sign in with your new password.</Notice>}
      <LoginForm next={target} />
    </AuthShell>
  );
}
