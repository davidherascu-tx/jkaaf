import { redirect } from 'next/navigation';
import { getUser } from '@/lib/auth';
import { getCartOwner } from '@/lib/cart';
import { cartNeedsShipping, getCart } from '@/lib/shop';
import { formatCents } from '@/lib/money';
import CheckoutForm from '@/components/shop/CheckoutForm';
import { Card, Notice, PageShell } from '@/components/shop/ui';

export const metadata = { title: 'Checkout | JKA/AF' };

export default async function CheckoutPage() {
  const user = await getUser();
  const owner = await getCartOwner();
  const cart = owner ? await getCart(owner) : [];
  if (cart.length === 0 || cart.some((l) => 'error' in l.priced)) redirect('/shop/cart');
  const total = cart.reduce((s, l) => s + ('error' in l.priced ? 0 : l.priced.unitCents * l.quantity), 0);

  return (
    <PageShell title="Checkout">
      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-5">
          <Notice>
            Payment method: <strong>check</strong>. After placing your order you will see where to send it.
          </Notice>
          <Card>
            <CheckoutForm
              needsShipping={cartNeedsShipping(cart)}
              user={user ? { name: `${user.first_name} ${user.last_name}`, email: user.email } : null}
            />
          </Card>
        </div>
        <div className="lg:col-span-2">
          <Card className="!p-5">
            <h2 className="font-bold text-gray-900 mb-3">Order summary</h2>
            <ul className="space-y-2 text-sm">
              {cart.map((l) => (
                <li key={l.id} className="flex justify-between gap-3">
                  <span>
                    {l.quantity} × {l.product.name}
                    {!('error' in l.priced) && l.priced.lines.length > 0 && (
                      <span className="block text-gray-500">{l.priced.lines.map((x) => x.value).join(' · ')}</span>
                    )}
                  </span>
                  <span className="font-semibold">
                    {!('error' in l.priced) && formatCents(l.priced.unitCents * l.quantity)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="border-t border-gray-200 mt-4 pt-3 flex justify-between text-sm text-gray-700">
              <span>Shipping</span>
              {cart.every((l) => l.product.free_shipping) ? (
                <span className="font-semibold text-green-700">Free</span>
              ) : (
                <span className="font-semibold text-gray-700">Included in item prices</span>
              )}
            </div>
            <div className="flex justify-between text-lg font-extrabold mt-1">
              <span>Total</span>
              <span>{formatCents(total)}</span>
            </div>
          </Card>
        </div>
      </div>
    </PageShell>
  );
}
