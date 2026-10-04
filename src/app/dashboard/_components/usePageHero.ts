'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { setPublished, updateSearchVisibility } from '../actions'
import { toast } from '@/lib/toast'
import type { DashboardData } from '@/types/dashboard'

export function usePageHero(data: DashboardData, billingEnabled: boolean) {
  const router = useRouter()
  const [published, setPublishedState] = useState(data.published)
  const [hideFromSearch, setHideFromSearch] = useState(data.hideFromSearch)
  const [error, setError] = useState<string | null>(null)
  const [showGate, setShowGate] = useState(false)
  const [pending, startTransition] = useTransition()

  const hasActiveSub = data.subscriptionStatus === 'active'
  const needsSubscription = billingEnabled && !hasActiveSub

  function togglePublished() {
    setError(null)
    const next = !published
    if (needsSubscription && next) {
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

  function toggleHideFromSearch(hidden: boolean) {
    const previous = hideFromSearch
    setHideFromSearch(hidden)
    startTransition(async () => {
      const res = await updateSearchVisibility(hidden)
      if (res.ok) {
        router.refresh()
      } else {
        setHideFromSearch(previous)
        toast.error(res.error)
      }
    })
  }

  return {
    published,
    hideFromSearch,
    error,
    pending,
    showGate,
    setShowGate,
    needsSubscription,
    togglePublished,
    toggleHideFromSearch,
  }
}
