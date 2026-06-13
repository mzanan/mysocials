'use client'

import { useState } from 'react'
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
  const [loading, setLoading] = useState(false)
  const hasActiveSub = status === 'active'

  async function handleCheckout() {
    setLoading(true)
    try {
      await authClient.checkout({ slug: 'pro' })
    } catch (err) {
      console.error('Checkout error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card title="Billing" desc={hasActiveSub ? 'Your subscription is active.' : 'A subscription is required to publish your page.'}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-sm text-fg-muted">
          Status: <span className="text-fg">{status ? (label[status] ?? status) : 'No subscription'}</span>
        </span>
        {hasActiveSub ? (
          <Button variant="glass" onClick={() => authClient.customer.portal()}>
            Manage billing
          </Button>
        ) : (
          <Button variant="glassPrimary" onClick={handleCheckout} disabled={loading}>
            {loading ? (
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              'Subscribe'
            )}
          </Button>
        )}
      </div>
    </Card>
  )
}
