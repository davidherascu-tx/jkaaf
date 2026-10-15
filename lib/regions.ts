// States / provinces for the "State" fields. Client-safe (no server-only imports).

export interface Region {
  name: string;
  code: string;
}

export const US_STATES: Region[] = [
  { name: 'Alabama', code: 'AL' }, { name: 'Alaska', code: 'AK' }, { name: 'Arizona', code: 'AZ' }, { name: 'Arkansas', code: 'AR' },
  { name: 'California', code: 'CA' }, { name: 'Colorado', code: 'CO' }, { name: 'Connecticut', code: 'CT' }, { name: 'Delaware', code: 'DE' },
  { name: 'District of Columbia', code: 'DC' }, { name: 'Florida', code: 'FL' }, { name: 'Georgia', code: 'GA' }, { name: 'Hawaii', code: 'HI' },
  { name: 'Idaho', code: 'ID' }, { name: 'Illinois', code: 'IL' }, { name: 'Indiana', code: 'IN' }, { name: 'Iowa', code: 'IA' },
  { name: 'Kansas', code: 'KS' }, { name: 'Kentucky', code: 'KY' }, { name: 'Louisiana', code: 'LA' }, { name: 'Maine', code: 'ME' },
  { name: 'Maryland', code: 'MD' }, { name: 'Massachusetts', code: 'MA' }, { name: 'Michigan', code: 'MI' }, { name: 'Minnesota', code: 'MN' },
  { name: 'Mississippi', code: 'MS' }, { name: 'Missouri', code: 'MO' }, { name: 'Montana', code: 'MT' }, { name: 'Nebraska', code: 'NE' },
  { name: 'Nevada', code: 'NV' }, { name: 'New Hampshire', code: 'NH' }, { name: 'New Jersey', code: 'NJ' }, { name: 'New Mexico', code: 'NM' },
  { name: 'New York', code: 'NY' }, { name: 'North Carolina', code: 'NC' }, { name: 'North Dakota', code: 'ND' }, { name: 'Ohio', code: 'OH' },
  { name: 'Oklahoma', code: 'OK' }, { name: 'Oregon', code: 'OR' }, { name: 'Pennsylvania', code: 'PA' }, { name: 'Rhode Island', code: 'RI' },
  { name: 'South Carolina', code: 'SC' }, { name: 'South Dakota', code: 'SD' }, { name: 'Tennessee', code: 'TN' }, { name: 'Texas', code: 'TX' },
  { name: 'Utah', code: 'UT' }, { name: 'Vermont', code: 'VT' }, { name: 'Virginia', code: 'VA' }, { name: 'Washington', code: 'WA' },
  { name: 'West Virginia', code: 'WV' }, { name: 'Wisconsin', code: 'WI' }, { name: 'Wyoming', code: 'WY' },
  { name: 'American Samoa', code: 'AS' }, { name: 'Guam', code: 'GU' }, { name: 'Northern Mariana Islands', code: 'MP' },
  { name: 'Puerto Rico', code: 'PR' }, { name: 'U.S. Virgin Islands', code: 'VI' },
];

export const CA_PROVINCES: Region[] = [
  { name: 'Alberta', code: 'AB' }, { name: 'British Columbia', code: 'BC' }, { name: 'Manitoba', code: 'MB' },
  { name: 'New Brunswick', code: 'NB' }, { name: 'Newfoundland and Labrador', code: 'NL' }, { name: 'Northwest Territories', code: 'NT' },
  { name: 'Nova Scotia', code: 'NS' }, { name: 'Nunavut', code: 'NU' }, { name: 'Ontario', code: 'ON' },
  { name: 'Prince Edward Island', code: 'PE' }, { name: 'Quebec', code: 'QC' }, { name: 'Saskatchewan', code: 'SK' }, { name: 'Yukon', code: 'YT' },
];

export const MX_STATES: Region[] = [
  'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche', 'Chiapas', 'Chihuahua', 'Ciudad de México', 'Coahuila', 'Colima',
  'Durango', 'Guanajuato', 'Guerrero', 'Hidalgo', 'Jalisco', 'México', 'Michoacán', 'Morelos', 'Nayarit', 'Nuevo León', 'Oaxaca', 'Puebla',
  'Querétaro', 'Quintana Roo', 'San Luis Potosí', 'Sinaloa', 'Sonora', 'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz', 'Yucatán', 'Zacatecas',
].map((name) => ({ name, code: name }));

/** Suggestions for the chosen country (United States when blank or unknown). */
export function regionsFor(country?: string): Region[] {
  if (country === 'Canada') return CA_PROVINCES;
  if (country === 'Mexico') return MX_STATES;
  return US_STATES;
}

/** "texas" / "Tx" -> "TX". Anything that is not a known US state is returned trimmed, as typed. */
export function normalizeUsState(input: string): string {
  const v = input.trim();
  const hit = US_STATES.find((s) => s.code.toLowerCase() === v.toLowerCase() || s.name.toLowerCase() === v.toLowerCase());
  return hit ? hit.code : v;
}
