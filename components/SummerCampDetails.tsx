'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

interface FaqItem {
  q: string;
  a: React.ReactNode;
}

const FAQS: FaqItem[] = [
  {
    q: 'How much is camp?',
    a: (
      <>
        Prices range from <strong>$225</strong> for full-time college students to <strong>$400</strong> for teenagers and adults. There is a discount for current JKA/AF members — see the packet. Dan exams and qualification exams are separate costs.
      </>
    ),
  },
  {
    q: "I can't attend every session. Can I just pay for the sessions I attend?",
    a: 'Sorry, no. We do not offer individual session registrations.',
  },
  {
    q: 'Do I have to pay the processing fees if I register online?',
    a: (
      <>
        No. To save on processing fees, select <strong>&ldquo;offline payment&rdquo;</strong> at the checkout screen and pay by cash, check, or Zelle to{' '}
        <a href="mailto:jkaafusa@gmail.com" className="text-red-600 hover:text-red-700 font-semibold underline underline-offset-2">
          jkaafusa@gmail.com
        </a>
        .
      </>
    ),
  },
  {
    q: 'How do I register for camp?',
    a: (
      <>
        Register by clicking the button below and signing the waiver. If you can&apos;t register online, download the information packet linked above and mail in your registration before the deadline.
        <br />
        <br />
        <strong>Parents:</strong> we will also need a consent for medical treatment form if your child is under 18 unless you will be staying with them during the entire time during camp (Minor Consent for Emergency Treatment).
      </>
    ),
  },
  {
    q: 'Is there a registration deadline for camp?',
    a: (
      <>
        No, you can walk up and register the day of camp, but prices will rise by <strong>$50</strong> one week beforehand — <strong>June 7, 2026</strong>.
      </>
    ),
  },
  {
    q: 'Is there a registration deadline for Dan or qualification exams?',
    a: (
      <>
        Yes — you must register for exams by <strong>May 31, 2026</strong>.
      </>
    ),
  },
  {
    q: 'I bought my Dan/qualifications exam through the store. Is that all I need to do before the test?',
    a: (
      <>
        No — every person taking a test must send their typed registration form to{' '}
        <a href="mailto:jkaafusa@gmail.com" className="text-red-600 hover:text-red-700 font-semibold underline underline-offset-2">
          jkaafusa@gmail.com
        </a>
        . All examinees must also be members of JKA/AF and present a JKA passport when checking in to camp. Forms and instructions are available on the JKA/AF site.
      </>
    ),
  },
  {
    q: 'What exams are being offered this year?',
    a: (
      <>
        Dan ranks <strong>1–5</strong>; Instructor <strong>A, B, C, D</strong>; Judge <strong>A, B, C, D</strong>; and Examiner <strong>C, D</strong>.
      </>
    ),
  },
  {
    q: 'Where can I stay?',
    a: (
      <>
        We have a block of hotel rooms available at the <strong>Marriott at Lakeway</strong>. Book by <strong>May 27, 2026</strong>. We do not have dorm rooms this year.
      </>
    ),
  },
  {
    q: 'The poster says camp begins June 10, but this website says camp begins June 11. Which is right?',
    a: (
      <>
        We have an optional night of training on <strong>Wednesday, June 10</strong> for people who are in town and wish to train. Camp officially begins on <strong>Thursday, June 11</strong>.
      </>
    ),
  },
  {
    q: 'When will we know the camp schedule?',
    a: 'A schedule will be published about 2 weeks before camp begins. Expect activities beginning on Thursday morning through noon Sunday, with optional training Wednesday night.',
  },
  {
    q: 'Is there a tee shirt?',
    a: (
      <>
        Yes — we have two options this year. The <strong>gray 3/4-sleeve raglan</strong> is available in adult sizes through our online store, and the <strong>blue shirt</strong> is available in both youth and adult sizes at our online store. Preorders end <strong>May 25</strong>. Some shirts may be available for sale at camp. See the photos below.
      </>
    ),
  },
];

const KEY_DATES = [
  { label: 'Exam registration deadline', date: 'May 31, 2026', tone: 'warning' as const },
  { label: 'Hotel booking deadline', date: 'May 27, 2026', tone: 'info' as const },
  { label: 'Tee shirt preorder deadline', date: 'May 25, 2026', tone: 'info' as const },
  { label: 'Prices rise by $50', date: 'June 7, 2026', tone: 'warning' as const },
];

