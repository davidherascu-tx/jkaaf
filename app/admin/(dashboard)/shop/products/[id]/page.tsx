import { notFound } from 'next/navigation';
import { getProductById } from '@/lib/shop';
import ProductForm from '@/components/shop/ProductForm';

export default async function EditProduct({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = /^\d+$/.test(id) ? await getProductById(Number(id)) : null;
  if (!product) notFound();
  return (
    <>
      <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Edit product</h1>
      <ProductForm product={product} />
    </>
  );
}
