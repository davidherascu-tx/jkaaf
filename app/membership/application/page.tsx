import Link from 'next/link';
import { getUser } from '@/lib/auth';
import DojoApplicationForm from '@/components/shop/DojoApplicationForm';
import { Notice, PageShell } from '@/components/shop/ui';

export const metadata = { title: 'Dojo Membership application | JKA/AF' };

export default async function ApplicationPage() {
  const user = await getUser();
  return (
    <PageShell
      title="Dojo Membership application"
      subtitle="Application for Club Membership in the Japan Karate Association/American Federation. Application does not guarantee admission."
    >
      <div className="space-y-6">
        <Notice>
          Complete this application before paying club dues. No account is needed beforehand - you create one at the top of the form. After an administrator approves it, the JKA/AF Club
          Membership becomes available in the{' '}
          <Link href="/shop" className="font-bold underline">
            shop
          </Link>
          . Fields marked <span className="text-red-600 font-bold">*</span> are required.
        </Notice>
        <DojoApplicationForm signedInAs={user ? user.email : null} />
      </div>
    </PageShell>
  );
}
