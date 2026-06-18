'use client'

import { useSyncExternalStore } from 'react'

export const GAP = 4
const MAX_LIVE = 6
const FILL_PER_COL = 4

export interface WallVideo {
  url: string
  posterUrl?: string | null
}

export interface WallSlot {
  url: string
  posterUrl: string | null
  live: boolean
  key: string
}

function subscribeWindow(cb: () => void) {
  window.addEventListener('resize', cb)
  return () => window.removeEventListener('resize', cb)
}

export function useViewportWidth(): number {
  return useSyncExternalStore(
    subscribeWindow,
    () => window.innerWidth,
    () => 1024,
  )
}

export function wallColumns(count: number, width: number): number {
  if (count <= 1) return 1
  if (width >= 1024) {
    if (count <= 2) return 2
    if (count <= 6) return 3
    return 4
  }
  if (width >= 640) {
    return count <= 2 ? 2 : 3
  }
  return count <= 2 ? 1 : 2
}

export function buildSlots(videos: WallVideo[], cols: number): WallSlot[] {
  if (videos.length === 0) return []
  const target = Math.max(videos.length, cols * FILL_PER_COL)
  const seen = new Set<string>()
  let liveCount = 0

  return Array.from({ length: target }, (_, i) => {
    const v = videos[i % videos.length]
    const firstTime = !seen.has(v.url)
    seen.add(v.url)
    const live = firstTime && liveCount < MAX_LIVE
    if (live) liveCount++
    return { url: v.url, posterUrl: v.posterUrl ?? null, live, key: `${v.url}-${i}` }
  })
}
