import Image from 'next/image';

// --- DATA STRUCTURE ---
// All images have been updated to use the .webp extension

const executiveBoard = [
  { name: 'Jerry Kattawar, Jr', role: 'President', dan: '7th Dan', education: 'Delta State University', dojo: 'LKA, Louisiana', profession: 'UPS Manager (Retired)', image: '/board/jerry_kattawar.webp' },
  { name: 'Jose Ferrand', role: 'Vice Chairman', dan: '7th Dan', education: 'Miami High School', dojo: 'Miami Shotokan Club, Florida', profession: 'Martial Arts Instructor', image: '/board/jose_ferrand.webp' },
  { name: 'Kyriakos Papadopoulos', role: 'Communication Director', dan: '7th Dan', education: 'Columbia University', dojo: 'NOSA, Louisiana', profession: 'Professor of Chemical Engr', image: '/board/kyriakos_papadopoulos.webp' },
  { name: 'Joey Giluso', role: 'Treasurer/Tournament Director', dan: '6th Dan', education: 'Avaya University', dojo: 'JKA of Ponchatoula, Louisiana', profession: 'Entrepreneur', image: '/board/joey_giluso.webp' },
  { name: 'Scott Decuir', role: 'Secretary', dan: '6th Dan', education: 'Tulane University of Law', dojo: 'New Iberia Karate Institute, Louisiana', profession: 'Attorney', image: '/board/scott_decuir.webp' },
  { name: 'Vey Laplace', role: 'Managing Director', dan: '2nd Dan', education: 'Louisiana State University', dojo: 'LKA, Louisiana', profession: 'Attorney', image: '/board/vey_laplace.webp' },
  { name: 'Maria Hrabec', role: 'Communication Committee', dan: '6th Dan', education: 'Rutgers University', dojo: 'LKA, Louisiana', profession: 'Operations Mgr', image: '/board/maria_hrabec.webp' },
  { name: 'Ferdinand Torres', role: 'Youth Development', dan: '5th Dan', education: 'WPC Philippines', dojo: 'JKA Maine, Maine', profession: 'Senior IT Analyst', image: '/board/ferdinand_torres.webp' },
  { name: 'Bill Staten', role: 'Auditing Director', dan: '4th Dan', education: 'Delta State University', dojo: 'Greenville YMCA, Mississippi', profession: 'Federal Court Officer', image: '/board/bill_staten.webp' },
];

const boardMembers = [
  { name: 'Christina Foo', role: 'Business & Travel Director', dan: '6th Dan', education: 'University of Miami', dojo: 'JKA Northern California, California', profession: 'Data Analyst (Retired)', image: '/board/christina_foo.webp' },
  { name: 'Dr. Javier Simons', role: 'Medical Director', dan: '6th Dan', education: 'University of Pennsylvania', dojo: 'Brevard Shotokan Karate Club, Florida', profession: 'Dentist (Retired)', image: '/board/javier_simons.webp' },
  { name: 'Daryl Adams', role: 'Tournament Director', dan: '5th Dan', education: 'Delta State University', dojo: 'JKA Atlanta, Georgia', profession: 'Language Acquisition Teacher', image: '/board/daryl_adams.webp' },
  { name: 'Dimitri Papadopoulos', role: 'Youth Development', dan: '5th Dan', education: 'Tulane University', dojo: 'NOSA, Louisiana', profession: 'Professor of Physiology', image: '/board/dimitri_papadopoulos.webp' },
  { name: 'Carol See Tai', role: 'Director At Large', dan: '7th Dan', education: 'University of Miami', dojo: 'SKC Coral Springs JKA, Florida', profession: 'Protection Specialist', image: '/board/carol_see_tai.webp' },
  { name: 'Johnny Caluda', role: 'Director At Large', dan: '6th Dan', education: 'Culinary Institute of America', dojo: 'LKA, Louisiana', profession: 'Business Owner/Chef', image: '/board/johnny_caluda.webp' },
  { name: 'Tom Fruitticher', role: 'Director At Large', dan: '6th Dan', education: 'University of W. Florida', dojo: 'Coastal Shotokan of Pensacola, Florida', profession: 'Real Estate Appraiser', image: '/board/tom_fruitticher.webp' },
  { name: 'Wauriman Borges', role: 'Director At Large', dan: '5th Dan', education: 'University Catholic of Goiás', dojo: 'JKA Northern California, California', profession: 'Martial Arts Instructor', image: '/board/wauriman_borges.webp' },
  { name: 'John Haral', role: 'Director At Large', dan: '5th Dan', education: 'Embry-Riddle Aeronautical University', dojo: 'JKA San Antonio, Texas', profession: 'United States Air Force (Retired)', image: '/board/john_haral.webp' },
  { name: 'Lane Nevils', role: 'Director At Large', dan: '5th Dan', education: 'UT Austin', dojo: 'Lafayette Karate Club, Louisiana', profession: 'Teacher, PhD', image: '/board/lane_nevils.webp' },
  { name: 'Glenn Taylor', role: 'Director At Large', dan: '5th Dan', education: 'LSU-S', dojo: 'Shreveport Karate Club, Louisiana', profession: 'LGT Aviation - Pilot (Retired)', image: '/board/glenn_taylor.webp' },
  { name: 'Mark Prudhomme', role: 'Director At Large', dan: '2nd Dan', education: 'ULL', dojo: 'Lafayette Karate Club, Louisiana', profession: 'IT Services (Retired)', image: '/board/mark_prudhomme.webp' },
];

