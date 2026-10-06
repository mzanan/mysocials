'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Text } from '@/components/ui/text'
import { useCookieConsent } from './useCookieConsent'

export function CookieConsent() {
  const { visible, accept, decline } = useCookieConsent()

  if (!visible) return null

  return (
    <div
      role="region"
      aria-label="Cookie consent"
      className="bottom-consent fixed inset-x-4 z-40 sm:mx-auto sm:max-w-sm lg:mr-0"
    >
      <Card className="flex flex-col gap-3">
        <Text>
          We use first-party cookies for analytics and text-masked session replay, never ads. Decline and we
          only count visits anonymously.{' '}
          <Link href="/privacy" className="text-fg underline underline-offset-4">
            Privacy policy
          </Link>
        </Text>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="secondary" size="auth" onClick={decline}>
            Decline
          </Button>
          <Button variant="secondary" size="auth" onClick={accept}>
            Accept
          </Button>
        </div>
      </Card>
    </div>
  )
}
