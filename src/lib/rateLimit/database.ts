import { sql } from 'drizzle-orm'

import { db } from '@/lib/db'
import { rate_limits } from '@/lib/db/schema'

import { toDecision, windowCutoff, type RateLimitDecision, type RateLimitRule } from './window'

export async function consumeInDatabase(
  key: string,
  rule: RateLimitRule,
): Promise<RateLimitDecision> {
  const now = Date.now()
  const expired = sql`${rate_limits.window_start} <= ${windowCutoff(now, rule)}`

  const [row] = await db
    .insert(rate_limits)
    .values({ key, count: 1, window_start: now })
    .onConflictDoUpdate({
      target: rate_limits.key,
      set: {
        count: sql`CASE WHEN ${expired} THEN 1 ELSE ${rate_limits.count} + 1 END`,
        window_start: sql`CASE WHEN ${expired} THEN ${now} ELSE ${rate_limits.window_start} END`,
      },
    })
    .returning({ count: rate_limits.count, windowStart: rate_limits.window_start })

  return toDecision(row.count, row.windowStart, now, rule)
}
