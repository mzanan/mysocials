import { eq } from 'drizzle-orm'

import { db } from '@/lib/db'
import { profiles } from '@/lib/db/schema'

export type SubscriptionStatus =
  | 'trialing'
  | 'active'
  | 'canceled'
  | 'past_due'
  | 'revoked'
  | null

export interface SubscriptionState {
  subscription_status: SubscriptionStatus
  subscription_current_period_end: Date | null
  trial_ends_at: Date | null
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

export function isTrialActive(p: SubscriptionState): boolean {
  return (
    p.subscription_status === 'trialing' &&
    p.trial_ends_at !== null &&
    p.trial_ends_at.getTime() > Date.now()
  )
}

export function hasAccess(p: SubscriptionState): boolean {
  return hasActiveSubscription(p) || isTrialActive(p)
}

export function trialDaysLeft(p: SubscriptionState): number {
  if (!p.trial_ends_at) return 0
  const ms = p.trial_ends_at.getTime() - Date.now()
  if (ms <= 0) return 0
  return Math.ceil(ms / 86_400_000)
}

export function billingEnabled(): boolean {
  return Boolean(process.env.POLAR_PRODUCT_ID)
}

export const TRIAL_DURATION_MS = 7 * 24 * 60 * 60 * 1000

export async function requirePublishAccess(
  userId: string,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  if (!billingEnabled()) return { ok: true }
  const p = await db.query.profiles.findFirst({ where: eq(profiles.user_id, userId) })
  if (!p) return { ok: false, reason: 'Profile not found' }
  return hasAccess(p)
    ? { ok: true }
    : { ok: false, reason: 'Your free trial has ended. Subscribe to keep publishing.' }
}
