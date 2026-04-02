import Link from 'next/link';

export const metadata = {
  title: 'Dan & Qualification Exams | JKA/AF',
  description: 'Information and registration steps for Dan and Qualification exams for the Japan Karate Association / American Federation.',
};

export default function TechnicalPage() {
  return (
    <div className="bg-gray-50 pt-28 md:pt-40 pb-24 font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-10 border-b border-gray-200 pb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
            Dan & Qualifications Exams
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed font-medium">
            Dan and Qualifications exams are held annually at the JKA/AF National Summer Camp and select regional camps.
          </p>
        </div>

        <div className="space-y-10">

          <div className="bg-red-50 border-l-4 border-red-600 p-6 rounded-r-xl shadow-sm">
            <p className="text-red-900 font-bold text-lg flex items-start sm:items-center gap-3">
              <svg className="w-6 h-6 shrink-0 mt-0.5 sm:mt-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
              </svg>
              Every examinee must submit a JKA passport and show current membership in the JKA/AF.
            </p>
          </div>

          <section className="bg-white p-8 md:p-10 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="w-2 h-8 bg-red-600 rounded-full inline-block shrink-0"></span>
              Dan Exams
            </h2>

            <div className="prose prose-lg max-w-none text-gray-600">
              <h3 className="text-xl font-bold text-gray-900 mb-4 uppercase tracking-wider border-b border-gray-100 pb-2">
                To Register:
              </h3>

              <ol className="list-decimal pl-5 space-y-6 text-gray-700 font-medium">
                <li className="pl-2">
                  <strong className="text-gray-900">Complete a typed "Examiners Record"</strong>
                  <p className="mt-1 text-gray-600 font-normal">Edit in your browser, download a completed copy, and email to <a href="mailto:jkaafusa@gmail.com" className="text-red-600 hover:underline font-bold">jkaafusa@gmail.com</a> by the deadline.</p>
                  
                  <ul className="list-[lower-alpha] pl-5 mt-3 space-y-2 text-gray-600 font-normal">
                    <li>Every question in the top section and the section labeled "Ranking Information" must be answered. No exceptions.</li>
                    <li>Sample forms are available here to use as a guide if you need instruction on how to complete the form.</li>
                    <li><strong>IMPORTANT:</strong> If you are taking any exam higher than Shodan, you must also email a photograph of your most recent Dan license to jkaafusa@gmail.com.</li>
                  </ul>

                  <div className="mt-5">
                    <a href="/examiner_record.pdf" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-bold uppercase tracking-wider hover:bg-red-600 transition-colors shadow-sm">
                      Get Examiner Record Form
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                    </a>
                  </div>
                </li>

                <li className="pl-2">
                  <strong className="text-gray-900">Purchase your exam at the store</strong>
                  <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-600 font-normal">
                    <li>Shodan Exam</li>
                    <li>Nidan Exam</li>
                    <li>Sandan Exam</li>
                  </ul>
                  <p className="mt-3 text-sm text-gray-500 font-normal italic">
                    To pay with cash, check, or Zelle, select "offline payment" when checking out.
                  </p>
                </li>

                <li className="pl-2">
                  <strong className="text-gray-900">Sign your waiver</strong>
                  <p className="mt-1 font-normal">
                    <a href="https://forms.wix.com/f/7159271064965480463" target="_blank" rel="noopener noreferrer" className="text-red-600 font-bold hover:underline inline-flex items-center gap-1">
                      Sign Waiver Here
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                    </a>
                  </p>
                </li>
              </ol>
            </div>
          </section>

          <section className="bg-white p-8 md:p-10 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="w-2 h-8 bg-gray-800 rounded-full inline-block shrink-0"></span>
              Instructor, Judge, and Examiner's Qualification Exams
            </h2>

            <div className="prose prose-lg max-w-none text-gray-600">
              <h3 className="text-xl font-bold text-gray-900 mb-4 uppercase tracking-wider border-b border-gray-100 pb-2">
                To Register:
              </h3>

              <ol className="list-decimal pl-5 space-y-6 text-gray-700 font-medium">
                <li className="pl-2">
                  <strong className="text-gray-900">Complete a typed "Examinees Information Card"</strong>
                  <p className="mt-1 text-gray-600 font-normal">Edit in your browser, download a completed copy, and email to <a href="mailto:jkaafusa@gmail.com" className="text-red-600 hover:underline font-bold">jkaafusa@gmail.com</a> by the deadline.</p>
                  
                  <ul className="list-[lower-alpha] pl-5 mt-3 space-y-2 text-gray-600 font-normal">
                    <li>Every question in the top section must be answered. No exceptions.</li>
                    <li>Sample forms are available here to use as a guide if you need instruction on how to complete the form.</li>
                    <li><strong>IMPORTANT:</strong> You must also email a photograph of your most recent Dan license to jkaafusa@gmail.com.</li>
                  </ul>
                </li>

                <li className="pl-2">
                  <strong className="text-gray-900">Purchase your exam at the store</strong>
                  <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-600 font-normal">
                    <li>Instructor Exam</li>
                    <li>Judge Exam</li>
                    <li>Examiner Exam</li>
                  </ul>
                  <p className="mt-3 text-sm text-gray-500 font-normal italic">
                    To pay with cash, check, or Zelle, select "offline payment" when checking out.
                  </p>
                </li>

                <li className="pl-2">
                  <strong className="text-gray-900">Sign your waiver</strong>
                  <p className="mt-1 font-normal">
                    <a href="https://forms.wix.com/f/7159271064965480463" target="_blank" rel="noopener noreferrer" className="text-red-600 font-bold hover:underline inline-flex items-center gap-1">
                      Sign Waiver Here
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                    </a>
                  </p>
                </li>
              </ol>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}