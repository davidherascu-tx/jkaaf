import { requireUser } from '@/lib/auth';
import { getAddresses, sameAddress } from '@/lib/addresses';
import { AddressesForm } from '@/components/account/AccountForms';
import { Card, Notice } from '@/components/shop/ui';

export const metadata = { title: 'Addresses | JKA/AF' };

export default async function AddressesPage() {
  const user = await requireUser('/account/addresses');
  const { billing, shipping } = await getAddresses(user.id);
  return (
    <>
      <h2 className="text-2xl font-extrabold text-gray-900">Addresses</h2>
      {!(billing && shipping) && (
        <Notice tone="warn">
          <strong>Add your billing address</strong> to place orders. Shipping can be the same address or a different one.
        </Notice>
      )}
      <Card>
        <AddressesForm
          billing={billing}
          shipping={shipping}
          sameAsBilling={sameAddress(billing, shipping)}
          defaultName={`${user.first_name} ${user.last_name}`}
        />
      </Card>
    </>
  );
}
