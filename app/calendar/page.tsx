import { client } from '@/sanity/client';
import CalendarClient from './CalendarClient';

// Refresh the calendar data every 30 seconds
export const revalidate = 30;

export default async function CalendarPage() {
  // Fetch both Major Events and local Calendar Entries
  const query = `*[_type in ["event", "calendarItem"]] {
    _id,
    title,
    startDate,
    endDate,
    "type": _type,
    "entryType": type,
    category
  }`;

  const allItems = await client.fetch(query);

  return (
    <div className="bg-gray-50 min-h-screen pt-28 md:pt-40 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-6 border-b border-gray-200 pb-6 text-center lg:text-left">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
            Official Calendar
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl leading-relaxed mx-auto lg:mx-0">
            View upcoming national events, seminars, holidays, and regional schedules.
          </p>
        </div>

        {/* Pass the items to the client component */}
        <CalendarClient items={allItems || []} />

      </div>
    </div>
  );
}