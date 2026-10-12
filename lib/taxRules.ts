// Sales tax rules (pure, safe for client components).
// Tax is the destination state's base rate (local/city/county taxes are not included).
// Every order needs an address (shipping, or billing when nothing ships); tax is charged once its state is known.

/** [code, name, state sales tax %] */
export const STATE_TAX: readonly [string, string, number][] = [
  ["AL", "Alabama", 4],
  ["AK", "Alaska", 0],
  ["AZ", "Arizona", 5.6],
  ["AR", "Arkansas", 6.5],
  ["CA", "California", 7.25],
  ["CO", "Colorado", 2.9],
  ["CT", "Connecticut", 6.35],
  ["DE", "Delaware", 0],
  ["DC", "District of Columbia", 6],
  ["FL", "Florida", 6],
  ["GA", "Georgia", 4],
  ["HI", "Hawaii", 4],
  ["ID", "Idaho", 6],
  ["IL", "Illinois", 6.25],
  ["IN", "Indiana", 7],
  ["IA", "Iowa", 6],
  ["KS", "Kansas", 6.5],
  ["KY", "Kentucky", 6],
  ["LA", "Louisiana", 5],
  ["ME", "Maine", 5.5],
  ["MD", "Maryland", 6],
  ["MA", "Massachusetts", 6.25],
  ["MI", "Michigan", 6],
  ["MN", "Minnesota", 6.875],
  ["MS", "Mississippi", 7],
  ["MO", "Missouri", 4.225],
  ["MT", "Montana", 0],
  ["NE", "Nebraska", 5.5],
  ["NV", "Nevada", 6.85],
  ["NH", "New Hampshire", 0],
  ["NJ", "New Jersey", 6.625],
  ["NM", "New Mexico", 4.875],
  ["NY", "New York", 4],
  ["NC", "North Carolina", 4.75],
  ["ND", "North Dakota", 5],
  ["OH", "Ohio", 5.75],
  ["OK", "Oklahoma", 4.5],
  ["OR", "Oregon", 0],
  ["PA", "Pennsylvania", 6],
  ["RI", "Rhode Island", 7],
  ["SC", "South Carolina", 6],
  ["SD", "South Dakota", 4.2],
  ["TN", "Tennessee", 7],
  ["TX", "Texas", 6.25],
  ["UT", "Utah", 6.1],
  ["VT", "Vermont", 6],
  ["VA", "Virginia", 5.3],
  ["WA", "Washington", 6.5],
  ["WV", "West Virginia", 6],
  ["WI", "Wisconsin", 5],
  ["WY", "Wyoming", 4],
];

/** Tax rate (e.g. 0.0625) for a state code or name; 0 when blank or unrecognised. */
export function stateRate(state: string): number {
  const s = state.trim().toLowerCase().replace(/\./g, "");
  const hit = STATE_TAX.find(
    ([code, name]) => code.toLowerCase() === s || name.toLowerCase() === s,
  );
  return hit ? hit[2] / 100 : 0;
}

export function salesTaxCents(subtotalCents: number, state: string): number {
  return Math.round(subtotalCents * stateRate(state));
}

/** "6.25%" */
export const rateLabel = (rate: number) => `${+(rate * 100).toFixed(3)}%`;
