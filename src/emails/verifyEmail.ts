import { emailLayout } from "./layout";

export function verifyEmail({ url }: { url: string }) {
  return {
    subject: "Verify your email · mySocials",
    html: emailLayout({
      heading: "Welcome",
      intro: "Confirm your email address to secure your mySocials account.",
      ctaLabel: "Verify email",
      ctaUrl: url,
      outro:
        "If you didn't create this account, you can safely ignore this email.",
    }),
  };
}
