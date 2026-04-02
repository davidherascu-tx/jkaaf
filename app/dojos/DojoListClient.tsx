'use client';

import { useState } from 'react';

const STATE_NAMES: Record<string, string> = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California',
  CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', FL: 'Florida', GA: 'Georgia',
  HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa',
  KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland',
  MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi',
  MO: 'Missouri', MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire',
  NJ: 'New Jersey', NM: 'New Mexico', NY: 'New York', NC: 'North Carolina',
  ND: 'North Dakota', OH: 'Ohio', OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania',
  RI: 'Rhode Island', SC: 'South Carolina', SD: 'South Dakota', TN: 'Tennessee',
  TX: 'Texas', UT: 'Utah', VT: 'Vermont', VA: 'Virginia', WA: 'Washington',
  WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming', DC: 'District of Columbia',
  PR: 'Puerto Rico'
};

const getFullStateName = (abbr: string) => {
  if (!abbr) return '';
  const cleanAbbr = abbr.trim().toUpperCase();
  return STATE_NAMES[cleanAbbr] || cleanAbbr;
};

interface Dojo {
  _id: string;
  isPrimary?: boolean; 
  isCollegiateClub?: boolean; 
  name: string;
  instructor: string;
  address?: string; 
  city?: string;
  state: string;
  zip?: string;
  contactAddress?: string; 
  contactCity?: string;
  contactState?: string;
  contactZip?: string;
  phone?: string;
  email?: string;
  website?: string;
}

export default function DojoListClient({ dojos }: { dojos: Dojo[] }) {
  const availableStates = Array.from(
    new Set(dojos.map((d) => d.state?.trim().toUpperCase()).filter(Boolean))
  ).sort();
  
  const [selectedState, setSelectedState] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const hasSearch = searchQuery.trim() !== '';

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    
    if (val.trim() !== '') {
      setSelectedState('All');
    }
  };

  const filteredDojos = dojos.filter((dojo) => {
    if (hasSearch) {
      const searchLower = searchQuery.toLowerCase();
      return (
        (dojo.name && dojo.name.toLowerCase().includes(searchLower)) ||
        (dojo.city && dojo.city.toLowerCase().includes(searchLower)) ||
        (dojo.instructor && dojo.instructor.toLowerCase().includes(searchLower))
      );
    }

    if (selectedState === 'All') return true;
    if (selectedState !== '') {
      return dojo.state?.trim().toUpperCase() === selectedState;
    }

    return false;
  });

  let headingText = "Registered Dojos";
  if (hasSearch) {
    headingText = "Search Results";
  } else if (selectedState !== '' && selectedState !== 'All') {
    headingText = `Registered Dojos in ${getFullStateName(selectedState)}`;
  } else if (selectedState === 'All') {
    headingText = "All Registered Dojos";
  }

  return (
    <div>
      <div className="mb-6 border-b border-gray-200 pb-6">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight transition-all">
          {headingText}
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl leading-relaxed">
          Find an official Japan Karate Association / American Federation dojo near you. Search by instructor, city, or dojo name, or use the state filter to browse locations.
        </p>
      </div>

      <div className="mb-10 flex flex-col md:flex-row gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        
        <div className="flex-grow relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>
          <input 
            type="text" 
            placeholder="Search globally by Name, City, or Instructor..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-base md:text-lg rounded-xl focus:ring-red-600 focus:border-red-600 block pl-12 p-3.5 transition-colors outline-none"
          />
        </div>

        <div className="md:w-64 flex-shrink-0 relative">
          <select 
            value={selectedState} 
            onChange={(e) => {
              setSelectedState(e.target.value);
              setSearchQuery(''); 
            }}
            className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-900 text-base md:text-lg font-bold rounded-xl focus:ring-red-600 focus:border-red-600 block p-3.5 pr-10 cursor-pointer outline-none transition-colors"
          >
            <option value="">-- Select a State --</option>
            <option value="All">All States</option>
            {availableStates.map((state) => (
              <option key={state} value={state}>
                {getFullStateName(state)}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>
        </div>
      </div>

      {filteredDojos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDojos.map((dojo) => (
            <div 
              key={dojo._id} 
              className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-red-200 transition-all flex flex-col h-full group relative overflow-hidden"
            >
              
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-lg bg-gray-100 text-gray-700">
                  {getFullStateName(dojo.state)}
                </span>
                
                {dojo.isCollegiateClub && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-lg bg-blue-50 text-blue-700 border border-blue-100">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72l5 2.73 5-2.73v3.72z"/></svg>
                    Collegiate Club
                  </span>
                )}
              </div>

              <h3 className="text-2xl font-extrabold text-gray-900 leading-tight mb-4 group-hover:text-red-600 transition-colors">
                {dojo.name}
              </h3>
              
              <div className="mb-6 flex-grow">
                <p className="text-sm font-bold text-red-600 uppercase tracking-wide mb-3 flex items-center gap-2 border-b border-gray-50 pb-3">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                  Instr: {dojo.instructor}
                </p>
                
                <div className="space-y-4 text-gray-600 text-sm font-medium mt-4">
                  
                  {dojo.address && (
                    <div className="flex items-start gap-2">
                      <svg className="w-4 h-4 mt-0.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                      <div>
                        <span className="text-xs text-gray-400 uppercase tracking-wider block mb-0.5">Dojo Location</span>
                        {dojo.address}
                        {(dojo.city || dojo.state || dojo.zip) && (
                          <>
                            <br/>
                            {dojo.city ? `${dojo.city}, ` : ''}{dojo.state} {dojo.zip || ''}
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {dojo.contactAddress && (
                    <div className="flex items-start gap-2 pt-2 border-t border-gray-50">
                      <svg className="w-4 h-4 mt-0.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                      <div>
                        <span className="text-xs text-gray-400 uppercase tracking-wider block mb-0.5">Contact / Mailing</span>
                        {dojo.contactAddress}
                        {(dojo.contactCity || dojo.contactState || dojo.contactZip) && (
                          <>
                            <br/>
                            {dojo.contactCity ? `${dojo.contactCity}, ` : ''}{dojo.contactState || ''} {dojo.contactZip || ''}
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {dojo.phone && (
                    <p className="flex items-center gap-2 pt-2 border-t border-gray-50">
                      <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                      {dojo.phone}
                    </p>
                  )}
                  {dojo.email && (
                    <p className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"></path></svg>
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
      ) : (selectedState === '' && !hasSearch) ? (
        <div className="py-16 flex flex-col items-center justify-center text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
          <svg className="w-16 h-16 text-red-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"></path></svg>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Find a Dojo</h3>
          <p className="text-gray-500 max-w-md">Please select a state from the dropdown menu or use the search bar to browse registered JKA/AF dojos.</p>
        </div>
      ) : (
        <div className="py-20 flex flex-col items-center justify-center text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
          <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No dojos found</h3>
          <p className="text-gray-500">Try adjusting your search terms or selecting a different state.</p>
        </div>
      )}
    </div>
  );
}