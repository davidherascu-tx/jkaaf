import { ResendActivationForm } from '@/components/shop/AuthForms';
import { AuthShell } from '@/components/shop/ui';

export const metadata = { title: 'Activate your account | JKA/AF', robots: { index: false } };

export default function ActivatePage() {
  return (
    <AuthShell
      title="Activate your account"
      subtitle="That activation link is invalid or has expired, or you need a new one. Enter your email and we will send a fresh link."
    >
      <ResendActivationForm />
    </AuthShell>
  );
}
