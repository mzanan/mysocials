'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import { setPublished } from '../actions'
import { ProfileSection } from './ProfileSection'
import { TabsSection } from './TabsSection'
import { LinksSection } from './LinksSection'
import { BillingCard } from './BillingCard'
import { btnPrimaryCls } from './ui'
import type { DashboardData } from './types'

function PublishBar({ data, billingEnabled }: { data: DashboardData; billingEnabled: boolean }) {
  const router = useRouter()
  const [published, setPublishedState] = useState(data.published)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const active = data.subscriptionStatus === 'active'

  function toggle() {
    setError(null)
    const next = !published
    startTransition(async () => {
      const res = await setPublished(next)
      if (!res.ok) {
        setError(res.error)
        return
      }
      setPublishedState(next)
      router.refresh()
    })
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-xs text-white/45">Your public page</p>
        <Link
          href={`/${data.username}`}
          target="_blank"
          className="inline-flex items-center gap-1.5 text-lg font-medium text-white underline-offset-4 hover:underline"
        >
          /{data.username} <ExternalLink size={15} className="text-white/40" />
        </Link>
        {error && <p className="mt-1 text-sm text-red-300/90">{error}</p>}
        {billingEnabled && !active && (
          <p className="mt-1 text-sm text-white/45">A subscription is required to publish.</p>
        )}
      </div>
      <button onClick={toggle} disabled={pending} className={btnPrimaryCls}>
        {published ? 'Published — unpublish' : 'Publish page'}
      </button>
    </div>
  )
}

export function DashboardEditor({
  data,
  billingEnabled,
  instagramEnabled,
}: {
  data: DashboardData
  billingEnabled: boolean
  instagramEnabled: boolean
}) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-white/50">Build your page. Changes save as you go.</p>
      </div>
      <PublishBar data={data} billingEnabled={billingEnabled} />
      {billingEnabled && <BillingCard status={data.subscriptionStatus} />}
      <ProfileSection data={data} />
      <TabsSection data={data} instagramEnabled={instagramEnabled} />
      <LinksSection data={data} />
    </div>
  )
}
