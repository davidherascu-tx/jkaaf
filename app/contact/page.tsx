import Image from 'next/image';

export default function ContactPage() {
  return (
    // ADDED: "flex-1 w-full flex flex-col" so the gray background stretches all the way down!
    <div className="bg-gray-50 flex-1 w-full flex flex-col pt-28 md:pt-36 pb-12 lg:pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden flex flex-col lg:flex-row">
          
          {/* Left Column: Text Content & Form (or Contact Info) */}
          <div className="lg:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-center">
            
            <div className="mb-6">
              <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
                Contact Us
              </h1>
              <div className="w-16 h-1.5 bg-red-600 rounded-full mb-6"></div>
              <p className="text-lg text-gray-600 leading-relaxed font-medium mb-8">
                Have questions about the Japan Karate Association/American Federation? Whether you are looking to join a dojo, register for an event, or learn more about our organization, we are here to help.
              </p>
            </div>

            {/* Contact Information */}
            <div className="space-y-6 mb-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center flex-shrink-0 text-red-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Email</p>
                  <a href="mailto:JKAAFUSA@gmail.com" className="text-lg font-bold text-gray-900 hover:text-red-600 transition-colors">
                    JKAAFUSA@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center flex-shrink-0 text-red-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Phone</p>
                  <a href="tel:5048356825" className="text-lg font-bold text-gray-900 hover:text-red-600 transition-colors">
                    (504) 835-6825
                  </a>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Image */}
          <div className="lg:w-1/2 relative min-h-[400px] lg:min-h-full bg-gray-100">
            <Image 
              src="/jka_contact.png" 
              alt="JKA/AF Karate Training" 
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover object-top"
              priority
            />
          </div>

        </div>

      </div>
    </div>
  );
}