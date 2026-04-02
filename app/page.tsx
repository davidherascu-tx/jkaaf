import HeroSlider from '@/components/HeroSlider';
import { client } from '@/sanity/client';
import Link from 'next/link';
import Image from 'next/image';

interface SanityEvent {
  _id: string;
  title: string;
  startDate: string;
  endDate: string;
  location: string;
  category?: string;
}

export default async function Home() {
  const today = new Date().toISOString().split('T')[0];

  // Fetch Event AND News simultaneously.
  const [event, newsItems]: [SanityEvent | null, any[]] = await Promise.all([
    client.fetch(
      `*[_type == "event" && startDate >= $today] | order(startDate asc)[0]`,
      { today }
    ),
    client.fetch(
      // Fetch 3 items instead of 2
      `*[_type == "news"] | order(publishedAt desc)[0...3] {
        _id,
        title,
        "slug": slug.current,
        publishedAt,
        excerpt,
        "imageUrl": mainImage.asset->url
      }`
    )
  ]);

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString + 'T00:00:00').toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  return (
    <div className="bg-gray-50 pt-28">
      <HeroSlider />
      
      {/* Intro Section */}
      <section className="bg-white pt-8 pb-20 lg:pt-10 lg:pb-24 border-b border-gray-200 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-30 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-red-50 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-20 items-center">
            <div className="lg:w-1/3 w-full">
              <span className="text-red-600 font-bold tracking-wider uppercase text-sm mb-3 block">
                About Our Federation
              </span>
              <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-6">
                Welcome to <br/>
                <span className="text-red-600">JKA/AF</span>
              </h1>
              <div className="w-20 h-1.5 bg-red-600 rounded-full"></div>
            </div>
            <div className="lg:w-2/3 w-full">
              <p className="text-lg md:text-xl text-gray-600 leading-relaxed font-medium">
                The Japan Karate Association/American Federation is an affiliation of JKA clubs across the Americas, founded by Sensei Takayuki Mikami (9th dan JKA) in 2009. We promote top quality traditional karate through hosting regular training, competition & instructor course events and conducting rank and qualification examinations affiliated with the Japan Karate Association headquartered in Tokyo, Japan.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Featured Event and Latest News Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 mt-16 pb-24">
        
        {/* Events Column */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-extrabold text-gray-900 flex items-center gap-3">
              <span className="w-2 h-8 bg-red-600 rounded-full"></span>
              Featured Event
            </h2>
            <Link href="/events" className="text-sm font-bold text-red-600 hover:text-red-800 transition-colors uppercase tracking-wider flex items-center gap-1">
              View All Events <span className="text-lg leading-none">&rsaquo;</span>
            </Link>
          </div>
          
          <div className="space-y-4">
            {event ? (
              <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 transition-all hover:shadow-md hover:border-red-100 flex flex-col group h-full">
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-xs font-bold uppercase tracking-wider border border-red-100">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    {formatDate(event.startDate)} 
                    {event.endDate && event.endDate !== event.startDate && ` - ${formatDate(event.endDate)}`}
                  </div>

                  {event.category && (
                    <div className="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold uppercase tracking-wider border border-gray-200">
                      {event.category}
                    </div>
                  )}
                </div>
                
                <h3 className="font-extrabold text-gray-900 text-2xl leading-tight mb-3 group-hover:text-red-600 transition-colors">{event.title}</h3>
                <p className="text-sm font-medium text-gray-500 mb-8 flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path></svg>
                  {event.location}
                </p>
                
                <Link 
                  href={`/events/${event._id}`}
                  className="block text-center w-full text-sm font-bold text-red-600 bg-red-50 py-3.5 rounded-xl hover:bg-red-600 hover:text-white transition-colors mt-auto"
                >
                  View Details
                </Link>
              </div>
            ) : (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center text-gray-500">
                No upcoming events scheduled.
              </div>
            )}
          </div>
        </div>
        
        {/* Dynamic News Column */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-extrabold text-gray-900 flex items-center gap-3">
              <span className="w-2 h-8 bg-red-600 rounded-full"></span>
              Latest News
            </h2>
            <Link href="/news" className="text-sm font-bold text-red-600 hover:text-red-800 transition-colors uppercase tracking-wider flex items-center gap-1">
              View All News <span className="text-lg leading-none">&rsaquo;</span>
            </Link>
          </div>
          
          <div className="space-y-4">
            {newsItems && newsItems.length > 0 ? (
              newsItems.map((item) => (
                <Link key={item._id} href={`/news/${item.slug}`} className="block bg-white rounded-2xl shadow-sm border border-gray-100 transition-all hover:shadow-md hover:border-red-100 overflow-hidden group p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center h-full">
                    
                    {/* Left: Image & Text Wrapper */}
                    <div className="flex flex-row gap-4 w-full flex-grow items-center">
                      {/* Thumbnail Image */}
                      {item.imageUrl && (
                        <div className="w-20 h-20 sm:w-24 sm:h-24 relative rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                          <Image src={item.imageUrl} alt={item.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                        </div>
                      )}

                      {/* Content */}
                      <div className="flex flex-col justify-center flex-grow">
                        
                        {/* THE NEW GREY DATE DESIGN */}
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white text-gray-500 rounded-md text-xs font-bold border border-gray-200 shadow-sm w-fit mb-2">
                          <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                          {new Date(item.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                        
                        <h3 className="font-extrabold text-gray-900 text-lg leading-snug mb-1 group-hover:text-red-600 transition-colors line-clamp-2">
                          {item.title}
                        </h3>
                        
                        <p className="text-sm font-medium text-gray-500 line-clamp-1">
                          {item.excerpt}
                        </p>
                      </div>
                    </div>
                    
                    {/* YOUR ORIGINAL READ MORE BUTTON */}
                    <div className="w-full sm:w-auto flex-shrink-0 mt-2 sm:mt-0">
                      <div className="flex items-center justify-center gap-2 px-5 py-3 sm:py-2.5 bg-gray-50 border border-gray-200 text-gray-800 rounded-xl text-sm font-bold group-hover:bg-red-600 group-hover:text-white group-hover:border-red-600 transition-all shadow-sm group-hover:shadow text-center">
                        Read more <span className="text-lg leading-none">&rsaquo;</span>
                      </div>
                    </div>

                  </div>
                </Link>
              ))
            ) : (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center text-gray-500 min-h-[250px] flex items-center justify-center">
                No news published yet.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}