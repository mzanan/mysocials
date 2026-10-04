'use client'

import { useCallback, useSyncExternalStore } from 'react'
import { readConsent, readServerConsent, setConsent, subscribeConsent } from '@/lib/consent'

export function useAnalyticsConsent() {
  const status = useSyncExternalStore(subscribeConsent, readConsent, readServerConsent)

  const accept = useCallback(() => setConsent(true), [])
  const decline = useCallback(() => setConsent(false), [])

  return { status, accept, decline }
}
