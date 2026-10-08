// Dojo Membership application: field definitions + validation, shared by the client form and the server action.

export type FieldType = 'text' | 'email' | 'tel' | 'number' | 'date' | 'textarea' | 'choice' | 'select';

export interface FormField {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: string[];
  hint?: string;
  /** Only shown (and required, if `required`) when another field has this value. */
  showIf?: { name: string; value: string };
}

export interface FormSection {
  title: string;
  intro?: string;
  fields: FormField[];
}

const YES_NO = ['Yes', 'No'];

export const DOJO_SECTIONS: FormSection[] = [
  {
    title: 'Dojo information',
    fields: [
      { name: 'dojo_name', label: 'Dojo Name', type: 'text', required: true },
      { name: 'region_state', label: 'Region/State', type: 'text', required: true },
      {
        name: 'country',
        label: 'Country',
        type: 'select',
        required: true,
        options: ['United States', 'Canada', 'Mexico'],
        hint: 'JKA/AF operates only in North America',
      },
      { name: 'street', label: 'Dojo Street Address', type: 'text', required: true },
      { name: 'city', label: 'City', type: 'text', required: true },
      { name: 'state', label: 'State', type: 'text', required: true },
      { name: 'zip', label: 'Zip', type: 'text', required: true },
      { name: 'phone', label: 'Dojo Phone', type: 'tel', required: true },
      { name: 'fax', label: 'Fax', type: 'tel' },
      { name: 'email', label: 'Email', type: 'email', required: true },
      { name: 'website', label: 'Website', type: 'text' },
      { name: 'years_operation', label: 'Number of years in operation', type: 'number', required: true },
      { name: 'students', label: 'Number of students', type: 'number', required: true },
      { name: 'black_belts', label: 'Number of black belt students', type: 'number', required: true },
      { name: 'insurance', label: 'Does your dojo have liability insurance', type: 'choice', required: true, options: ['No', 'Yes'] },
      {
        name: 'business_type',
        label: 'Type of business (i.e. corporation, sole proprietorship, etc)',
        type: 'text',
        required: true,
      },
      {
        name: 'instructor_time',
        label: 'Is the chief instructor full time or part time?',
        type: 'select',
        required: true,
        options: ['Full time', 'Part time'],
      },
    ],
  },
  {
    title: 'Chief instructor',
    fields: [
      { name: 'chief_instructor', label: 'Name of chief instructor', type: 'text', required: true },
      { name: 'ci_street', label: 'Chief Instructor street address', type: 'text', required: true },
      { name: 'ci_city', label: 'Chief Instructor city', type: 'text', required: true },
      { name: 'ci_state', label: 'Chief instructor state', type: 'text', required: true },
      { name: 'ci_zip', label: 'Chief instructor zip', type: 'text', required: true },
      { name: 'ci_phone', label: 'Chief instructor phone', type: 'tel', required: true },
      { name: 'ci_email', label: 'Chief Instructor Email', type: 'email', required: true },
      { name: 'ci_dob', label: 'Chief Instructor Date of Birth', type: 'date', required: true },
      {
        name: 'ci_prev_rep',
        label: 'Has chief instructor been a previous regional representative?',
        type: 'choice',
        required: true,
        options: YES_NO,
      },
      { name: 'ci_jka_rank', label: 'Chief Instructor JKA Rank', type: 'text', required: true },
      {
        name: 'ci_other_rank',
        label: "Please list Chief Instructor's rank in any other style or organization",
        type: 'text',
        required: true,
      },
      {
        name: 'ci_qualifications',
        label: 'Does chief instructor hold any qualifications or certificates? Please list',
        type: 'textarea',
        required: true,
      },
    ],
  },
  {
    title: 'Organization history',
    fields: [
      {
        name: 'other_org',
        label: 'Have you or your dojo ever been a member of any other karate or martial art organization?',
        type: 'choice',
        required: true,
        options: YES_NO,
      },
      { name: 'other_org_names', label: 'Organization Name(s)', type: 'text', showIf: { name: 'other_org', value: 'Yes' } },
      {
        name: 'good_standing',
        label: 'Are you a member in good standing in that organization?',
        type: 'choice',
        required: true,
        options: ['Yes', 'No', 'N/A'],
      },
      {
        name: 'left_org',
        label: 'Have you or your dojo ever left, been suspended or expelled from any martial art organization?',
        type: 'choice',
        required: true,
        options: YES_NO,
      },
      {
        name: 'left_org_explain',
        label: 'Please explain.',
        type: 'textarea',
        required: true,
        showIf: { name: 'left_org', value: 'Yes' },
      },
      {
        name: 'misdemeanor',
        label: 'Have you ever been convicted of a misdemeanor offence involving violence?',
        type: 'choice',
        required: true,
        options: YES_NO,
      },
      {
        name: 'misdemeanor_list',
        label: 'Please list each offence & date of conviction.',
        type: 'textarea',
        required: true,
        showIf: { name: 'misdemeanor', value: 'Yes' },
      },
      {
        name: 'felony',
        label: 'Have you ever been convicted of a felony offence?',
        type: 'choice',
        required: true,
        options: YES_NO,
      },
      {
        name: 'felony_list',
        label: 'Please list each offence and date of conviction.',
        type: 'textarea',
        required: true,
        showIf: { name: 'felony', value: 'Yes' },
      },
    ],
  },
  {
    title: 'References',
    fields: [
      { name: 'ref1', label: 'Name & rank', type: 'text' },
      { name: 'ref2', label: 'Name & rank', type: 'text' },
      { name: 'ref3', label: 'Name & rank', type: 'text' },
      { name: 'ref4', label: 'Name & rank', type: 'text' },
    ],
  },
];

