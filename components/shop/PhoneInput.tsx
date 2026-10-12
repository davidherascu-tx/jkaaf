'use client';

import { useState, type InputHTMLAttributes } from 'react';
import { formatPhone } from '@/lib/phone';

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange' | 'value'> & {
  value?: string;
  onChange?: (value: string) => void;
};

/** Phone field that auto-formats as (555) 123-4567. Works uncontrolled (inside a form) or controlled. */
export default function PhoneInput({ value, onChange, ...rest }: Props) {
  const [own, setOwn] = useState('');
  const shown = formatPhone(value ?? own);
  return (
    <input
      {...rest}
      type="tel"
      inputMode="tel"
      autoComplete={rest.autoComplete ?? 'tel'}
      placeholder={rest.placeholder ?? '(555) 123-4567'}
      value={shown}
      onChange={(e) => {
        const f = formatPhone(e.target.value);
        setOwn(f);
        onChange?.(f);
      }}
    />
  );
}