const TSHIRTS = [
  { src: '/t-shirt_blue.jpg', label: 'Blue shirt', sub: 'Youth & adult sizes' },
  { src: '/t-shirt_grey_front.jpg', label: 'Gray raglan — front', sub: 'Adult sizes only' },
  { src: '/t-shirt_grey_back.jpg', label: 'Gray raglan — back', sub: 'Adult sizes only' },
];

function FaqRow({ item, index, isOpen, onToggle }: { item: FaqItem; index: number; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className={`border-b border-gray-200 last:border-b-0 ${isOpen ? 'bg-red-50/30' : 'bg-white'} transition-colors`}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 text-left px-6 py-5 hover:bg-red-50/50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-inset"
        aria-expanded={isOpen}
      >
        <div className="flex items-start gap-4">
          <span className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 text-red-700 font-bold text-sm flex items-center justify-center mt-0.5">
            {index + 1}
          </span>
          <h3 className="font-bold text-gray-900 text-lg leading-snug pt-1">
            {item.q}
          </h3>
        </div>
        <svg
          className={`flex-shrink-0 w-5 h-5 text-red-600 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>
      <div
        className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
      >
        <div className="overflow-hidden">
          <div className="px-6 pl-[4.5rem] pr-12 pb-6 text-gray-700 leading-relaxed text-base">
            {item.a}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SummerCampDetails({ campPacketUrl }: { campPacketUrl?: string | null }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const showPrev = useCallback(
    () => setLightboxIndex((i) => (i === null ? null : (i - 1 + TSHIRTS.length) % TSHIRTS.length)),
    []
  );
  const showNext = useCallback(
    () => setLightboxIndex((i) => (i === null ? null : (i + 1) % TSHIRTS.length)),
    []
  );

  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      else if (e.key === 'ArrowLeft') showPrev();
      else if (e.key === 'ArrowRight') showNext();
    };
    window.addEventListener('keydown', onKey);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = originalOverflow;
    };
  }, [lightboxIndex, closeLightbox, showPrev, showNext]);

  return (
    <div className="space-y-16">

      {/* Welcome Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-red-900 text-white p-8 sm:p-12 shadow-xl">
        <div className="absolute inset-0 opacity-10" aria-hidden="true">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-red-500 blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-red-700 blur-3xl"></div>
        </div>
        <div className="relative">
          <div className="inline-block px-3 py-1 bg-red-600/30 border border-red-400/40 rounded-full text-xs font-bold uppercase tracking-widest mb-5">
            Welcome
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-5 leading-tight">
            2026 JKAAF National Karate Camp
          </h2>
          <p className="text-lg sm:text-xl text-gray-200 leading-relaxed max-w-3xl mb-3">
            We welcome you to the 2026 JKAAF National Karate Camp, <strong className="text-white">June 11–14, 2026</strong>.
          </p>
          <p className="text-lg text-gray-200 leading-relaxed max-w-3xl">
            This year we are excited to train under JKA Guest Instructors <strong className="text-white">Ogura Sensei</strong> and <strong className="text-white">Kurihara Sensei</strong>.
          </p>
        </div>
      </section>

      {/* Featured Instructors */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-red-600 rounded-full"></span>
          Guest Instructors
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {[
            { name: 'Ogura Sensei', rank: '8th Dan' },
            { name: 'Kurihara Sensei', rank: '4th Dan' },
          ].map((instructor) => (
            <div key={instructor.name} className="relative bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-red-200 transition-all">
              <p className="text-xs font-bold uppercase tracking-wider text-red-600 mb-1.5">JKA Guest Instructor</p>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{instructor.name}</h3>
              <span className="inline-block px-3 py-1 bg-red-50 text-red-700 text-sm font-bold rounded-full border border-red-100">
                {instructor.rank}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Camp Packet CTA */}
      <section className="bg-gradient-to-r from-gray-50 to-red-50/40 border border-red-100 rounded-3xl p-6 sm:p-10 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-10">
          <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-red-600 flex items-center justify-center shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
          </div>
          <div className="flex-grow">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Read the Camp Packet</h3>
            <p className="text-gray-600 leading-relaxed">
              The camp packet contains prices, deadlines, exam requirements, venues, hotel info, and everything else you need to know.
            </p>
          </div>
          {campPacketUrl ? (
            <a
              href={campPacketUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-gray-900 text-white font-bold px-7 py-3.5 rounded-xl hover:bg-black transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 whitespace-nowrap"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              Open Camp Packet
            </a>
          ) : (
            <span className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-gray-200 text-gray-500 font-bold px-7 py-3.5 rounded-xl whitespace-nowrap cursor-not-allowed">
              Packet coming soon
            </span>
          )}
        </div>
      </section>

      {/* Key Dates */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-red-600 rounded-full"></span>
          Key Dates &amp; Deadlines
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {KEY_DATES.map((item) => (
            <div
              key={item.label}
              className={`relative rounded-2xl border p-5 transition-all hover:-translate-y-0.5 hover:shadow-md ${
                item.tone === 'warning'
                  ? 'bg-red-50 border-red-200'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className={`text-xs font-bold uppercase tracking-wider mb-2 ${item.tone === 'warning' ? 'text-red-700' : 'text-gray-500'}`}>
                {item.label}
              </div>
              <div className="text-lg font-extrabold text-gray-900 leading-tight">
                {item.date}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Registration CTA */}
      <section className="bg-red-600 rounded-3xl p-8 sm:p-12 text-center text-white shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" aria-hidden="true">
          <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-red-400 blur-2xl"></div>
          <div className="absolute -bottom-12 -left-12 w-64 h-64 rounded-full bg-red-800 blur-2xl"></div>
        </div>
        <div className="relative">
          <h3 className="text-3xl sm:text-4xl font-extrabold mb-3">Ready to register?</h3>
          <p className="text-red-100 mb-7 text-lg max-w-xl mx-auto">
            Sign the waiver and secure your spot. Walk-up registration available — but prices rise June 7.
          </p>
          <Link
            href="/events/summer-camp-2026/register"
            className="inline-flex items-center gap-2 bg-white text-red-700 font-extrabold px-8 py-4 rounded-xl hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Register for Camp
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section>
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-red-600 rounded-full"></span>
            Frequently Asked Questions
          </h2>
          <button
            onClick={() => setOpenIndex(openIndex === -1 ? null : -1)}
            className="text-sm font-bold text-red-600 hover:text-red-700 transition-colors"
          >
            {openIndex === -1 ? 'Collapse all' : 'Expand all'}
          </button>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {FAQS.map((item, i) => (
            <FaqRow
              key={i}
              item={item}
              index={i}
              isOpen={openIndex === -1 || openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </div>
      </section>

      {/* Tee Shirt Gallery */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-red-600 rounded-full"></span>
          2026 Camp Tee Shirts
        </h2>
        <p className="text-gray-600 mb-6">
          Two options this year. Preorders end <strong>May 25</strong>. Click any photo to view it larger.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {TSHIRTS.map((shirt, i) => (
            <button
              key={shirt.src}
              type="button"
              onClick={() => setLightboxIndex(i)}
              className="group relative bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg hover:border-red-200 transition-all text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            >
              <div className="aspect-square bg-white overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={shirt.src}
                  alt={shirt.label}
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6"></path>
                </svg>
              </div>
              <div className="p-4 border-t border-gray-200 bg-white">
                <p className="font-bold text-gray-900 text-sm leading-tight">{shirt.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{shirt.sub}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Tee shirt photo viewer"
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8 animate-in fade-in"
          onClick={closeLightbox}
        >
          <button
            type="button"
            aria-label="Close"
            onClick={closeLightbox}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur flex items-center justify-center text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>

          <button
            type="button"
            aria-label="Previous image"
            onClick={(e) => { e.stopPropagation(); showPrev(); }}
            className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur flex items-center justify-center text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path>
            </svg>
          </button>

          <button
            type="button"
            aria-label="Next image"
            onClick={(e) => { e.stopPropagation(); showNext(); }}
            className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur flex items-center justify-center text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"></path>
            </svg>
          </button>

          <figure
            className="relative max-w-5xl max-h-full flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={lightboxIndex}
              src={TSHIRTS[lightboxIndex].src}
              alt={TSHIRTS[lightboxIndex].label}
              className="max-h-[80vh] max-w-full w-auto h-auto object-contain rounded-xl shadow-2xl bg-white"
            />
            <figcaption className="mt-4 text-center text-white">
              <p className="text-lg font-bold">{TSHIRTS[lightboxIndex].label}</p>
              <p className="text-sm text-gray-300 mt-0.5">{TSHIRTS[lightboxIndex].sub}</p>
              <p className="text-xs text-gray-400 mt-2">
                {lightboxIndex + 1} / {TSHIRTS.length} &middot; Use ← → to navigate, Esc to close
              </p>
            </figcaption>
          </figure>
        </div>
      )}
    </div>
  );
}
