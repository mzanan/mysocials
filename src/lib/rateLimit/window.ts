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
  const remainingMs = windowStart + rule.window * 1000 - now
  return { allowed: false, retryAfter: Math.max(1, Math.ceil(remainingMs / 1000)) }
}
