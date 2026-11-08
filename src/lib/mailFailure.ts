import { MailSendError } from "@/lib/mailer";
import { CONTACT_EMAIL } from "@/lib/site";

export function mailFailureMessage(error: unknown): string {
  if (!(error instanceof MailSendError)) throw error;
  return `We couldn't send the email (${error.message}). Write to ${CONTACT_EMAIL} and we'll help you.`;
}
