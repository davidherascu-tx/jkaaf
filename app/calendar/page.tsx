import { client } from '@/sanity/client';
import CalendarClient from './CalendarClient';

export const revalidate = 30;

export default async function CalendarPage() {
  // 1. Fetch Major Events
  const events = await client.fetch(`
    *[_type == "event"] {
      _id,
      title,
      "date": startDate,
      "type": "event",
      category
    }
  `);

  // 2. Fetch Simple Calendar Entries
  const simpleItems = await client.fetch(`
    *[_type == "calendarItem"] {
      _id,
      title,
      date,
      "type": "calendarItem"
    }
  `);

  // Combine both arrays into one master list for the calendar
  const combinedItems = [...events, ...simpleItems];

  return (
    <div className="bg-gray-50 min-h-screen pt-28 md:pt-40 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-6 border-b border-gray-200 pb-6 text-center lg:text-left">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
            Official Calendar
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl leading-relaxed mx-auto lg:mx-0">
            View upcoming national events, seminars, holidays, and regional grading schedules. Click on any major red event to view registration details and official documents.
          </p>
        </div>

        {/* Pass the combined data into our interactive client component */}
        <CalendarClient items={combinedItems} />

      </div>
    </div>
  );
}