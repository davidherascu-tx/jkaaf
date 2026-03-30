'use client';

import { useState } from 'react';

interface Dojo {
  _id: string;
  isPrimary?: boolean; // Still here for TypeScript, but hidden from the UI!
  name: string;
  instructor: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  email: string;
  website: string;
}

export default function DojoListClient({ dojos }: { dojos: Dojo[] }) {
  const availableStates = Array.from(new Set(dojos.map((d) => d.state))).sort();
  
  // Set initial state to empty so no dojos show up immediately
  const [selectedState, setSelectedState] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const hasSearch = searchQuery.trim() !== '';
  const hasState = selectedState !== '' && selectedState !== 'All';
  const isInitialLoad = selectedState === '' && !hasSearch;

  // Filter Logic
  let filteredDojos: Dojo[] = [];

  if (!isInitialLoad) {
    filteredDojos = dojos.filter((dojo) => {
      // 1. Check if it matches the selected state (if a state is selected)
      const matchesState = hasState ? dojo.state === selectedState : true;
      
      // 2. Check if it matches the text search (if text is entered)
      const matchesSearch = hasSearch ? (
        (dojo.name && dojo.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (dojo.city && dojo.city.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (dojo.instructor && dojo.instructor.toLowerCase().includes(searchQuery.toLowerCase()))
      ) : true;

      return matchesState && matchesSearch;
    });
  }

  return (
    <div className="mt-8">
      
      {/* Filters Section (Search Bar + State Dropdown) */}
      <div className="mb-10 flex flex-col md:flex-row gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        
        {/* Text Search Input */}
        <div className="flex-grow relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>
          <input 
            type="text" 
            placeholder="Search by Dojo, City, or Instructor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-base md:text-lg rounded-xl focus:ring-red-600 focus:border-red-600 block pl-12 p-3.5 transition-colors outline-none"
          />
        </div>

        {/* State Dropdown */}
        <div className="md:w-64 flex-shrink-0 relative">
          <select 
            value={selectedState} 
            onChange={(e) => setSelectedState(e.target.value)}
            className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-900 text-base md:text-lg font-bold rounded-xl focus:ring-red-600 focus:border-red-600 block p-3.5 pr-10 cursor-pointer outline-none transition-colors"
          >
            <option value="" disabled>Select a State</option>
            <option value="All">All States</option>
            {availableStates.map((state) => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>
        </div>
      </div>

      {/* Dynamic Content Area */}
      {isInitialLoad ? (
        // Prompt user to search or select a state
        <div className="py-20 flex flex-col items-center justify-center text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Find a Dojo</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            Please use the search bar above or select a state from the dropdown to view our official registered dojos.
          </p>
        </div>
      ) : filteredDojos.length > 0 ? (
        // Grid of Dojo Cards
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDojos.map((dojo) => (
            <div 
              key={dojo._id} 
              // Removed the red border highlight for Primary. They all look uniform now!
              className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-red-200 transition-all flex flex-col h-full group"
            >
              
              <div className="mb-4 flex justify-between items-start gap-2">
                <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-lg bg-gray-100 text-gray-700">
                  {dojo.state}
                </span>
                {/* Primary Badge HTML was completely removed here */}
              </div>

              <h3 className="text-2xl font-extrabold text-gray-900 leading-tight mb-4 group-hover:text-red-600 transition-colors">
                {dojo.name}
              </h3>
              
              <div className="mb-6 flex-grow">
                <p className="text-sm font-bold text-red-600 uppercase tracking-wide mb-3 flex items-center gap-2 border-b border-gray-50 pb-3">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                  Instr: {dojo.instructor}
                </p>
                <div className="space-y-3 text-gray-600 text-sm font-medium mt-4">
                  <p className="flex items-start gap-2">
                    <svg className="w-4 h-4 mt-0.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    <span>{dojo.address}<br/>{dojo.city}, {dojo.state} {dojo.zip}</span>
                  </p>
                  {dojo.phone && (
                    <p className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                      {dojo.phone}
                    </p>
                  )}
                  {dojo.email && (
                    <p className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                      {dojo.email}
                    </p>
                  )}
                </div>
              </div>

              {dojo.website && (
                <a 
                  href={dojo.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full block font-bold py-3 rounded-xl transition-colors text-sm text-center border mt-auto bg-gray-50 text-gray-800 border-gray-200 hover:border-red-600 hover:bg-red-600 hover:text-white"
                >
                  Visit Website &rarr;
                </a>
              )}
            </div>
          ))}
        </div>
      ) : (
        // Zero results found
        <div className="py-20 flex flex-col items-center justify-center text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
          <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No dojos found</h3>
          <p className="text-gray-500">Try adjusting your search terms or selecting a different state.</p>
        </div>
      )}
    </div>
  );
}