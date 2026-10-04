import posthog from 'posthog-js';
import {
  POSTHOG_PROXY_PATH,
  POSTHOG_UI_HOST,
  isTrackingDisabled,
  posthogPrivacyOptions,
} from '@/lib/analytics';

const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;

if (token && process.env.NODE_ENV === 'production' && !isTrackingDisabled()) {
  posthog.init(token, {
    api_host: POSTHOG_PROXY_PATH,
    ui_host: POSTHOG_UI_HOST,
    defaults: '2026-05-30',
    cookieless_mode: 'on_reject',
    ...posthogPrivacyOptions,
  });
}
