import { ForgotPasswordForm } from '@/components/shop/AuthForms';
import { AuthShell } from '@/components/shop/ui';

export const metadata = { title: 'Reset password | JKA/AF' };

export default function ForgotPasswordPage() {
  return (
    <AuthShell title="Forgot your password?" subtitle="Enter your account email and we will send you a link to choose a new password.">
      <ForgotPasswordForm />
    </AuthShell>
  );
}
