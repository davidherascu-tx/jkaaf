import { parseDollars } from '@/lib/money';
import type { Choice } from '@/lib/shop';

// One choice per line:  Label | extra price | flags
//   "Ship to me | 1.00"          -> +$1.00
//   "Yearly | 0 | recurring"     -> renews yearly
//   "Pick up | 0 | noship"       -> no shipping address needed
export function choicesToText(choices: Choice[] = []): string {
  return choices
    .map((c) => {
      const flags = [c.recurring && 'recurring', c.noShip && 'noship'].filter(Boolean).join(',');
      const parts = [c.label, (c.priceCents / 100).toFixed(2)];
      if (flags) parts.push(flags);
      return parts.join(' | ');
    })
    .join('\n');
}

export function textToChoices(text: string): Choice[] | { error: string } {
  const out: Choice[] = [];
  for (const raw of text.split('\n')) {
    const line = raw.trim();
    if (!line) continue;
    const [label, price = '0', flags = ''] = line.split('|').map((s) => s.trim());
    const cents = parseDollars(price || '0');
    if (!label || cents === null) return { error: `Invalid choice line: "${line}" (use: Label | 1.00 | recurring)` };
    const f = flags.split(',').map((s) => s.trim().toLowerCase());
    out.push({
      label,
      priceCents: cents,
      ...(f.includes('recurring') ? { recurring: true } : {}),
      ...(f.includes('noship') ? { noShip: true } : {}),
    });
  }
  return out;
}
