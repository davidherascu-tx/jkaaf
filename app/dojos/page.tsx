import { client } from '@/sanity/client';
import DojoListClient from './DojoListClient';

export const revalidate = 30; 

export default async function DojosPage() {
  const dojos = await client.fetch(`
    *[_type == "dojo"] | order(state asc, isPrimary desc, name asc) {
      _id,
      isPrimary,
      isCollegiateClub,
      name,
      instructor,
      address,
      city,
      state,
      zip,
      contactAddress,
      contactCity,
      contactState,
      contactZip,
      phone,
      email,
      website
    }
  `);

  return (
    <div className="bg-gray-50 flex-1 w-full flex flex-col pt-28 md:pt-40 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <DojoListClient dojos={dojos} />
      </div>
    </div>
  );
}