import { eq } from 'drizzle-orm'

import { db } from '@/lib/db'
import { profiles } from '@/lib/db/schema'
import { billingEnabled, hasActiveSubscription } from '@/lib/subscription'

export async function listIndexableProfiles() {
  const rows = await db
    .select({
      username: profiles.username,
      updatedAt: profiles.updated_at,
      subscription_status: profiles.subscription_status,
      subscription_current_period_end: profiles.subscription_current_period_end,
    })
    .from(profiles)
    .where(eq(profiles.published, true))
  const billing = billingEnabled()
  return rows
    .filter((row) => !billing || hasActiveSubscription(row))
    .map((row) => ({ username: row.username, updatedAt: row.updatedAt }))
}
