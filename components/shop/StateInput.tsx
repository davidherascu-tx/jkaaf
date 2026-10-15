'use client';

import { useId, type InputHTMLAttributes } from 'react';
import { regionsFor } from '@/lib/regions';

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'list'> & {
  /** United States (default), Canada or Mexico: decides which states / provinces are suggested. */
  country?: string;
};

/** State field with auto-find: start typing "tex" or "TX" and the matching states are suggested. */
export default function StateInput({ country, ...rest }: Props) {
  const listId = useId();
  const regions = regionsFor(country);
  return (
    <>
      <input
        {...rest}
        type="text"
        list={listId}
        autoComplete={rest.autoComplete ?? 'off'}
        autoCapitalize="words"
        spellCheck={false}
        placeholder={rest.placeholder ?? 'Start typing…'}
      />
      <datalist id={listId}>
        {regions.map((r) => (
          <option key={r.code} value={r.name} label={r.code === r.name ? undefined : r.code} />
        ))}
      </datalist>
    </>
  );
}
