export const GENERIC_ERROR = "Something went wrong. Try again.";
export const INVALID_EMAIL = "That doesn't look like a valid email.";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_RE.test(value);
}
