'use server';

import { redirect } from 'next/navigation';
import { getUser, getUserById } from '@/lib/auth';
import { createAccount } from '@/lib/accounts';
import { createApplication } from '@/lib/shop';
import { ALL_CLAUSES, ALL_FIELDS, isVisible, validateApplication, type Values } from '@/lib/dojoForm';

const SIGNATURE_RE = /^(typed:[^]{2,100}|data:image\/(png|jpeg);base64,[A-Za-z0-9+/=]+)$/;

export interface AccountValues {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  confirm: string;
}

export async function submitApplicationAction(
  values: Values,
  signature: string,
  account: AccountValues | null,
): Promise<{ error: string } | undefined> {
  let user = await getUser();

  const errors = validateApplication(values, signature);
  if (Object.keys(errors).length > 0 || !SIGNATURE_RE.test(signature)) {
    return { error: 'Please complete all required fields and sign the application.' };
  }

  // Guests create their account as part of the application.
  if (!user) {
    if (!account) return { error: 'Please enter your account details.' };
    const res = await createAccount({ ...account, dojo: values.dojo_name, phone: values.ci_phone, rank: values.ci_jka_rank });
    if ('error' in res) return { error: res.error };
    user = getUserById(res.id);
    if (!user) return { error: 'Could not create your account. Please try again.' };
  }

  // Persist only known fields (ignore anything extra a client might send).
  const clean: Record<string, string> = {};
  for (const f of ALL_FIELDS) if (isVisible(f, values)) clean[f.name] = (values[f.name] ?? '').trim();
  for (const c of ALL_CLAUSES) clean[c.name] = 'yes';

  createApplication(user.id, clean, signature);
  redirect('/account?applied=1');
}
