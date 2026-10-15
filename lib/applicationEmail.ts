import 'server-only';
import { getApplication } from '@/lib/shop';
import { buildApplicationPdf } from '@/lib/applicationPdf';
import { sendMail, simpleEmail } from '@/lib/email';

/** Where new applications are sent: APPLICATION_NOTIFY_EMAIL, else ORDER_NOTIFY_EMAIL. */
const ownerAddress = () => process.env.APPLICATION_NOTIFY_EMAIL || process.env.ORDER_NOTIFY_EMAIL || '';

/**
 * Emails the finished application: the PDF goes to JKA/AF, and the applicant gets a "submitted, waiting for approval" notice.
 * Never throws: a mail problem must not lose the application (it is already saved).
 */
export async function sendApplicationEmails(applicationId: number): Promise<void> {
  try {
    const app = await getApplication(applicationId);
    if (!app) return;
    const pdf = await buildApplicationPdf(app);
    const attachments = [{ filename: `dojo-membership-application-${app.id}.pdf`, content: pdf, contentType: 'application/pdf' }];

    const owner = ownerAddress();
    if (owner) {
      const { html, text } = simpleEmail('New Dojo Membership application', [
        `Dojo: ${app.dojo_name}`,
        `Chief instructor: ${app.chief_instructor}`,
        `Applicant account: ${app.applicant_email ?? 'unknown'}`,
        'The completed application is attached as a PDF. You can also review and approve it in the shop dashboard under Dojo applications.',
      ]);
      await sendMail({ to: owner, subject: `New Dojo Membership application: ${app.dojo_name}`, html, text, attachments });
    } else {
      console.warn('[email] Set APPLICATION_NOTIFY_EMAIL (or ORDER_NOTIFY_EMAIL) to receive new applications by email.');
    }

    if (app.applicant_email) {
      const { html, text } = simpleEmail('Your Dojo Membership application was submitted', [
        `Thank you. JKA/AF received the Dojo Membership application for ${app.dojo_name}.`,
        'Your application is now waiting for approval. An administrator will review it, and you will get another email as soon as it is approved. That email will include a PDF copy of your application for your records.',
      ]);
      await sendMail({ to: app.applicant_email, subject: 'Dojo Membership application submitted - waiting for approval', html, text });
    }
  } catch (e) {
    console.error('[email] application email failed:', e);
  }
}
