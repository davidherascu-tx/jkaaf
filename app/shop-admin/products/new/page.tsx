import ProductForm from '@/components/shop/ProductForm';

export default function NewProduct() {
  return (
    <>
      <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Add product</h1>
      <ProductForm product={null} />
    </>
  );
}
