'use client'

import { useState } from 'react'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'

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
          <Button variant="secondary" onClick={() => authClient.customer.portal()}>
            Manage billing
          </Button>
        ) : (
          <Button variant="primary" onClick={handleCheckout} disabled={loading}>
            {loading ? <Spinner /> : 'Subscribe'}
          </Button>
        )}
      </div>
    </Card>
  )
}
