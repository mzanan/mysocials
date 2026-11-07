import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
const from = process.env.RESEND_FROM_EMAIL;

export const mailerEnabled = Boolean(apiKey && from);

type Mail = { to: string; subject: string; html: string };

export async function sendMail({ to, subject, html }: Mail): Promise<void> {
  if (!apiKey || !from) return;

  const { error } = await new Resend(apiKey).emails.send({
    from,
    to,
    subject,
    html,
  });

  if (error) throw new Error(`Resend send failed: ${error.name}: ${error.message}`);
}
