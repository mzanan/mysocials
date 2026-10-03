'use client'

import { useAnalyticsIdentify } from './useAnalyticsIdentify'

export function AnalyticsIdentify({ userId }: { userId: string }) {
  useAnalyticsIdentify(userId)
  return null
}
