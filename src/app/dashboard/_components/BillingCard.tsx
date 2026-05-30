'use client'

import { authClient } from '@/lib/auth-client'
import { Card, btnCls, btnPrimaryCls } from './ui'

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
          <button className={btnCls} onClick={() => authClient.customer.portal()}>
            Manage billing
          </button>
        ) : (
          <button className={btnPrimaryCls} onClick={() => authClient.checkout({ slug: 'pro' })}>
            Subscribe
          </button>
        )}
      </div>
    </Card>
  )
}
