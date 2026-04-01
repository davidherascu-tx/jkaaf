import { client } from '@/sanity/client';
import Link from 'next/link';
import Image from 'next/image';

export const revalidate = 60;

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
    <div className="bg-gray-50 pt-28 md:pt-40 pb-24 font-sans">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-6 border-b border-gray-200 pb-6">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
            News & Announcements
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl leading-relaxed font-medium">
            Stay updated with the latest news, announcements, and important updates from the Japan Karate Association / American Federation. Check here for official press releases, tournament results, and community highlights.
          </p>
        </div>

        {newsItems.length > 0 ? (
          <div className="space-y-4">
            {newsItems.map((item: any) => (
              <div key={item._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition-all hover:shadow-md hover:border-gray-300 flex flex-col md:flex-row md:items-center justify-between gap-6 group overflow-hidden">
                
                <div className="flex flex-col sm:flex-row gap-6 flex-grow items-start sm:items-center">
                  
                  {item.imageUrl && (
                    <div className="relative w-full sm:w-48 h-48 sm:h-32 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 border border-gray-200">
                      <Image 
                        src={item.imageUrl} 
                        alt={item.title} 
                        fill 
                        className="object-cover group-hover:scale-105 transition-transform duration-700" 
                        sizes="(max-width: 768px) 100vw, 200px" 
                      />
                    </div>
                  )}

                  <div className="flex flex-col flex-grow items-start">
                    
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-900 text-white rounded-lg text-xs font-bold uppercase tracking-wider border border-gray-800 shadow-sm transition-colors">
                        <svg className="w-4 h-4 text-gray-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                        {new Date(item.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </div>
                    </div>
                    
                    <h3 className="font-bold text-gray-900 text-2xl group-hover:text-red-600 transition-colors mb-2 leading-tight">
                      {item.title}
                    </h3>
                    
                    <p className="text-gray-500 text-sm font-medium line-clamp-2 max-w-2xl">
                      {item.excerpt}
                    </p>
                  </div>

                </div>
                
                <Link 
                  href={`/news/${item.slug}`}
                  className="md:w-auto w-full flex-shrink-0 text-center px-8 py-3 bg-white border-2 border-gray-200 text-gray-800 font-bold rounded-lg hover:border-red-600 hover:text-red-600 transition-all whitespace-nowrap"
                >
                  Read Article
                </Link>

              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-100 text-center text-gray-500">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path></svg>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No News Published</h3>
            <p className="text-gray-500">There are currently no announcements. Please check back later!</p>
          </div>
        )}

      </div>
    </div>
  );
}