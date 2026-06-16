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

const TARGET_TILE = 280
const MIN_COLS = 2
const MAX_COLS = 8
const ROTATE_MS = 3200
const SWAP_PER_TICK = 3

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

    const cols = clamp(Math.round(W / TARGET_TILE), MIN_COLS, MAX_COLS)
    const tile = W / cols
    const rows = Math.max(1, Math.ceil(H / tile))
    const count = Math.min(poolSize, cols * rows)
    return { cols, rows, count }
  }, [poolSize, dims])
}

function initSlots(pool: string[], count: number): string[] {
  if (pool.length === 0 || count === 0) return []
  return Array.from({ length: Math.min(count, pool.length) }, (_, i) => pool[i % pool.length])
}

function poolSignature(pool: string[], count: number): string {
  return `${count}|${pool.length}|${pool[0] ?? ''}|${pool[pool.length - 1] ?? ''}`
}

export function useRotatingSlots(pool: string[], count: number, active: boolean): string[] {
  const [slots, setSlots] = useState<string[]>(() => initSlots(pool, count))
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
        const visible = new Set(prev)
        const reserve = pool.filter((src) => !visible.has(src))
        if (reserve.length === 0) return prev
        const swaps = Math.min(SWAP_PER_TICK, prev.length, reserve.length)
        const positions = sample(
          prev.map((_, i) => i),
          swaps,
        )
        const incoming = sample(reserve, swaps)
        const next = [...prev]
        positions.forEach((pos, k) => {
          next[pos] = incoming[k]
        })
        return next
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
