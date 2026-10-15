import Link from 'next/link';
import { requireUser } from '@/lib/auth';
import DojoApplicationForm from '@/components/shop/DojoApplicationForm';
import { Notice, PageShell } from '@/components/shop/ui';

export const metadata = { title: 'Dojo Membership application | JKA/AF' };

export default async function ApplicationPage() {
  const user = await requireUser('/membership/application');
  return (
    <PageShell
      title="Dojo Membership application"
      subtitle="Application for Club Membership in the Japan Karate Association/American Federation. Application does not guarantee admission."
    >
      <div className="space-y-6">
        <Notice>
          Complete this application to join JKA/AF with your dojo, before paying club dues. After an administrator approves it, the JKA/AF Club
          Membership becomes available in the{' '}
          <Link href="/shop" className="font-bold underline">
            shop
          </Link>
          . Fields marked <span className="text-red-600 font-bold">*</span> are required.
        </Notice>
        <DojoApplicationForm signedInAs={user.email} />
      </div>
    </PageShell>
  );
}
