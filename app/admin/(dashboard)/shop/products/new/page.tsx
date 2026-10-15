import ProductForm from '@/components/shop/ProductForm';
import { requireAdmin } from '@/lib/auth';

export default async function NewProduct() {
  await requireAdmin();
  return (
    <>
      <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Add product</h1>
      <ProductForm product={null} />
    </>
  );
}
