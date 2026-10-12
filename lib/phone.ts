/** Formats US phone numbers as (555) 123-4567 while typing. Numbers starting with "+" are left alone (international). */
export function formatPhone(raw: string): string {
  if (raw.trim().startsWith('+')) return raw;
  let d = raw.replace(/\D/g, '');
  if (d.length > 10 && d.startsWith('1')) d = d.slice(1);
  d = d.slice(0, 10);
  if (d.length === 0) return '';
  if (d.length <= 3) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}