export const AGREEMENT_INTRO =
  'The aforementioned club wishes to participate in membership in the JKA/American Federation. In consideration of the membership, training and service provided to said club by the JKA/American Federation and its\' affiliated clubs, and instructors. The club (hereinafter referred to as "we") and Instructor hereby freely and knowingly accepts and agrees to the following terms and conditions to wit:';

export interface Clause {
  name: string;
  text: string;
}

export const AGREEMENT_CLAUSES: Clause[] = [
  {
    name: 'agree_risk',
    text: '1) Assumptions of Risk: I/we understand the Karate is a hazardous activity that involves inherent risks of serious physical injury. With full knowledge of risks involved in Karate, I/we expressly assume all the risks of harm to myself and the club\'s students arising from the practice of Karate with the JKA/American Federation.',
  },
  {
    name: 'agree_release',
    text: '2) Release of Claims and Waiver of Liability: The club hereby expressly and for all times on behalf of the club and myself: the club, my heirs, successors and assigns, executors and personal Representatives release and agree to hold harmless JKA/American Federation from any claim, demand, or cause of action at law or equity of injury to me that arise or might have arisen from my or the club\'s participation in the practice of Karate, from my use of the equipment of the JKA/American Federation, or from my or the club\'s participation in any activity associated directly or indirectly with JKA/American Federation, or from the club\'s use of Karate techniques;',
  },
  {
    name: 'agree_indemnify',
    text: '3) Indemnification: I and the club hereby agree to indemnify and hold harmless JKA/American Federation from any claim, demand, or cause of action at law or equity, including, but not limited to, any claim of personal injury, that may be asserted against the JKA/American Federation by any individual or third party as a direct or indirect result of me or my club\'s participation in the practice of Karate, from my or the club\'s use of the equipment of the JKA/American Federation, from my or the club\'s participation in any activity directly or indirectly associated with the JKA/American Federation or from my or the clubs use of Karate techniques.',
  },
];

export const CERTIFY_INTRO =
  'Furthermore, by signing this applications and paying or authorizing payment of my annual membership dues, I/we certify that:';

export const CERTIFY_CLAUSES: Clause[] = [
  {
    name: 'certify_arrests',
    text: '1) I/we have never been arrested for, convicted of or received deferred adjudication for any sex offense, felony of other crime( s) of moral turpitude; or if so, I/we must apply for membership ( and receive) approval through the JKA/American Federation Main Office directly with a letter of explanation regarding complete details.',
  },
  {
    name: 'certify_incarcerated',
    text: '2) I/we have never been incarcerated in any local, state or federal jail or prison for any sex offense, felony or other crimes( s) of any nature whatsoever, or if so, I/we must apply for membership ( and receive approval) through JKA/American Federation Main Office directly with a letter of explanation regarding complete, details.',
  },
  {
    name: 'certify_physician',
    text: '3) I have consulted with and been examined by a licensed physician and released to participate in the vigorous activities associated with karate training.',
  },
];

export const FINAL_FIELDS: FormField[] = [
  {
    name: 'medical',
    label: 'Do you have any medical conditions (including infectious diseases and blood borne pathogens) that could pose a hazard to yourself or fellow students?',
    type: 'choice',
    required: true,
    options: YES_NO,
  },
  { name: 'dojo_rep', label: "Dojo's JKA/AF representative", type: 'text', required: true },
  { name: 'sign_date', label: 'Date', type: 'date', required: true },
];

export const ALL_FIELDS: FormField[] = [...DOJO_SECTIONS.flatMap((s) => s.fields), ...FINAL_FIELDS];
export const ALL_CLAUSES: Clause[] = [...AGREEMENT_CLAUSES, ...CERTIFY_CLAUSES];

export type Values = Record<string, string>;
export type Errors = Record<string, string>;

export function isVisible(f: FormField, v: Values) {
  return !f.showIf || v[f.showIf.name] === f.showIf.value;
}

export const MAX_SIGNATURE_LENGTH = 700_000;

/** Returns a map of field name -> error message (empty when valid). */
export function validateApplication(v: Values, signature: string): Errors {
  const errors: Errors = {};
  for (const f of ALL_FIELDS) {
    const val = (v[f.name] ?? '').trim();
    if (!isVisible(f, v)) continue;
    if (f.required && !val) {
      errors[f.name] = 'Required';
      continue;
    }
    if (!val) continue;
    if (f.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) errors[f.name] = 'Enter a valid email';
    if (f.type === 'number' && !/^\d{1,6}$/.test(val)) errors[f.name] = 'Enter a whole number';
    if ((f.type === 'choice' || f.type === 'select') && !f.options?.includes(val)) errors[f.name] = 'Invalid choice';
    if (val.length > 2000) errors[f.name] = 'Too long';
  }
  for (const c of ALL_CLAUSES) {
    if (v[c.name] !== 'yes') errors[c.name] = 'You must agree to continue';
  }
  if (!signature) errors.signature = 'Signature is required';
  else if (signature.length > MAX_SIGNATURE_LENGTH) errors.signature = 'Signature image is too large';
  return errors;
}
