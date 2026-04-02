import Link from 'next/link';

export const metadata = {
  title: 'Policies & Guidelines | JKA/AF',
  description: 'Official policies, concussion awareness, and harassment prevention guidelines for the Japan Karate Association / American Federation.',
};

export default function PoliciesPage() {
  return (
    <div className="bg-gray-50 pt-28 md:pt-40 pb-24 font-sans">
      {/* CHANGED TO max-w-6xl FOR A WIDER PAGE */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-10 border-b border-gray-200 pb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
            Policies & Guidelines
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed font-medium">
            Official policies, awareness programs, and standards of behavior for all members and participants of the Japan Karate Association / American Federation.
          </p>
        </div>

        <div className="space-y-10">

          <section className="bg-white p-8 md:p-10 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="w-2 h-8 bg-red-600 rounded-full inline-block shrink-0"></span>
              Concussion Awareness and Prevention
            </h2>
            
            <div className="prose prose-lg max-w-none text-gray-600">
              <p className="mb-4">
                The following constitutes the policies of JKAAF with regard to concussion awareness and prevention within our organization.
              </p>
              
              <p className="mb-4">
                JKAAF is committed to maintaining an adequate system and regularly promote a concussion awareness and safety recognition program, including, but not limited to, the online Concussion Course offered by the Centers for Disease Control and Prevention.{' '}
                {/* ADDED EXTERNAL LINK ICON HERE */}
                <a 
                  href="https://www.cdc.gov/heads-up/training/youth-sports.html" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-red-600 font-bold hover:underline inline-flex items-center gap-1"
                >
                  View CDC Training Here
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                </a>
              </p>

              <p className="mb-4">
                JKAAF communicates, in writing (including by electronic means), our concussion awareness and safety recognition program to all participants, coaches, parents and involved parties.
              </p>
              <p className="mb-4">
                JKAAF has a clear understanding of concussion and the potential consequences of the injury, recognizing concussion signs and symptoms and how to respond.
              </p>
              <p className="mb-6">
                JKAAF is focused on prevention and preparedness to help participants stay safe and learn the steps for returning to activity after a concussion.
              </p>

              <h3 className="text-xl font-bold text-gray-900 mb-4">
                JKAAF will take the following 5 steps if we suspect a participant has a concussion:
              </h3>

              <ol className="list-decimal pl-5 space-y-4 text-gray-700">
                <li className="pl-2">
                  <strong className="text-gray-900">Remove the athlete from play.</strong> Look for signs and symptoms of a concussion if your athlete has experienced a bump or blow to the head or body. When in doubt, keep the athlete out of play.
                </li>
                <li className="pl-2">
                  <strong className="text-gray-900">Ensure evaluation.</strong> Ensure that the athlete is evaluated by a health care professional experienced in evaluating for concussion.
                </li>
                <li className="pl-2">
                  <strong className="text-gray-900">Record information.</strong> Recording the following information can help health care professionals in assessing the athlete after the injury:
                  <ol className="list-[lower-alpha] pl-5 mt-2 space-y-1 text-gray-600">
                    <li>Cause of the injury and force of the hit or blow to the head or body;</li>
                    <li>Any loss of consciousness (passed out/knocked out) and if so, for how long;</li>
                    <li>Any memory loss immediately following the injury;</li>
                    <li>Any seizures immediately following the injury;</li>
                    <li>Number of previous concussions (if any).</li>
                  </ol>
                </li>
                <li className="pl-2">
                  <strong className="text-gray-900">Inform parents or guardians.</strong> Inform the athlete’s parents or guardians about the possible concussion and give them the fact sheet on concussion. Make sure they know that the athlete should be seen by a health care professional who is experienced in evaluating for concussion.
                </li>
                <li className="pl-2">
                  <strong className="text-gray-900">Keep the athlete out of play.</strong> Keep the athlete out of play the day of the injury and until a health care professional, experienced in evaluating for concussion, says he/she is symptom-free, and it’s OK to return to play. A repeat concussion that occurs before the brain recovers from the first concussion - usually within a short period of time (hours, days, or weeks) - can slow recovery or increase the likelihood of having long-term problems. In rare cases, repeat concussions can result in edema (brain swelling), permanent brain damage, and even death.
                </li>
              </ol>
            </div>
          </section>

          <section className="bg-white p-8 md:p-10 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="w-2 h-8 bg-red-600 rounded-full inline-block shrink-0"></span>
              Harassment Awareness and Prevention
            </h2>

            <div className="prose prose-lg max-w-none text-gray-600">
              <p className="mb-8">
                JKAAF is committed to the safety of our members and harassment or abuse in any form is unacceptable to this organization. Harassment or abuse can be based on any grounds including race, religion, color, creed, ethnic origin, physical attributes, gender, sexual orientation, age, disability, socio-economic status or athletic ability. It can include a one-off incident or a series of incidents. It may be in person or online. Harassment may be deliberate, unsolicited, or coercive. JKAAF members and non-member participants at JKAAF events are expected to comply with the following standards of behavior.
              </p>

              <h3 className="text-xl font-bold text-gray-900 mb-4 uppercase tracking-wider border-b border-gray-100 pb-2">
                Standards of Behavior
              </h3>
              
              <p className="font-bold text-gray-900 mb-3">JKAAF expects its members and non-member participants to ALWAYS:</p>
              <ol className="list-[lower-alpha] pl-5 space-y-2 mb-6">
                <li>uphold city, state, and country laws, and all applicable sport codes, rules and regulations, and refrain from encouraging others to break any laws, rules or regulations;</li>
                <li>ensure that their intentions, actions and communications reflect a commitment to prioritizing the safety and well-being of all participants;</li>
                <li>maintain the highest standards of conduct, respect their position of authority and/or trust, and act in the best interest of children, young people and/or vulnerable persons;</li>
                <li>be aware of their own behavior, maintain appropriate boundaries with others, and respect the rights, dignity and worth of every person without any form of discrimination;</li>
                <li>stand against and report any form of harassment and abuse, neglect, abuse of power, trust, influence or authority, bullying or any other behavior that would reasonably be considered abusive amongst or towards any individuals.</li>
              </ol>

              <p className="font-bold text-gray-900 mb-3">JKAAF expects its members and non-member participants to NEVER:</p>
              <ol className="list-[lower-alpha] pl-5 space-y-2 mb-8" start={6}>
                <li>condone or engage in any form of psychological, physical or sexual violence or neglect towards others;</li>
                <li>engage in physical or online activities that could reasonably be considered inappropriate or culturally insensitive towards others, especially children and other vulnerable persons;</li>
                <li>make or share comments or images that could be reasonably considered inappropriate, are demeaning or indecent, or place people at risk of physical, emotional or reputational damage.</li>
              </ol>

              <h3 className="text-xl font-bold text-gray-900 mb-4 uppercase tracking-wider border-b border-gray-100 pb-2">
                Reports of Harassment
              </h3>
              
              <p className="mb-4">
                If a JKAAF member, the parent or guardian of a member under the age of 18, or a non-member participant believes they are being harassed or abused at or during a JKAAF camp, tournament, training session, or other JKAAF event, the conduct should be reported immediately. Reports should be made in writing, and may be sent to the email at the bottom of this webpage, or may be delivered by hand directly to an Executive Director of JKAAF. The report should contain the date(s), harassment complained of, individuals involved, and other information important to the complaint.
              </p>
              <p className="mb-4">
                After a report is submitted, JKAAF will initiate an assessment to determine if the report contains an allegation or allegations of harassment or abuse which violate JKAAF’s standards of behavior. JKAAF is not an investigatory agency and is comprised of volunteers who are interested in maintaining the integrity of the organization. Accordingly, JKAAF will not make any declarations regarding a report where a criminal offense has occurred or is suspected to have been committed until after any criminal proceedings are concluded. If JKAAF determines that information contained in the report may be subject to mandatory reporting requirements (for example, activities and behaviors including child abuse) or may include a criminal offense that should be dealt with by public authorities, JKAAF will comply with all applicable laws and report the information to the appropriate authorities, or facilitate such reporting.
              </p>
              <p className="mb-4">
                This reporting procedure is also not appropriate to be the first method for reporting concerns that occur at a dojo affiliated with JKAAF. If a report is made and during the assessment or investigation JKAAF determines that the conduct complained of occurred at a dojo outside of a JKAAF event and the dojo had no opportunity to address the underlying complaint, JKAAF may refer the report to the head of that dojo for further investigation as may be appropriate.
              </p>
              <p className="mb-4">
                If after the preliminary assessment JKAAF determines that further investigation is warranted by the organization, JKAAF will investigate the issue to determine if any potential disciplinary issues exist, considering the nature and severity of the alleged violations, the number of alleged violations, and any other relevant circumstances (e.g. if an individual involved is a minor) before any potential measures or sanctions may be applied.
              </p>
              <p>
                JKAAF is aware that these reports may contain sensitive information. Individuals submitting reports may choose to remain anonymous. However, there is a risk that JKAAF will be unable to thoroughly investigate anonymous reports if enough information is not provided. JKAAF is committed to ensuring the confidentiality of any member, parent or guardian, or non-member participant who uses this reporting procedure and identifies themself, and will not share any information obtained with any individual outside of the JKAAF Executive Board, unless required by law. The submitted report will remain confidential during the investigation, unless it is suspected that the report includes activities or behaviors, including child abuse, that require mandatory reporting to public authorities, or if the report should be referred to a particular dojo, as stated above.
              </p>
            </div>
          </section>

          <section className="bg-white p-8 md:p-10 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-2 h-8 bg-gray-300 rounded-full inline-block shrink-0"></span>
              Additional Materials
            </h2>
            
            <p className="text-gray-600 mb-6 text-lg">
              We suggest reviewing the following videos and websites for more information. State laws may vary and these materials are only to be used as a guide.
            </p>

            <div className="flex flex-col gap-4">
              <a 
                href="https://www.youtube.com/watch?v=A9gudpiQ40M" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:border-red-300 hover:bg-red-50 transition-colors group"
              >
                <div className="bg-red-100 p-3 rounded-full text-red-600 group-hover:bg-red-600 group-hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 group-hover:text-red-700">New York State Sexual Harassment Prevention Training</h4>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    Watch Training Video on YouTube
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                  </p>
                </div>
              </a>

              <a 
                href="https://www.youtube.com/playlist?list=PL6bTKf3fLhfcBZ3Jfns147Pin42xZ-Q1C" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:border-red-300 hover:bg-red-50 transition-colors group"
              >
                <div className="bg-red-100 p-3 rounded-full text-red-600 group-hover:bg-red-600 group-hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 group-hover:text-red-700">Louisiana Board of Regents Power-Based Violence Training</h4>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    View Playlist on YouTube
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                  </p>
                </div>
              </a>

              <a 
                href="https://www.cdc.gov/heads-up/training/youth-sports.html" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:border-red-300 hover:bg-red-50 transition-colors group"
              >
                <div className="bg-red-100 p-3 rounded-full text-red-600 group-hover:bg-red-600 group-hover:text-white transition-colors">
                  {/* CHANGED ICON HERE TO EXTERNAL LINK TO MATCH YOUTUBE LINKS BETTER */}
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 group-hover:text-red-700">HEADS UP to Youth Sports Coaches</h4>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    Online Concussion Training (CDC Website)
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                  </p>
                </div>
              </a>
            </div>

          </section>

        </div>
      </div>
    </div>
  );
}