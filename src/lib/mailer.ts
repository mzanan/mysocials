import { captureServerEvent } from "@/lib/analytics";

const apiKey = process.env.RESEND_API_KEY;
const from = process.env.RESEND_FROM_EMAIL;
const SEND_TIMEOUT_MS = 10_000;
const TIMEOUT_FAILURE = { code: "timeout", detail: "the mail service did not answer in time" };

export const mailerEnabled = Boolean(apiKey && from);

export type MailKind = "reset_password" | "verify_email";

export type Mail = { to: string; subject: string; html: string; kind: MailKind };

type Failure = { code: string; detail: string };

export class MailSendError extends Error {}

export async function sendMail(mail: Mail): Promise<void> {
  if (!apiKey || !from) return;

  const failure = await deliver(apiKey, from, mail);
  if (!failure) return;

  await captureServerEvent("email_send_failed", null, { kind: mail.kind, code: failure.code });
  throw new MailSendError(failure.detail);
}

async function deliver(key: string, sender: string, mail: Mail): Promise<Failure | null> {
  try {
    const { Resend } = await import("resend");
    const signal = AbortSignal.timeout(SEND_TIMEOUT_MS);
    const { error } = await new Resend(key).emails.send(
      { from: sender, to: mail.to, subject: mail.subject, html: mail.html },
      { signal },
    );
    if (!error) return null;
    if (signal.aborted) return TIMEOUT_FAILURE;
    return { code: error.name || "unknown_error", detail: error.message || "Unknown error" };
  } catch (error) {
    if (error instanceof Error) return { code: error.name, detail: error.message };
    return { code: "unknown_error", detail: "Unknown error" };
  }
}
