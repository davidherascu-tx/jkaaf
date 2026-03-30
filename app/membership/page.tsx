import Image from 'next/image';

export default function MembershipPage() {
  return (
    <div className="bg-gray-50 min-h-screen pt-28 md:pt-36 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden flex flex-col lg:flex-row">
          
          {/* Left Column: Text Content */}
          <div className="lg:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-center">
            
            <div className="mb-6">
              <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
                DOJO MEMBERSHIP
              </h1>
              <div className="w-16 h-1.5 bg-red-600 rounded-full mb-6"></div>
              <p className="text-lg text-gray-600 leading-relaxed font-medium">
                JKA/AF offers membership to karate clubs seeking affiliation with the Japan Karate Association/American Federation.
              </p>
            </div>

            {/* Benefits List */}
            <div className="mb-10">
              <h2 className="text-xl font-bold text-gray-900 mb-4 uppercase tracking-wider">
                Membership Benefits
              </h2>
              <ul className="space-y-4">
                {[
                  "Membership with JKA/American Federation",
                  "Access to JKA rank and qualification examinations",
                  "Access to JKA/AF Passport books (for individuals)",
                  "Access to JKA/AF member rate at events (for individuals)",
                  "Listing in JKA/AF Club Directory",
                  "Access to monthly JKA/AF Meetings and Instructor Training"
                ].map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
                      <svg className="w-3.5 h-3.5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                    <span className="text-gray-700 font-medium">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Call to Action Button */}
            <div>
              <a 
                href="https://docs.google.com/forms/d/e/1FAIpQLSdky3Ci5oven9q88pHhR5AEIOSjvlXEce01asNtmyADOT0-oA/viewform"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-red-600 text-white font-bold text-lg px-8 py-4 rounded-xl hover:bg-red-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 w-full sm:w-auto"
              >
                JKA/AF Membership Application
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                </svg>
              </a>
            </div>

          </div>

          {/* Right Column: Image */}
          <div className="lg:w-1/2 relative min-h-[400px] lg:min-h-full bg-gray-100">
            {/* The image is set to object-cover so it nicely fills the right half of the card */}
            <Image 
              src="/image_3.png" 
              alt="JKA/AF Dojo Members Training" 
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          </div>

        </div>

      </div>
    </div>
  );
}