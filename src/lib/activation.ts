import { headers } from 'next/headers'
import { after } from 'next/server'
import { captureServerEvent } from '@/lib/analytics'
import { hasAnalyticsConsent } from '@/lib/consentCookie'

export async function trackActivation(userId: string) {
  const distinctId = hasAnalyticsConsent(await headers()) ? userId : null
  after(() => captureServerEvent('activated', distinctId))
}
