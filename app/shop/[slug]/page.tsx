import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getUser } from '@/lib/auth';
import { approvedClubNames, getProductBySlug, isSoldOut } from '@/lib/shop';
import PriceTag from '@/components/shop/PriceTag';
import AddToCartForm from '@/components/shop/AddToCartForm';
import ProductImage from '@/components/shop/ProductImage';
import { Card, Notice, PageShell } from '@/components/shop/ui';
import { LockNotice, lockFor } from '@/components/shop/ShopLock';

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product || !product.active) notFound();

  const user = await getUser();
  const clubs = user ? await approvedClubNames(user.id) : [];
  const lock = lockFor(product, user, clubs);

  return (
    <PageShell wide title={product.name}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <ProductImage src={product.image_url} alt={product.name} className="aspect-square rounded-2xl border border-gray-200" />
        <div className="space-y-5">
          <PriceTag product={product} size="lg" />
          <p className="text-gray-700 leading-relaxed">{product.description}</p>
          <p className="text-sm text-gray-600">
            {product.free_shipping ? 'Free shipping' : 'Shipping fee applies when shipped (see Delivery option)'}
          </p>

          {product.stock !== null && product.stock > 0 && product.stock <= 5 && (
            <p className="text-sm font-bold text-amber-700">Only {product.stock} left in stock</p>
          )}

          {isSoldOut(product) ? (
            <Notice tone="warn">This item is currently out of stock.</Notice>
          ) : lock ? (
            <LockNotice lock={lock} />
          ) : (
            <Card className="!p-5">
              <AddToCartForm product={product} clubs={clubs} />
            </Card>
          )}
          <Link href="/shop" className="inline-block text-sm font-semibold text-gray-600 hover:text-red-600">
            ← Continue shopping
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
