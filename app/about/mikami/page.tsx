import Image from 'next/image';

export default function MikamiPage() {
  return (
    <div className="bg-gray-50 min-h-screen pt-28 md:pt-36 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Profile Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            
            {/* Left Column: Image */}
            <div className="lg:w-2/5 relative h-[500px] lg:h-auto bg-gray-100 shrink-0 border-b lg:border-b-0 lg:border-r border-gray-200">
              <Image 
                src="/mikami_sensei.jpg" 
                alt="Sensei Takayuki Mikami" 
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover object-top"
                priority
              />
            </div>

            {/* Right Column: Content */}
            <div className="lg:w-3/5 p-8 md:p-12 lg:p-16 flex flex-col justify-center">
              
              {/* Titles */}
              <div className="mb-10">
                <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-3 tracking-tight leading-tight">
                  Sensei Takayuki Mikami, 9<span className="text-2xl md:text-4xl align-top">th</span> Dan JKA
                </h1>
                <h2 className="text-lg md:text-xl font-bold text-red-600 uppercase tracking-widest mb-6">
                  JKA/AF Founder & Chief Instructor
                </h2>
                <div className="w-20 h-1.5 bg-red-600 rounded-full"></div>
              </div>
              
              {/* Biography Text */}
              <div className="prose prose-lg text-gray-600 max-w-none leading-relaxed space-y-6">
                <p>
                  Sensei Takayuki Mikami, a native of Japan, is a graduate from the first class of the Instructor Training Program of the Japan Karate Association (JKA), the largest and most influential karate organization in the world. He became the first certified instructor sent overseas by the JKA when he moved to New Orleans in 1965 to promote Shotokan karate training in the United States.
                </p>
                <p>
                  Sensei Mikami was a formidable competitor, winning the All-Japan Championships multiple times in both kumite (free sparring) and kata (forms). After this success, he focused his efforts on instruction and training his students to be the best.
                </p>
                <p>
                  Sensei Mikami developed karate training in the Southern region by creating the All South Karate Association in 1965 and hosting the annual All South Tournament in New Orleans, now the longest running traditional karate tournament in the United States. In 2008, he formed the Japan Karate Association/American Federation (JKA/AF) to better serve his members and to connect directly with the JKA World Federation in Japan.
                </p>
                <p>
                  He was promoted to 9th degree black belt in 2011 and is the highest ranked JKA master in the United States. He serves as the Senior Technical Advisor to the JKA Headquarters in Tokyo, the second highest technical position after the JKA World Federation Chief Instructor.
                </p>
              </div>

            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}