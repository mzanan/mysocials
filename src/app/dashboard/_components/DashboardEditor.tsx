'use client'

import { Suspense, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import { setPublished } from '../actions'
import { IgConnectStatus } from './IgConnectStatus'
import { DashboardStore } from './DashboardStore'
import { ImportProvider } from './ImportProvider'
import { MediaUndoProvider } from './MediaUndoProvider'
import { DashboardTabs } from './DashboardTabs'
import { AgentChat } from './AgentChat'
import { SubscribeGate } from './SubscribeGate'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Text } from '@/components/ui/text'
import type { DashboardData } from '@/types/dashboard'

function PageHero({ data, billingEnabled }: { data: DashboardData; billingEnabled: boolean }) {
  const router = useRouter()
  const [published, setPublishedState] = useState(data.published)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const [showGate, setShowGate] = useState(false)

  const hasActiveSub = data.subscriptionStatus === 'active'

  function toggle() {
    setError(null)
    const next = !published
    if (billingEnabled && next && !hasActiveSub) {
      setShowGate(true)
      return
    }
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

  if (showGate) {
    return <SubscribeGate username={data.username} />
  }

  return (
    <Card>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <Text variant="caption">Your public page</Text>
          <Link
            href={`/${data.username}`}
            target="_blank"
            className="mt-0.5 inline-flex max-w-full items-center gap-1.5 text-xl font-semibold tracking-tight text-fg underline-offset-4 hover:underline"
          >
            <span className="truncate">/{data.username}</span>
            <ExternalLink size={16} className="shrink-0 text-fg-subtle" />
          </Link>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                published ? 'bg-accent/15 text-fg' : 'bg-surface-strong text-fg-subtle'
              }`}
            >
              {published ? 'Published' : 'Draft'}
            </span>
            {billingEnabled && !hasActiveSub && (
              <Text as="span" variant="caption">
                Subscribe to publish.
              </Text>
            )}
          </div>
          {error && <p className="mt-2 text-sm text-danger">{error}</p>}
        </div>
        <Button
          variant="primary"
          onClick={toggle}
          disabled={pending || (billingEnabled && !hasActiveSub && published === false)}
          className="w-full sm:w-auto"
        >
          {published ? 'Unpublish' : 'Publish page'}
        </Button>
      </div>
    </Card>
  )
}

export function DashboardEditor({
  data,
  billingEnabled,
  instagramEnabled,
  igUsesUsername,
  agentEnabled,
}: {
  data: DashboardData
  billingEnabled: boolean
  instagramEnabled: boolean
  igUsesUsername: boolean
  agentEnabled: boolean
}) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
      {instagramEnabled && (
        <Suspense fallback={null}>
          <IgConnectStatus />
        </Suspense>
      )}
      <PageHero data={data} billingEnabled={billingEnabled} />
      <DashboardStore initial={data}>
        <ImportProvider>
          <MediaUndoProvider>
            <DashboardTabs
              data={data}
              instagramEnabled={instagramEnabled}
              igUsesUsername={igUsesUsername}
              igConnected={data.instagramConnected}
              igUsername={data.instagramUsername}
            />
            {agentEnabled && (
              <AgentChat instagramConnected={data.instagramConnected} igUsesUsername={igUsesUsername} />
            )}
          </MediaUndoProvider>
        </ImportProvider>
      </DashboardStore>
    </div>
  )
}
