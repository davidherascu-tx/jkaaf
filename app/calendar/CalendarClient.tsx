'use client';

import { useState } from 'react';
import Link from 'next/link';

// Define the data structure for TypeScript
interface CalendarData {
  _id: string;
  title: string;
  startDate: string;
  endDate?: string;
  type: 'event' | 'calendarItem';
  category?: string; 
  entryType?: string; 
}

// Destructure { items } to fix the 'IntrinsicAttributes' error
export default function CalendarClient({ items }: { items: CalendarData[] }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const handlePrevMonth = () => setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentYear, currentMonth + 1, 1));

  // Style logic for the new Entry Types
  const getEntryStyles = (item: CalendarData) => {
    const category = item.entryType || item.category;
    switch (category) {
      case 'Seminar': return 'bg-blue-600 text-white border-blue-700';
      case 'Championship': return 'bg-amber-500 text-white border-amber-600';
      case 'Holiday / closed': return 'bg-red-700 text-white border-red-800';
      case 'Local event': return 'bg-emerald-600 text-white border-emerald-700';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => (
    <div key={`blank-${i}`} className="bg-gray-50/50 border border-gray-100 p-2 min-h-[120px]"></div>
  ));

  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const gridDate = new Date(dateString + 'T00:00:00');
    
    // Filter items to see if this day falls within their start/end range
    const dayItems = items.filter(item => {
      if (!item.startDate) return false;
      const start = new Date(item.startDate + 'T00:00:00');
      const end = item.endDate ? new Date(item.endDate + 'T23:59:59') : new Date(item.startDate + 'T23:59:59');
      return gridDate >= start && gridDate <= end;
    });

    const isToday = dateString === new Date().toISOString().split('T')[0];

    return (
      <div key={day} className={`border border-gray-200 p-2 min-h-[140px] ${isToday ? 'bg-red-50/30' : 'bg-white hover:bg-gray-50'}`}>
        <div className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full mb-2 ${isToday ? 'bg-red-600 text-white' : 'text-gray-700'}`}>
          {day}
        </div>
        
        <div className="flex flex-col gap-1 overflow-y-auto max-h-[100px] custom-scrollbar">
          {dayItems.map(item => (
            item.type === 'event' ? (
              <Link 
                key={item._id} 
                href={`/events/${item._id}`}
                className="block text-[10px] sm:text-xs font-bold bg-red-600 text-white px-2 py-1 rounded truncate hover:bg-red-700 shadow-sm"
              >
                🏆 {item.title}
              </Link>
            ) : (
              <div 
                key={item._id} 
                className={`text-[10px] sm:text-xs font-semibold px-2 py-1 rounded border truncate shadow-xs ${getEntryStyles(item)}`}
              >
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
      <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
          {monthNames[currentMonth]} {currentYear}
        </h2>
        <div className="flex gap-2">
          <button onClick={handlePrevMonth} className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 font-bold shadow-sm">
            &larr; Prev
          </button>
          <button onClick={handleNextMonth} className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 font-bold shadow-sm">
            Next &rarr;
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 bg-white border-b border-gray-200">
        {dayNames.map(day => (
          <div key={day} className="py-3 text-center text-xs font-bold uppercase text-gray-500 border-r border-gray-100 last:border-0">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 bg-gray-100 gap-px">
        {blanks}
        {days}
      </div>

      <div className="p-4 bg-white border-t border-gray-200 flex flex-wrap gap-4 text-xs font-bold text-gray-600">
        <div className="flex items-center gap-2"><span className="w-3 h-3 bg-blue-600 rounded"></span> Seminar</div>
        <div className="flex items-center gap-2"><span className="w-3 h-3 bg-amber-500 rounded"></span> Championship</div>
        <div className="flex items-center gap-2"><span className="w-3 h-3 bg-red-700 rounded"></span> Holiday / Closed</div>
        <div className="flex items-center gap-2"><span className="w-3 h-3 bg-emerald-600 rounded"></span> Local Event</div>
        <div className="flex items-center gap-2"><span className="w-3 h-3 bg-red-600 rounded"></span> Major Event</div>
      </div>
    </div>
  );
}