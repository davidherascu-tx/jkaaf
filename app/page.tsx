import HeroSlider from '@/components/HeroSlider';
import { client } from '@/sanity/client';
import Link from 'next/link';

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

  // Fetch Event AND News simultaneously for better loading performance
  const [event, newsItems]: [SanityEvent | null, any[]] = await Promise.all([
    client.fetch(
      `*[_type == "event" && startDate >= $today] | order(startDate asc)[0]`,
      { today }
    ),
    client.fetch(
      `*[_type == "news"] | order(publishedAt desc)[0...2] {
        _id,
        title,
        "slug": slug.current,
        publishedAt,
        excerpt
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 mt-16 pb-16">
        
        {/* Events Column */}
        <div className="flex flex-col gap-6">
          <h2 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
            <span className="w-2 h-8 bg-red-600 rounded-full"></span>
            Featured Event
          </h2>
          
          <div className="space-y-4">
            {event ? (
              <>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition-all hover:shadow-md hover:border-red-100 flex flex-col">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
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
                  
                  <h3 className="font-bold text-gray-900 text-xl leading-tight mb-2">{event.title}</h3>
                  <p className="text-sm text-gray-500 mb-4 flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path></svg>
                    {event.location}
                  </p>
                  
                  <Link 
                    href={`/events/${event._id}`}
                    className="block text-center w-full text-sm font-bold text-red-600 bg-red-50 py-3 rounded-lg hover:bg-red-600 hover:text-white transition-colors"
                  >
                    View Details
                  </Link>
                </div>

                <Link 
                  href="/events"
                  className="block text-center w-full text-sm font-bold text-white bg-black py-4 rounded-xl hover:bg-gray-800 transition-colors"
                >
                  See all events
                </Link>
              </>
            ) : (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center text-gray-500">
                No upcoming events scheduled.
              </div>
            )}
          </div>
        </div>
        
        {/* NEW: Dynamic News Column */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
              <span className="w-2 h-8 bg-red-600 rounded-full"></span>
              Latest News
            </h2>
            <Link href="/news" className="text-sm font-bold text-red-600 hover:text-red-800 transition-colors uppercase tracking-wider">
              View All &rarr;
            </Link>
          </div>
          
          <div className="space-y-4">
            {newsItems && newsItems.length > 0 ? (
              newsItems.map((item) => (
                <div key={item._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition-all hover:shadow-md hover:border-red-100 flex flex-col group h-full">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                    {new Date(item.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <h3 className="font-bold text-gray-900 text-lg leading-tight mb-3 group-hover:text-red-600 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {item.excerpt}
                  </p>
                  <Link 
                    href={`/news/${item.slug}`}
                    className="text-sm font-bold text-red-600 hover:text-red-800 transition-colors mt-auto inline-flex items-center gap-1"
                  >
                    Read Article
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                  </Link>
                </div>
              ))
            ) : (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center text-gray-500 min-h-[250px] flex items-center justify-center">
                No news published yet.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}