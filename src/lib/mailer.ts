const host = process.env.SMTP_HOST;
const port = process.env.SMTP_PORT;
const user = process.env.SMTP_USERNAME;
const pass = process.env.SMTP_PASSWORD;
const from = process.env.SMTP_FROM_EMAIL;

export const mailerEnabled = Boolean(host && port && user && pass && from);

type Mail = { to: string; subject: string; html: string };

export async function sendMail({ to, subject, html }: Mail): Promise<void> {
  if (!mailerEnabled) return;

  const { createTransport } = await import("nodemailer");
  const transport = createTransport({
    host,
    port: Number(port),
    secure: Number(port) === 465,
    auth: { user, pass },
  });

  await transport.sendMail({ from, to, subject, html });
}
