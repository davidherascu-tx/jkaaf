import type { ReactNode } from 'react';
import { logoutAction } from '@/app/account/actions';
import { requireUser } from '@/lib/auth';
import AccountNav from '@/components/account/AccountNav';
import { secondaryBtn } from '@/components/shop/ui';

export default async function AccountLayout({ children }: { children: ReactNode }) {
  const user = await requireUser('/account');
  return (
    <div className="bg-gray-50 flex-1 w-full pt-28 md:pt-36 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">My account</h1>
            <div className="w-16 h-1.5 bg-red-600 rounded-full mt-3 mb-3" />
            <p className="text-gray-600">
              {user.first_name} {user.last_name} · {user.email}
            </p>
          </div>
          <form action={logoutAction}>
            <button className={secondaryBtn}>Sign out</button>
          </form>
        </div>
        <div className="grid lg:grid-cols-[16rem_minmax(0,1fr)] gap-6 lg:gap-8 items-start">
          <div className="lg:sticky lg:top-32">
            <AccountNav />
          </div>
          <div className="space-y-6 min-w-0">{children}</div>
        </div>
      </div>
    </div>
  );
}
