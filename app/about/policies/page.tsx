export default function PoliciesPage() {
  return (
    <div className="bg-gray-50 min-h-screen pt-40 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-200">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">Federation Policies</h1>
        <div className="w-20 h-1.5 bg-red-600 rounded-full mb-8"></div>
        
        <div className="prose prose-lg text-gray-600 max-w-none">
          <p className="mb-4">
            The rules, guidelines, and structural policies that govern the JKA/AF and ensure top quality traditional karate is maintained across all affiliated dojos.
          </p>
        </div>
      </div>
    </div>
  );
}