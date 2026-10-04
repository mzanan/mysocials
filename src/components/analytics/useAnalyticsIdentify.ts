'use client'

import posthog from 'posthog-js'
import { useEffect } from 'react'
import { useAnalyticsConsent } from '@/hooks/useAnalyticsConsent'

export function useAnalyticsIdentify(userId: string) {
  const { status } = useAnalyticsConsent()

  useEffect(() => {
    if (status === 'granted') posthog.identify(userId)
  }, [status, userId])
}
