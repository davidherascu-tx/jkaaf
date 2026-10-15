import Link from 'next/link';
import { resetTokenValid } from '@/lib/passwordReset';
import { ResetPasswordForm } from '@/components/shop/AuthForms';
import { Card, Notice, PageShell } from '@/components/shop/ui';

export const metadata = { title: 'Choose a new password | JKA/AF', robots: { index: false } };

export default async function ResetPasswordPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const valid = /^[a-f0-9]{64}$/.test(token) && (await resetTokenValid(token));
  return (
    <PageShell title="Choose a new password">
      <div className="max-w-xl">
        {valid ? (
          <ResetPasswordForm token={token} />
        ) : (
          <Card>
            <Notice tone="warn">This reset link is invalid or has expired.</Notice>
            <p className="mt-4 text-sm">
              <Link href="/account/forgot" className="font-semibold text-red-600 hover:underline">
                Request a new link
              </Link>
            </p>
          </Card>
        )}
      </div>
    </PageShell>
  );
}
