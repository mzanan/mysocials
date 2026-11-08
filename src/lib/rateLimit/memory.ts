import { toDecision, windowCutoff, type RateLimitDecision, type RateLimitRule } from './window'

const MAX_ENTRIES = 10_000

const entries = new Map<string, { count: number; windowStart: number }>()

export function consumeInMemory(key: string, rule: RateLimitRule): RateLimitDecision {
  const now = Date.now()
  const current = entries.get(key)
  const next =
    !current || current.windowStart <= windowCutoff(now, rule)
      ? { count: 1, windowStart: now }
      : { count: current.count + 1, windowStart: current.windowStart }

  entries.delete(key)
  entries.set(key, next)
  if (entries.size > MAX_ENTRIES) {
    const oldest = entries.keys().next().value
    if (oldest !== undefined) entries.delete(oldest)
  }

  return toDecision(next.count, next.windowStart, now, rule)
}
