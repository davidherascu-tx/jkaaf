import Link from 'next/link';
import { getUser } from '@/lib/auth';
import { approvedClubNames, isSoldOut, listProducts } from '@/lib/shop';
import PriceTag from '@/components/shop/PriceTag';
import AddToCartForm from '@/components/shop/AddToCartForm';
import ProductImage from '@/components/shop/ProductImage';
import { Notice, PageShell } from '@/components/shop/ui';
import { LockNotice, lockFor } from '@/components/shop/ShopLock';

export const metadata = { title: 'Shop | JKA/AF' };

export default async function ShopPage() {
  const user = await getUser();
  const clubs = user ? await approvedClubNames(user.id) : [];
  const products = await listProducts();
  return (
    <PageShell
      wide
      title="JKA/AF Shop"
      subtitle="Official JKA/AF renewals, patches, passports and memberships, available to approved JKA/AF members."
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((p) => {
          const lock = lockFor(p, user, clubs);
          return (
            <article key={p.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
              <Link href={`/shop/${p.slug}`} aria-label={p.name}>
                <ProductImage src={p.image_url} alt={p.name} className="aspect-[4/3]" />
              </Link>
              <div className="p-5 flex flex-col flex-1">
                <h2 className="font-bold text-gray-900 leading-snug">
                  <Link href={`/shop/${p.slug}`} className="hover:text-red-600">
                    {p.name}
                  </Link>
                </h2>
                <div className="mt-1"><PriceTag product={p} /></div>
                <p className="mt-2 text-sm text-gray-600 line-clamp-3">{p.description}</p>
                <div className="mt-auto pt-4">
                  {p.stock !== null && p.stock > 0 && p.stock <= 5 && (
                    <p className="text-xs font-bold text-amber-700 mb-2">Only {p.stock} left</p>
                  )}
                  {isSoldOut(p) ? (
                    <p className="text-center font-bold text-gray-500 bg-gray-100 rounded-xl py-3">Out of stock</p>
                  ) : lock ? (
                    <LockNotice lock={lock} compact />
                  ) : (
                    <AddToCartForm product={p} clubs={clubs} compact />
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
      {products.length === 0 && <p className="text-gray-600">No products available right now.</p>}
      <div className="mt-8">
        <Notice>
          Free shipping on most items; any shipping fee is shown on the product. Payment is by check after you place your order.
        </Notice>
      </div>
    </PageShell>
  );
}
