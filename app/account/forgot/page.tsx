import { ForgotPasswordForm } from '@/components/shop/AuthForms';
import { PageShell } from '@/components/shop/ui';

export const metadata = { title: 'Reset password | JKA/AF' };

export default function ForgotPasswordPage() {
  return (
    <PageShell title="Forgot your password?" subtitle="Enter your account email and we will send you a link to choose a new password.">
      <div className="max-w-md">
        <ForgotPasswordForm />
      </div>
    </PageShell>
  );
}
