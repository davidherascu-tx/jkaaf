import { client } from '@/sanity/client';
import Link from 'next/link';
import Image from 'next/image';

export const revalidate = 60; // Refresh data every 60 seconds

export default async function NewsPage() {
  const newsItems = await client.fetch(`
    *[_type == "news"] | order(publishedAt desc) {
      _id,
      title,
      "slug": slug.current,
      publishedAt,
      excerpt,
      "imageUrl": mainImage.asset->url
    }
  `);

  return (
    <div className="bg-gray-50 min-h-screen pt-28 md:pt-36 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-16 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">Latest News</h1>
          <div className="w-20 h-1.5 bg-red-600 rounded-full mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {newsItems.map((item: any) => (
            <div key={item._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-lg transition-all">
              {item.imageUrl && (
                <div className="relative w-full h-56 bg-gray-100">
                  <Image src={item.imageUrl} alt={item.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
                </div>
              )}
              <div className="p-6 flex flex-col flex-grow">
                <span className="text-xs font-bold text-gray-400 uppercase mb-3">
                  {new Date(item.publishedAt).toLocaleDateString()}
                </span>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-sm text-gray-600 mb-6 flex-grow">{item.excerpt}</p>
                <Link href={`/news/${item.slug}`} className="text-red-600 font-bold hover:text-red-800">
                  Read Full Story &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}