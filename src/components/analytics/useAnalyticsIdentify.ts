'use client'

import posthog from 'posthog-js'
import { useEffect } from 'react'

export function useAnalyticsIdentify(userId: string) {
  useEffect(() => {
    if (posthog.__loaded) posthog.identify(userId)
  }, [userId])
}