// Reusable Card Component
const MemberCard = ({ member }: { member: any }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-red-100 transition-all duration-300 flex flex-col overflow-hidden h-full group">
    
    {/* Image Section - Using aspect-[4/5] for perfect portrait height, full edge-to-edge coverage */}
    <div className="relative w-full aspect-[4/5] bg-gray-100 border-b border-gray-100 overflow-hidden">
      <Image 
        src={member.image} 
        alt={member.name}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
        className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
      />
      {/* Black Dan Badge floating on image */}
      <div className="absolute top-3 right-3 bg-black/95 backdrop-blur-sm px-2.5 py-1 rounded-lg shadow-md border border-gray-800 text-[10px] sm:text-xs font-bold text-white tracking-wider uppercase">
        {member.dan}
      </div>
    </div>

    {/* Content Section */}
    <div className="p-5 flex flex-col flex-grow">
      <h3 className="text-lg font-extrabold text-gray-900 mb-1 leading-tight">{member.name}</h3>
      <p className="text-xs font-bold text-red-600 uppercase tracking-wide mb-4">{member.role}</p>
      
      <div className="mt-auto space-y-2.5">
        <div className="flex items-start gap-2 text-xs sm:text-sm text-gray-600">
          <svg className="w-4 h-4 mt-0.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
          <span className="leading-snug">{member.dojo}</span>
        </div>
        <div className="flex items-start gap-2 text-xs sm:text-sm text-gray-600">
          <svg className="w-4 h-4 mt-0.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0v6"></path></svg>
          <span className="leading-snug">{member.education}</span>
        </div>
        <div className="flex items-start gap-2 text-xs sm:text-sm text-gray-600">
          <svg className="w-4 h-4 mt-0.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
          <span className="leading-snug">{member.profession}</span>
        </div>
      </div>

    </div>
  </div>
);

export default function BoardPage() {
  return (
    <div className="bg-gray-50 min-h-screen pt-28 md:pt-36 pb-24">
      
      {/* Header Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
          JKA/AF Leadership
        </h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Meet the dedicated individuals who lead the Japan Karate Association/American Federation, bringing decades of experience in martial arts, education, and professional leadership.
        </p>
        <div className="w-20 h-1.5 bg-red-600 rounded-full mx-auto mt-8"></div>
      </div>

      {/* Executive Board Section */}
      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-8 flex items-center gap-3">
          <span className="w-2 h-8 bg-red-600 rounded-full"></span>
          Executive Board
        </h2>
        {/* Changed to lg:grid-cols-4 and adjusted gap for tighter fitting */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {executiveBoard.map((member, idx) => (
            <MemberCard key={idx} member={member} />
          ))}
        </div>
      </div>

      {/* General Board Members Section */}
      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-8 flex items-center gap-3">
          <span className="w-2 h-8 bg-red-600 rounded-full"></span>
          Board Members
        </h2>
        {/* Changed to lg:grid-cols-4 and adjusted gap for tighter fitting */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {boardMembers.map((member, idx) => (
            <MemberCard key={idx} member={member} />
          ))}
        </div>
      </div>

    </div>
  );
}