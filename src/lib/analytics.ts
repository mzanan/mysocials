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
