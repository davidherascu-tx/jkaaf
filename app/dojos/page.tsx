import { client } from '@/sanity/client';
import DojoListClient from './DojoListClient';

export const revalidate = 30; 

export default async function DojosPage() {
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
    <div className="bg-gray-50 flex-1 w-full flex flex-col pt-28 md:pt-40 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        
        <div className="mb-6 border-b border-gray-200 pb-6">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
            Registered Dojos
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl leading-relaxed">
            Find an official Japan Karate Association / American Federation dojo near you. Search by instructor, city, or dojo name, or use the state filter to browse locations.
          </p>
        </div>

        <DojoListClient dojos={dojos} />

      </div>
    </div>
  );
}