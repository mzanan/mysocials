import { emailLayout } from "./layout";

export function resetPassword({
  name,
  url,
}: {
  name?: string | null;
  url: string;
}) {
  return {
    subject: "Reset your password · mySocials",
    html: emailLayout({
      heading: "Reset your password",
      intro: `${name ? `Hi ${name}, w` : "W"}e received a request to reset your mySocials password. This link expires in 1 hour.`,
      ctaLabel: "Reset password",
      ctaUrl: url,
      outro:
        "If you didn't request this, you can safely ignore this email — your password stays the same.",
    }),
  };
}
