'use client'

import { useEffect, useMemo, useState } from 'react'
import type { DashboardData } from '@/types/dashboard'
import { useDashboardStore } from './DashboardStore'

const RELOAD_DEBOUNCE_MS = 600

export function useLivePreview(data: DashboardData) {
  const { tabs, links } = useDashboardStore()
  const signature = useMemo(() => JSON.stringify([data, tabs, links]), [data, tabs, links])
  const [version, setVersion] = useState(signature)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (signature === version) return
    const id = setTimeout(() => {
      setLoaded(false)
      setVersion(signature)
    }, RELOAD_DEBOUNCE_MS)
    return () => clearTimeout(id)
  }, [signature, version])

  return { frameKey: version, loaded, onLoad: () => setLoaded(true) }
}
