import posthog from 'posthog-js'
import { CONSENT_CHANGE_EVENT, CONSENT_COOKIE } from '@/lib/analytics'

export type ConsentStatus = 'granted' | 'denied' | 'pending'

export function subscribeConsent(onChange: () => void) {
  window.addEventListener(CONSENT_CHANGE_EVENT, onChange)
  window.addEventListener('storage', onChange)
  return () => {
    window.removeEventListener(CONSENT_CHANGE_EVENT, onChange)
    window.removeEventListener('storage', onChange)
  }
}

export function readConsent(): ConsentStatus | null {
  return posthog.__loaded ? posthog.get_explicit_consent_status() : null
}

export function readServerConsent(): ConsentStatus | null {
  return null
}

export function setConsent(granted: boolean) {
  if (granted) posthog.opt_in_capturing()
  else posthog.opt_out_capturing()
  document.cookie = `${CONSENT_COOKIE}=${granted ? 'granted' : 'denied'}; path=/; max-age=31536000; samesite=lax; secure`
  window.dispatchEvent(new Event(CONSENT_CHANGE_EVENT))
}
