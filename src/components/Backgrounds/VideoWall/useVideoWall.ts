'use client'

import { useCallback, useState, useSyncExternalStore } from 'react'

export const GAP = 4
export const DESKTOP_MIN = 1024
const MAX_LIVE = 6
export const FILL_PER_COL = 4

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

export function useViewportHeight(): number {
  return useSyncExternalStore(
    subscribeWindow,
    () => window.innerHeight,
    () => 768,
  )
}

export function useAspects(urls: string[]): {
  aspects: number[]
  reportAspect: (url: string, aspect: number) => void
} {
  const [measured, setMeasured] = useState<Record<string, number>>({})
  const reportAspect = useCallback((url: string, aspect: number) => {
    setMeasured((prev) => (prev[url] ? prev : { ...prev, [url]: aspect }))
  }, [])
  return { aspects: urls.map((url) => measured[url] ?? 1), reportAspect }
}

function packRow(aspects: number[], containerWidth: number, gap: number, rowHeight: number): number[][] {
  const rows: number[][] = []
  let row: number[] = []
  let sumAspect = 0
  aspects.forEach((aspect, i) => {
    row.push(i)
    sumAspect += aspect
    const rowWidth = sumAspect * rowHeight + (row.length - 1) * gap
    if (rowWidth >= containerWidth && i < aspects.length - 1) {
      rows.push(row)
      row = []
      sumAspect = 0
    }
  })
  if (row.length) rows.push(row)
  return rows
}

function totalHeightAt(rows: number[][], aspects: number[], containerWidth: number, gap: number): number {
  const rowHeights = rows.map((row) => {
    const sumAspect = row.reduce((s, i) => s + aspects[i], 0)
    return (containerWidth - (row.length - 1) * gap) / sumAspect
  })
  return rowHeights.reduce((a, b) => a + b, 0) + (rows.length - 1) * gap
}

export function justifyLayout(
  aspects: number[],
  containerWidth: number,
  containerHeight: number,
  gap: number,
): Array<{ x: number; y: number; width: number; height: number }> {
  if (aspects.length === 0 || containerWidth <= 0 || containerHeight <= 0) return []

  const initialRows = Math.max(1, Math.round(Math.sqrt(aspects.length)))
  let rowHeight = containerHeight / initialRows
  let rows = packRow(aspects, containerWidth, gap, rowHeight)

  for (let i = 0; i < 8; i++) {
    const height = totalHeightAt(rows, aspects, containerWidth, gap)
    if (height <= 0) break
    rowHeight *= containerHeight / height
    rows = packRow(aspects, containerWidth, gap, rowHeight)
  }

  const positions: Array<{ x: number; y: number; width: number; height: number }> = new Array(aspects.length)
  let y = 0
  rows.forEach((row) => {
    const sumAspect = row.reduce((s, i) => s + aspects[i], 0)
    const height = (containerWidth - (row.length - 1) * gap) / sumAspect
    let x = 0
    row.forEach((i) => {
      const width = aspects[i] * height
      positions[i] = { x, y, width, height }
      x += width + gap
    })
    y += height + gap
  })
  return positions
}

export function wallColumns(count: number, width: number): number {
  if (count <= 1) return 1
  if (width >= DESKTOP_MIN) {
    if (count <= 2) return 2
    if (count <= 6) return 3
    return 4
  }
  if (width >= 640) {
    return count <= 2 ? 2 : 3
  }
  return count <= 2 ? 1 : 2
}

export function assignColumns(aspects: number[], cols: number): number[][] {
  const columns: number[][] = Array.from({ length: cols }, () => [])
  const colHeights = new Array(cols).fill(0)
  aspects.forEach((aspect, i) => {
    let shortest = 0
    for (let c = 1; c < cols; c++) {
      if (colHeights[c] < colHeights[shortest]) shortest = c
    }
    columns[shortest].push(i)
    colHeights[shortest] += 1 / (aspect || 1)
  })
  return columns
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
