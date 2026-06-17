'use client'

import { useEffect, useMemo, useState, useSyncExternalStore } from 'react'

export const itemVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: (index: number = 0) => ({
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      delay: index * 0.03,
      ease: [0, 0, 0.2, 1] as const,
    },
  }),
}

const MIN_COLS = 2
const MAX_COLS = 8
const ROTATE_MS = 3200
const SWAP_PER_TICK = 3
const REORDER_PAIRS = 2

export interface Slot {
  id: string
  src: string
}

function targetCount(w: number): number {
  if (w < 640) return 12
  if (w < 1024) return 20
  return 30
}

export interface GridShape {
  cols: number
  rows: number
  count: number
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

function sample<T>(arr: T[], k: number): T[] {
  const copy = [...arr]
  const out: T[] = []
  for (let i = 0; i < k && copy.length > 0; i++) {
    const j = Math.floor(Math.random() * copy.length)
    out.push(copy.splice(j, 1)[0])
  }
  return out
}

function subscribeWindow(callback: () => void) {
  window.addEventListener('resize', callback)
  return () => window.removeEventListener('resize', callback)
}

function useWindowSize() {
  return useSyncExternalStore(
    subscribeWindow,
    () => `${window.innerWidth}x${window.innerHeight}`,
    () => '0x0',
  )
}

export function useGridShape(poolSize: number): GridShape | null {
  const dims = useWindowSize()

  return useMemo(() => {
    if (poolSize === 0) return null
    const [W, H] = dims.split('x').map(Number)
    if (!W || !H) return null

    const target = Math.min(poolSize, targetCount(W))
    const cols = clamp(Math.round(Math.sqrt((target * W) / H)), MIN_COLS, MAX_COLS)
    const rows = Math.max(1, Math.round(target / cols))
    const count = Math.min(poolSize, cols * rows)
    return { cols, rows, count }
  }, [poolSize, dims])
}

function initSlots(pool: string[], count: number): Slot[] {
  if (pool.length === 0 || count === 0) return []
  return Array.from({ length: Math.min(count, pool.length) }, (_, i) => ({
    id: `slot-${i}`,
    src: pool[i % pool.length],
  }))
}

function poolSignature(pool: string[], count: number): string {
  return `${count}|${pool.length}|${pool[0] ?? ''}|${pool[pool.length - 1] ?? ''}`
}

function swapInFresh(prev: Slot[], pool: string[]): Slot[] {
  const visible = new Set(prev.map((s) => s.src))
  const reserve = pool.filter((src) => !visible.has(src))
  if (reserve.length === 0) return reorderPositions(prev)
  const swaps = Math.min(SWAP_PER_TICK, prev.length, reserve.length)
  const positions = sample(
    prev.map((_, i) => i),
    swaps,
  )
  const incoming = sample(reserve, swaps)
  const next = [...prev]
  positions.forEach((pos, k) => {
    next[pos] = { ...next[pos], src: incoming[k] }
  })
  return next
}

function reorderPositions(prev: Slot[]): Slot[] {
  if (prev.length < 2) return prev
  const next = [...prev]
  const pairs = Math.min(REORDER_PAIRS, Math.floor(prev.length / 2))
  for (let n = 0; n < pairs; n++) {
    const a = Math.floor(Math.random() * next.length)
    let b = Math.floor(Math.random() * next.length)
    if (a === b) b = (b + 1) % next.length
    ;[next[a], next[b]] = [next[b], next[a]]
  }
  return next
}

export function useRotatingSlots(pool: string[], count: number, active: boolean): Slot[] {
  const [slots, setSlots] = useState<Slot[]>(() => initSlots(pool, count))
  const [sig, setSig] = useState(() => poolSignature(pool, count))

  const nextSig = poolSignature(pool, count)
  if (nextSig !== sig) {
    setSig(nextSig)
    setSlots(initSlots(pool, count))
  }

  useEffect(() => {
    if (!active || pool.length <= count) return
    const id = setInterval(() => {
      setSlots((prev) => {
        if (prev.length === 0) return prev
        return Math.random() < 0.5 ? swapInFresh(prev, pool) : reorderPositions(prev)
      })
    }, ROTATE_MS)
    return () => clearInterval(id)
  }, [active, pool, count])

  return slots
}

export function usePersonalBackground(isActive: boolean, initialImages: string[]) {
  const [animationKey, setAnimationKey] = useState(0)
  const [wasActive, setWasActive] = useState(isActive)

  if (isActive !== wasActive) {
    setWasActive(isActive)
    if (isActive) setAnimationKey((prev) => prev + 1)
  }

  return { images: initialImages, animationKey }
}
