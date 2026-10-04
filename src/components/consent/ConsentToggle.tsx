'use client'

import { Button } from '@/components/ui/button'
import { useAnalyticsConsent } from '@/hooks/useAnalyticsConsent'

export function ConsentToggle() {
  const { status, accept, decline } = useAnalyticsConsent()

  if (status === null) return null

  const granted = status === 'granted'

  return (
    <Button variant="secondary" className="mt-3" onClick={granted ? decline : accept}>
      {granted ? 'Turn off analytics cookies' : 'Turn on analytics cookies'}
    </Button>
  )
}
