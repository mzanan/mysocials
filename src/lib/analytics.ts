export const POSTHOG_PROXY_PATH = '/relay';
export const POSTHOG_UI_HOST = 'https://eu.posthog.com';

const POSTHOG_INGEST_HOST = 'https://eu.i.posthog.com';
const POSTHOG_ASSETS_HOST = 'https://eu-assets.i.posthog.com';

export const posthogRewrites = [
  {
    source: `${POSTHOG_PROXY_PATH}/static/:path*`,
    destination: `${POSTHOG_ASSETS_HOST}/static/:path*`,
  },
  {
    source: `${POSTHOG_PROXY_PATH}/array/:path*`,
    destination: `${POSTHOG_ASSETS_HOST}/array/:path*`,
  },
  {
    source: `${POSTHOG_PROXY_PATH}/:path*`,
    destination: `${POSTHOG_INGEST_HOST}/:path*`,
  },
];

export const trailingSlashRedirect = {
  source: `/:path((?!${POSTHOG_PROXY_PATH.slice(1)}/).+)/`,
  destination: '/:path',
  permanent: true,
};

export const posthogPrivacyOptions = {
  mask_all_text: true,
  session_recording: {
    maskAllInputs: true,
    maskTextSelector: '*',
  },
};

export const CONSENT_CHANGE_EVENT = 'analytics-consent-change';
export const CONSENT_COOKIE = 'analytics_consent';

export function hasAnalyticsConsent(headers?: Headers | null): boolean {
  const cookie = headers?.get('cookie') ?? '';
  return cookie.split(';').some((part) => part.trim() === `${CONSENT_COOKIE}=granted`);
}

const NO_TRACK_KEY = 'notrack';

export function isTrackingDisabled(): boolean {
  try {
    const param = new URLSearchParams(window.location.search).get(NO_TRACK_KEY);
    if (param === '1') window.localStorage.setItem(NO_TRACK_KEY, '1');
    if (param === '0') window.localStorage.removeItem(NO_TRACK_KEY);
    return window.localStorage.getItem(NO_TRACK_KEY) === '1';
  } catch {
    return false;
  }
}

export async function captureServerEvent(event: string, distinctId: string | null) {
  const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
  if (!token || process.env.NODE_ENV !== 'production') return;
  const siteUrl = process.env.BETTER_AUTH_URL;
  try {
    await fetch(`${POSTHOG_INGEST_HOST}/i/v0/e/`, {
      method: 'POST',
      signal: AbortSignal.timeout(2000),
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: token,
        event,
        distinct_id: distinctId ?? crypto.randomUUID(),
        properties: {
          ...(siteUrl ? { $host: new URL(siteUrl).host } : {}),
          ...(distinctId ? {} : { $process_person_profile: false }),
        },
      }),
    });
  } catch {
    return;
  }
}
