import { ResendActivationForm } from '@/components/shop/AuthForms';
import { AuthShell } from '@/components/shop/ui';

export const metadata = { title: 'Activate your account | JKA/AF', robots: { index: false } };

export default function ActivatePage() {
  return (
    <AuthShell
      title="Activate your account"
      subtitle="Enter the email you signed up with and we will send you a new activation link. Check your spam folder too."
    >
      <ResendActivationForm />
    </AuthShell>
  );
}
