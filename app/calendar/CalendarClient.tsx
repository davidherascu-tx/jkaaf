'use client';

import { useState } from 'react';
import Link from 'next/link';

interface CalendarData {
  _id: string;
  title: string;
  date: string;
  type: 'event' | 'calendarItem';
  category?: string; // For events
}

export default function CalendarClient({ items }: { items: CalendarData[] }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Calendar Logic
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sun, 1 = Mon, etc.
  
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const handlePrevMonth = () => setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentYear, currentMonth + 1, 1));

  // Generate blank spaces for the start of the month
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => <div key={`blank-${i}`} className="bg-gray-50/50 border border-gray-100 p-2 min-h-[100px] sm:min-h-[120px]"></div>);

  // Generate the actual days
  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    // Format date to match Sanity's YYYY-MM-DD
    const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    // Find items for this specific day
    const dayItems = items.filter(item => item.date === dateString);
    const isToday = dateString === new Date().toISOString().split('T')[0];

    return (
      <div key={day} className={`border border-gray-200 p-2 min-h-[100px] sm:min-h-[140px] transition-colors ${isToday ? 'bg-red-50/30' : 'bg-white hover:bg-gray-50'}`}>
        <div className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full mb-2 ${isToday ? 'bg-red-600 text-white shadow-sm' : 'text-gray-700'}`}>
          {day}
        </div>
        
        <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[100px] custom-scrollbar">
          {dayItems.map(item => (
            item.type === 'event' ? (
              <Link 
                key={item._id} 
                href={`/events/${item._id}`}
                className="block text-xs font-bold bg-red-600 text-white px-2 py-1.5 rounded shadow-sm hover:bg-red-700 transition-colors truncate"
              >
                🏆 {item.title}
              </Link>
            ) : (
              <div key={item._id} className="text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-200 px-2 py-1.5 rounded truncate">
                {item.title}
              </div>
            )
          ))}
        </div>
      </div>
    );
  });

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mt-8">
      
      {/* Calendar Header Controls */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
          {monthNames[currentMonth]} {currentYear}
        </h2>
        <div className="flex gap-2">
          <button onClick={handlePrevMonth} className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 hover:text-red-600 transition-colors font-bold shadow-sm">
            &larr; Prev
          </button>
          <button onClick={handleNextMonth} className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 hover:text-red-600 transition-colors font-bold shadow-sm">
            Next &rarr;
          </button>
        </div>
      </div>

      {/* Days of the Week Header */}
      <div className="grid grid-cols-7 bg-white border-b border-gray-200">
        {dayNames.map(day => (
          <div key={day} className="py-3 text-center text-xs sm:text-sm font-bold uppercase tracking-wider text-gray-500 border-r border-gray-100 last:border-0">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 bg-gray-100 gap-px">
        {blanks}
        {days}
      </div>

      {/* Legend */}
      <div className="p-4 bg-white border-t border-gray-200 flex flex-wrap gap-4 text-sm font-medium text-gray-600">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-red-600 rounded-full"></span> Major Events (Clickable)
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-gray-300 rounded-full"></span> General Calendar Entries
        </div>
      </div>
    </div>
  );
}