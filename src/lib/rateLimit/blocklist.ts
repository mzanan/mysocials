import { blockedUntil, type RateLimitDecision } from './window'

const MAX_ENTRIES = 10_000

const blocks = new Map<string, number>()

export function knownBlock(key: string, now: number): RateLimitDecision | null {
  const until = blocks.get(key)
  if (until === undefined) return null
  if (until <= now) {
    blocks.delete(key)
    return null
  }
  return blockedUntil(until, now)
}

export function rememberBlock(key: string, decision: RateLimitDecision, now: number): void {
  if (decision.allowed || decision.retryAfter === null) return
  blocks.delete(key)
  blocks.set(key, now + decision.retryAfter * 1000)
  if (blocks.size > MAX_ENTRIES) {
    const oldest = blocks.keys().next().value
    if (oldest !== undefined) blocks.delete(oldest)
  }
}
