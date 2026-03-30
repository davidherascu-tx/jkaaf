import { client } from '@/sanity/client';
import DojoListClient from './DojoListClient';

export const revalidate = 30; 

export default async function DojosPage() {
  // Ordered by state (A-Z), then Primary Dojos first, then name (A-Z)
  const dojos = await client.fetch(`
    *[_type == "dojo"] | order(state asc, isPrimary desc, name asc) {
      _id,
      isPrimary,
      name,
      instructor,
      address,
      city,
      state,
      zip,
      phone,
      email,
      website
    }
  `);

  return (
    <div className="bg-gray-50 min-h-screen pt-28 md:pt-40 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-6 border-b border-gray-200 pb-6">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
            Registered Dojos
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl leading-relaxed">
            Find an official Japan Karate Association / American Federation dojo near you. Search by instructor, city, or dojo name, or use the state filter to browse locations.
          </p>
        </div>

        {/* Directory Client Component */}
        <DojoListClient dojos={dojos} />

      </div>
    </div>
  );
}