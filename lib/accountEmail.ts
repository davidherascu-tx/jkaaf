import 'server-only';
import { getUserById } from '@/lib/auth';
import { getApplication } from '@/lib/shop';
import { sendMail, simpleEmail } from '@/lib/email';
import { buildApplicationPdf } from '@/lib/applicationPdf';

const site = () => process.env.NEXT_PUBLIC_SITE_URL || '';

/** Tells a member their account was approved (activated) or declined. Never throws. */
export async function sendAccountStatusEmail(userId: number, status: 'approved' | 'rejected'): Promise<void> {
  try {
    const user = await getUserById(userId);
    if (!user) return;
    const approved = status === 'approved';
    const { html, text } = simpleEmail(
      approved ? 'Your JKA/AF account is activated' : 'Update on your JKA/AF account',
      [
        `Hello ${user.first_name},`,
        approved
          ? 'Your JKA/AF membership account has been approved. You can now sign in and order products that require approval, such as the Club Membership.'
          : 'We could not approve your JKA/AF membership account. Please contact JKA/AF if you have questions.',
        ...(approved && site() ? [`Sign in: ${site()}/account/login`] : []),
      ],
    );
    await sendMail({ to: user.email, subject: approved ? 'Your JKA/AF account is activated' : 'Your JKA/AF account', html, text });
  } catch (e) {
    console.error('[email] account status email failed:', e);
  }
}

/** Tells the applicant the result of their Dojo Membership application. Never throws. */
export async function sendApplicationResultEmail(applicationId: number): Promise<void> {
  try {
    const app = await getApplication(applicationId);
    if (!app || !app.applicant_email || app.status === 'pending') return;
    const approved = app.status === 'approved';
    const { html, text } = simpleEmail(
      approved ? 'Your Dojo Membership application was approved' : 'Update on your Dojo Membership application',
      [
        `Application for: ${app.dojo_name}`,
        approved
          ? 'Your application was approved. The Club Membership is now available in the JKA/AF shop for your account. A PDF copy of your application is attached for your records.'
          : 'Your application was not approved.',
        ...(app.admin_note ? [`Note from JKA/AF: ${app.admin_note}`] : []),
      ],
    );
    const attachments = approved
      ? [{ filename: `dojo-membership-application-${app.id}.pdf`, content: await buildApplicationPdf(app), contentType: 'application/pdf' }]
      : undefined;
    await sendMail({ to: app.applicant_email, subject: `Dojo Membership application ${approved ? 'approved' : 'update'}`, html, text, attachments });
  } catch (e) {
    console.error('[email] application result email failed:', e);
  }
}
