'use client'

import { usePathname } from 'next/navigation'
import { useAnalyticsConsent } from '@/hooks/useAnalyticsConsent'

const HIDDEN_PATHS = ['/preview']

export function useCookieConsent() {
  const { status, accept, decline } = useAnalyticsConsent()
  const pathname = usePathname()

  const visible = status === 'pending' && !HIDDEN_PATHS.includes(pathname)

  return { visible, accept, decline }
}
