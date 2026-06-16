'use client'

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import { m } from 'motion/react'
import Image from 'next/image'
import { usePersonalBackground, itemVariants } from './usePersonalBackground'

const GAP = 4
const READY_FALLBACK_MS = 2500
const READY_PER_TILE_MS = 30
const READY_BASE_MS = 500

interface CycleGrid {
  cols: number
  rows: number
  items: { src: string; key: number }[]
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

function useCycleGrid(images: string[]): CycleGrid | null {
  const dims = useWindowSize()

  return useMemo(() => {
    if (images.length === 0) return null
    const [W, H] = dims.split('x').map(Number)
    if (!W || !H) return null

    const N = images.length
    const cols = Math.min(N, Math.max(1, Math.round(Math.sqrt((N * W) / H))))
    const rows = Math.ceil(N / cols)
    const items = images.map((src, i) => ({ src, key: i }))
    return { cols, rows, items }
  }, [images, dims])
}

function CycleGridView({
  grid,
  isActive,
  onReady,
}: {
  grid: CycleGrid
  isActive: boolean
  onReady?: () => void
}) {
  const total = grid.items.length
  const [readyCount, setReadyCount] = useState(0)
  const loadedRef = useRef<Set<number>>(new Set())
  const readyFiredRef = useRef(false)

  const markLoaded = (index: number) => {
    loadedRef.current.add(index)
    setReadyCount((prev) => {
      let n = prev
      while (loadedRef.current.has(n)) n++
      return n
    })
  }

  useEffect(() => {
    const t = setTimeout(() => setReadyCount(total), READY_FALLBACK_MS)
    return () => clearTimeout(t)
  }, [total])

  useEffect(() => {
    if (isActive && readyCount >= total && !readyFiredRef.current) {
      const t = setTimeout(() => {
        readyFiredRef.current = true
        onReady?.()
      }, total * READY_PER_TILE_MS + READY_BASE_MS)
      return () => clearTimeout(t)
    }
  }, [isActive, readyCount, total, onReady])

  return (
    <div
      className="absolute inset-0 grid"
      style={{
        gridTemplateColumns: `repeat(${grid.cols}, 1fr)`,
        gridTemplateRows: `repeat(${grid.rows}, 1fr)`,
        gap: GAP,
      }}
    >
      {grid.items.map(({ src, key }, i) => {
        const revealed = isActive && i < readyCount
        return (
          <div key={key} className="relative overflow-hidden rounded-sm skeleton-shimmer">
            <m.div
              className="absolute inset-0"
              variants={itemVariants}
              custom={i}
              initial="hidden"
              animate={revealed ? 'visible' : 'hidden'}
              whileHover={{ scale: 1.05, zIndex: 10 }}
              transition={{ duration: 0.2 }}
            >
              <Image
                src={src}
                alt=""
                fill
                className="object-cover"
                sizes={`${Math.ceil(100 / grid.cols)}vw`}
                {...(i === 0 ? { priority: true } : { loading: 'eager' as const })}
                onLoad={() => markLoaded(i)}
                onError={() => markLoaded(i)}
              />
            </m.div>
          </div>
        )
      })}
    </div>
  )
}

export function PersonalBackground({
  isActive,
  initialImages,
  onReady,
}: {
  isActive: boolean
  initialImages: string[]
  onReady?: () => void
}) {
  const { images, animationKey } = usePersonalBackground(isActive, initialImages)
  const cycleGrid = useCycleGrid(images)

  return (
    <div className="bg-fixed-overlay bg-grid-base">
      {cycleGrid && (
        <CycleGridView key={animationKey} grid={cycleGrid} isActive={isActive} onReady={onReady} />
      )}
      <div className="bg-overlay-gradient" />
    </div>
  )
}
