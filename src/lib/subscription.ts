import { eq } from 'drizzle-orm'

import { db } from '@/lib/db'
import { profiles } from '@/lib/db/schema'

export type SubscriptionStatus =
  | 'active'
  | 'canceled'
  | 'past_due'
  | 'revoked'
  | null

export interface SubscriptionState {
  subscription_status: SubscriptionStatus
  subscription_current_period_end: Date | null
}

export function hasActiveSubscription(p: SubscriptionState): boolean {
  if (p.subscription_status === 'active') return true
  if (
    p.subscription_status === 'canceled' &&
    p.subscription_current_period_end &&
    p.subscription_current_period_end.getTime() > Date.now()
  ) {
    return true
  }
  return false
}

export function billingEnabled(): boolean {
  return Boolean(process.env.POLAR_PRODUCT_ID)
}

export async function requirePublishAccess(
  userId: string,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  if (!billingEnabled()) return { ok: true }
  const p = await db.query.profiles.findFirst({ where: eq(profiles.user_id, userId) })
  if (!p) return { ok: false, reason: 'Profile not found' }
  return hasActiveSubscription(p)
    ? { ok: true }
    : { ok: false, reason: 'Subscribe to publish your page.' }
}
