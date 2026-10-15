'use server';

import { redirect } from 'next/navigation';
import { after } from 'next/server';
import { sendApplicationEmails } from '@/lib/applicationEmail';
import { getUser } from '@/lib/auth';
import { createApplication } from '@/lib/shop';
import { ALL_CLAUSES, ALL_FIELDS, isVisible, validateApplication, type Values } from '@/lib/dojoForm';

const SIGNATURE_RE = /^data:image\/png;base64,[A-Za-z0-9+/=]+$/;

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
  const user = await getUser();
  if (!user) return { error: 'Please sign in to submit a Dojo Membership application.' };

  const errors = validateApplication(values, signature);
  if (Object.keys(errors).length > 0 || !SIGNATURE_RE.test(signature)) {
    return { error: 'Please complete all required fields and sign the application.' };
  }

  // Persist only known fields (ignore anything extra a client might send).
  const clean: Record<string, string> = {};
  for (const f of ALL_FIELDS) if (isVisible(f, values)) clean[f.name] = (values[f.name] ?? '').trim();
  for (const c of ALL_CLAUSES) clean[c.name] = 'yes';

  const applicationId = await createApplication(user.id, clean, signature);
  after(() => sendApplicationEmails(applicationId));
  redirect('/account?applied=1');
}
