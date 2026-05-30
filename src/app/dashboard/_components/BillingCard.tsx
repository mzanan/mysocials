'use client'

import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

const label: Record<string, string> = {
  active: 'Active',
  canceled: 'Canceling at period end',
  past_due: 'Past due',
  revoked: 'Revoked',
}

export function BillingCard({ status }: { status: string | null }) {
  const active = status === 'active'
  return (
    <Card title="Billing" desc="A subscription is required to publish your page.">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-sm text-white/70">
          Status: <span className="text-white">{status ? (label[status] ?? status) : 'No subscription'}</span>
        </span>
        {active ? (
          <Button variant="glass" onClick={() => authClient.customer.portal()}>
            Manage billing
          </Button>
        ) : (
          <Button variant="glassPrimary" onClick={() => authClient.checkout({ slug: 'pro' })}>
            Subscribe
          </Button>
        )}
      </div>
    </Card>
  )
}
