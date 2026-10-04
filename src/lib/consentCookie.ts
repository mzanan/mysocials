export const CONSENT_COOKIE = "analytics_consent";

const CONSENT_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

export function consentCookie(granted: boolean): string {
  const value = granted ? "granted" : "denied";
  return `${CONSENT_COOKIE}=${value}; path=/; max-age=${CONSENT_MAX_AGE_SECONDS}; samesite=lax; secure`;
}

export function hasAnalyticsConsent(headers?: Headers | null): boolean {
  const cookie = headers?.get("cookie") ?? "";
  return cookie
    .split(";")
    .some((part) => part.trim() === `${CONSENT_COOKIE}=granted`);
}
