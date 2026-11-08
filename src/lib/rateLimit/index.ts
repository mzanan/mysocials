import type { BetterAuthOptions } from 'better-auth'

import { knownBlock, rememberBlock } from './blocklist'
import { consumeInDatabase } from './database'
import { consumeInMemory } from './memory'
import type { RateLimitDecision, RateLimitRule } from './window'

type RateLimitStorage = NonNullable<NonNullable<BetterAuthOptions['rateLimit']>['customStorage']>

const PERSISTED_PATHS = new Set([
  '/sign-in/email',
  '/sign-in/social',
  '/sign-up/email',
  '/change-password',
  '/change-email',
  '/request-password-reset',
  '/send-verification-email',
])

function pathOf(key: string): string {
  return key.slice(key.indexOf('|') + 1)
}

async function consumePersisted(key: string, rule: RateLimitRule): Promise<RateLimitDecision> {
  const now = Date.now()
  const blocked = knownBlock(key, now)
  if (blocked) return blocked
  try {
    const decision = await consumeInDatabase(key, rule)
    rememberBlock(key, decision, now)
    return decision
  } catch (error) {
    console.error('Rate limit storage failed, request rejected', error)
    return { allowed: false, retryAfter: rule.window }
  }
}

export const rateLimitStorage: RateLimitStorage = {
  consume: async (key, rule) =>
    PERSISTED_PATHS.has(pathOf(key)) ? consumePersisted(key, rule) : consumeInMemory(key, rule),
}
