'use client'

import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

function daysLeft(trialEndsAt: number): number {
  const ms = trialEndsAt - Date.now()
  if (ms <= 0) return 0
  return Math.ceil(ms / 86_400_000)
}

export function TrialBanner({ trialEndsAt }: { trialEndsAt: number | null }) {
  if (trialEndsAt === null) return null
  const left = daysLeft(trialEndsAt)
  const expired = left === 0

  return (
    <Card>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-fg">
            {expired ? 'Your free trial has ended' : `Free trial — ${left} day${left === 1 ? '' : 's'} left`}
          </p>
          <p className="mt-0.5 text-xs text-fg-subtle">
            {expired
              ? 'Subscribe to keep your page online.'
              : 'Subscribe any time to keep going after the trial.'}
          </p>
        </div>
        <Button variant="glassPrimary" onClick={() => authClient.checkout({ slug: 'pro' })}>
          Subscribe
        </Button>
      </div>
    </Card>
  )
}
