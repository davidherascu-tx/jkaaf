import 'server-only';
import { getUserById } from '@/lib/auth';
import { siteUrl } from '@/lib/siteUrl';
import { getApplication } from '@/lib/shop';
import { sendMail, simpleEmail } from '@/lib/email';
import { buildApplicationPdf } from '@/lib/applicationPdf';

const site = siteUrl;

/** Tells a member their JKA/AF Individual Membership was approved or declined. Never throws. */
export async function sendAccountStatusEmail(userId: number, status: 'approved' | 'rejected'): Promise<void> {
  try {
    const user = await getUserById(userId);
    if (!user) return;
    const approved = status === 'approved';
    const { html, text } = simpleEmail(
      approved ? 'Your JKA/AF Individual Membership is approved' : 'Update on your JKA/AF Individual Membership',
      [
        `Hello ${user.first_name},`,
        approved
          ? 'Good news: your JKA/AF Individual Membership has been approved. You can now sign in and order from the JKA/AF shop.'
          : 'We could not approve your JKA/AF Individual Membership. Please contact JKA/AF if you have questions.',
        ...(approved ? [`Sign in: ${await site()}/account/login`] : []),
      ],
    );
    await sendMail({ to: user.email, subject: approved ? 'Your JKA/AF Individual Membership is approved' : 'Your JKA/AF Individual Membership', html, text });
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
          ? 'Your application was approved. The Club Membership is now available in the JKA/AF shop for your account (once your JKA/AF Individual Membership is also approved). A PDF copy of your application is attached for your records.'
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

/** Tells JKA/AF a customer asked for Individual Membership approval. Never throws. */
export async function sendApprovalRequestEmail(userId: number): Promise<void> {
  try {
    const to = process.env.APPLICATION_NOTIFY_EMAIL || process.env.ORDER_NOTIFY_EMAIL || '';
    if (!to) {
      console.warn('[email] Set APPLICATION_NOTIFY_EMAIL (or ORDER_NOTIFY_EMAIL) to be told about membership approval requests.');
      return;
    }
    const user = await getUserById(userId);
    if (!user) return;
    const { html, text } = simpleEmail('JKA/AF Individual Membership approval requested', [
      `${user.first_name} ${user.last_name} (${user.email}) asked to be approved.`,
      `Dojo: ${user.dojo || '-'}  ·  Rank: ${user.rank || '-'}`,
      ...(user.approval_note ? [`Note: ${user.approval_note}`] : []),
      `Review: ${await site()}/admin/dojo/members`,
    ]);
    await sendMail({ to, subject: `Membership approval requested: ${user.first_name} ${user.last_name}`, html, text });
  } catch (e) {
    console.error('[email] approval request email failed:', e);
  }
}
