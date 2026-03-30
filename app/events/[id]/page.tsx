import { client } from '@/sanity/client';
import Link from 'next/link';

interface EventDetails {
  title: string;
  category?: string; // <-- Added category
  startDate: string;
  endDate: string;
  location: string;
  details: string;
  registrationLink: string;
  imageUrl: string | null;
  pdfUrl: string | null;
}

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  const resolvedParams = await Promise.resolve(params);
  const eventId = resolvedParams.id;

  // Added category to the GROQ query below!
  const event: EventDetails = await client.fetch(`
    *[_type == "event" && _id == $id][0] {
      title,
      category, 
      startDate,
      endDate,
      location,
      details,
      registrationLink,
      "imageUrl": eventImage.asset->url,
      "pdfUrl": infoPdf.asset->url
    }
  `, { id: eventId });

  if (!event) {
    return (
      <div className="min-h-screen pt-40 flex flex-col items-center bg-gray-50">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Event not found.</h1>
        <Link href="/events" className="text-red-600 hover:text-red-800 font-bold transition-colors">
          &larr; Return to all events
        </Link>
      </div>
    );
  }

  const formatDateRange = (start: string, end: string) => {
    if (!start) return '';
    const startDate = new Date(start + 'T00:00:00');
    const startMonth = startDate.toLocaleDateString('en-US', { month: 'short' });
    const startDay = startDate.getDate();
    const startYear = startDate.getFullYear();

    if (!end || start === end) return `${startMonth} ${startDay}, ${startYear}`;

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
    <div className="bg-white min-h-screen pt-28 md:pt-40 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <Link 
          href="/events" 
          className="inline-flex items-center gap-2 text-red-600 hover:text-red-800 font-semibold text-sm mb-8 transition-colors group"
        >
          <span className="transform group-hover:-translate-x-1 transition-transform">&larr;</span> 
          Back to all events
        </Link>

        {/* Header Section */}
        <div className="mb-10">
          
          {/* NEW Category Badge displayed above the title */}
          {event.category && (
            <div className="mb-4">
              <span className="inline-block px-4 py-1.5 bg-gray-100 text-gray-700 text-sm font-bold uppercase tracking-widest rounded-lg border border-gray-200">
                {event.category}
              </span>
            </div>
          )}

          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight tracking-tight">
            {event.title}
          </h1>
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 text-gray-600 border-l-4 border-red-600 pl-4 py-1 bg-gray-50 rounded-r-lg">
            <div className="flex items-center gap-2 font-medium">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              {formatDateRange(event.startDate, event.endDate)}
            </div>
            
            <div className="flex items-center gap-2 font-medium">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path>
              </svg>
              {event.location}
            </div>
          </div>
        </div>

        {event.imageUrl && (
          <div className="w-full bg-gray-50 rounded-2xl mb-12 flex justify-center p-4 border border-gray-100 shadow-inner">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={event.imageUrl} 
              alt={`${event.title} Official Poster`} 
              className="max-w-full h-auto max-h-[700px] object-contain rounded-xl shadow-sm" 
            />
          </div>
        )}

        {event.registrationLink && (
          <div className="mb-12 bg-red-50 border border-red-100 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">Ready to join?</h3>
              <p className="text-gray-600 text-sm">Secure your spot for this event by registering online.</p>
            </div>
            <a 
              href={event.registrationLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full sm:w-auto text-center bg-red-600 text-white font-bold px-8 py-3.5 rounded-xl hover:bg-red-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              Register Now
            </a>
          </div>
        )}

        {event.details && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-red-600 rounded-full"></span>
              Event Details
            </h2>
            <div className="prose max-w-none text-gray-700 whitespace-pre-line leading-relaxed text-lg bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm">
              {event.details}
            </div>
          </div>
        )}

        {event.pdfUrl && (
          <div className="mt-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-red-600 rounded-full"></span>
                Official Documents
              </h2>
              
              <a 
                href={event.pdfUrl} 
                download
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 text-sm font-bold text-gray-700 hover:text-red-600 transition-colors bg-gray-50 border border-gray-200 px-5 py-2.5 rounded-lg hover:bg-red-50 hover:border-red-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                Download PDF
              </a>
            </div>
            
            <div className="bg-gray-100 p-2 sm:p-3 rounded-2xl shadow-inner h-[600px] md:h-[800px]">
              <iframe 
                src={event.pdfUrl} 
                className="w-full h-full rounded-xl border border-gray-300 bg-white"
                title={`${event.title} Information PDF`}
              />
            </div>
          </div>
        )}

      </div>
    </div>
  );
}