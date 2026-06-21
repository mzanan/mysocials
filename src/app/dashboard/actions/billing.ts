'use server'

import { syncSubscriptionFromPolar } from '@/lib/polar'
import { requireUserId, revalidate } from './_helpers'

export async function confirmCheckout(): Promise<{ active: boolean }> {
  const uid = await requireUserId()
  const active = await syncSubscriptionFromPolar(uid, {
    downgrade: false,
    publishOnActivate: true,
  })
  if (active) revalidate()
  return { active }
}
