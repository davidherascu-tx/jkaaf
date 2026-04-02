import { client } from '@/sanity/client';
import Link from 'next/link';

interface SanityEvent {
  _id: string;
  title: string;
  category?: string;
  startDate: string;
  endDate: string;
  location: string;
}

export default async function EventsPage() {
  const events: SanityEvent[] = await client.fetch(`*[_type == "event"] | order(startDate asc)`);

  const formatDateRange = (start: string, end: string) => {
    if (!start) return '';
    
    const startDate = new Date(start + 'T00:00:00');
    const startMonth = startDate.toLocaleDateString('en-US', { month: 'short' });
    const startDay = startDate.getDate();
    const startYear = startDate.getFullYear();

    if (!end || start === end) {
      return `${startMonth} ${startDay}, ${startYear}`;
    }

    const endDate = new Date(end + 'T00:00:00');
    const endMonth = endDate.toLocaleDateString('en-US', { month: 'short' });
    const endDay = endDate.getDate();
    const endYear = endDate.getFullYear();

    if (startYear !== endYear) {
      return `${startMonth} ${startDay}, ${startYear} - ${endMonth} ${endDay}, ${endYear}`;
    } else if (startMonth !== endMonth) {
      return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${startYear}`;
    } else {
      return `${startMonth} ${startDay}-${endDay}, ${startYear}`;
    }
  };

  return (
    <div className="bg-gray-50 flex-1 w-full flex flex-col pt-28 md:pt-40 pb-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        
        <div className="mb-6 border-b border-gray-200 pb-6">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
            JKA/AF Events
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl leading-relaxed">
            Join us throughout the year for official Japan Karate Association / American Federation events. From regional training seminars and instructor qualification courses to our annual championships, find all the dates, locations, and registration details below.
          </p>
        </div>

        {events.length > 0 ? (
          <div className="space-y-4">
            {events.map((event) => (
              <div key={event._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition-all hover:shadow-md hover:border-red-200 flex flex-col md:flex-row md:items-center justify-between gap-6 group">
                
                <div className="flex flex-col flex-grow items-start">
                  
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-xs font-bold uppercase tracking-wider border border-red-100 shadow-sm transition-colors group-hover:bg-red-100">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                      {formatDateRange(event.startDate, event.endDate)}
                    </div>
                    
                    {event.category && (
                      <div className="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold uppercase tracking-wider border border-gray-200 shadow-sm">
                        {event.category}
                      </div>
                    )}
                  </div>
                  
                  <h3 className="font-bold text-gray-900 text-2xl group-hover:text-red-600 transition-colors mb-2 leading-tight">
                    {event.title}
                  </h3>
                  
                  <p className="text-gray-500 flex items-center gap-2 text-sm font-medium">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path>
                    </svg>
                    {event.location}
                  </p>
                  
                </div>
                
                <Link 
                  href={`/events/${event._id}`}
                  className="md:w-auto w-full text-center px-8 py-3 bg-white border-2 border-gray-200 text-gray-800 font-bold rounded-lg hover:border-red-600 hover:text-red-600 transition-all whitespace-nowrap"
                >
                  View Details
                </Link>

              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-100 text-center text-gray-500">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Upcoming Events</h3>
            <p className="text-gray-500">There are currently no scheduled events. Please check back later!</p>
          </div>
        )}

      </div>
    </div>
  );
}