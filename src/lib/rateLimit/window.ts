export type RateLimitRule = { window: number; max: number }

export type RateLimitDecision = { allowed: boolean; retryAfter: number | null }

export function windowCutoff(now: number, rule: RateLimitRule): number {
  return now - rule.window * 1000
}

export function toDecision(
  count: number,
  windowStart: number,
  now: number,
  rule: RateLimitRule,
): RateLimitDecision {
  if (count <= rule.max) return { allowed: true, retryAfter: null }
  return blockedUntil(windowStart + rule.window * 1000, now)
}

export function blockedUntil(until: number, now: number): RateLimitDecision {
  return { allowed: false, retryAfter: Math.max(1, Math.ceil((until - now) / 1000)) }
}
