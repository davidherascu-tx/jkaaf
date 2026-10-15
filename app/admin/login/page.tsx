import { redirect } from 'next/navigation';
import { getUser, safeNext } from '@/lib/auth';
import { LoginForm } from '@/components/shop/AuthForms';
import { Notice, PageShell } from '@/components/shop/ui';

export const metadata = { title: 'Owner login | JKA/AF', robots: { index: false } };

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  const target = safeNext(next, '/admin');
  const user = await getUser();
  if (user?.role === 'admin') redirect(target.startsWith('/admin') ? target : '/admin');
  return (
    <PageShell title="Shop dashboard" subtitle="Owner sign-in for managing orders, products, members and applications.">
      <div className="max-w-md space-y-4">
        {user && <Notice tone="warn">You are signed in as {user.email}, which is not the shop owner account. Sign in below with the owner account.</Notice>}
        <LoginForm next={target.startsWith('/admin') ? target : '/admin'} showRegisterLink={false} />
      </div>
    </PageShell>
  );
}
