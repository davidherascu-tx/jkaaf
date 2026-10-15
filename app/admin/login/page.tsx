import { redirect } from 'next/navigation';
import { getUser, safeNext } from '@/lib/auth';
import { LoginForm } from '@/components/shop/AuthForms';
import { AuthShell, Notice } from '@/components/shop/ui';

export const metadata = { title: 'Admin dashboard login | JKA/AF', robots: { index: false } };

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  const target = safeNext(next, '/admin');
  const user = await getUser();
  if (user?.role === 'admin') redirect(target.startsWith('/admin') ? target : '/admin');
  return (
    <AuthShell title="Admin dashboard" subtitle="Sign in to manage orders, products, members and applications.">
      {user && <Notice tone="warn">You are signed in as {user.email}, which is not an admin account. Sign in below with the admin account.</Notice>}
      <LoginForm next={target.startsWith('/admin') ? target : '/admin'} showRegisterLink={false} />
    </AuthShell>
  );
}
