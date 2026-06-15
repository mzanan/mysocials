'use client'

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import { m } from 'motion/react'
import Image from 'next/image'
import { usePersonalBackground, itemVariants } from './usePersonalBackground'
import type { GridSize } from '@/types/profile'

const GAP = 4
const READY_FALLBACK_MS = 2500
const READY_PER_TILE_MS = 30
const READY_BASE_MS = 500
const SIZE_CELL: Record<GridSize, { min: number; max: number }> = {
  small: { min: 100, max: 150 },
  medium: { min: 150, max: 220 },
  large: { min: 220, max: 320 },
}

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

function useCycleGrid(images: string[], size: GridSize): CycleGrid | null {
  const dims = useWindowSize()

  return useMemo(() => {
    if (images.length === 0) return null
    const [W, H] = dims.split('x').map(Number)
    if (!W || !H) return null

    const { min, max } = SIZE_CELL[size]
    const N = images.length
    let cols = Math.round(Math.sqrt((N * W) / H))
    cols = Math.max(1, cols)
    let cellW = W / cols
    if (cellW < min) cols = Math.max(1, Math.floor(W / min))
    else if (cellW > max) cols = Math.ceil(W / max)
    cellW = W / cols
    const rows = Math.max(1, Math.ceil(H / cellW))
    const total = cols * rows
    const items = Array.from({ length: total }, (_, i) => {
      const block = Math.floor(i / N)
      const idx = (i * 23 + block * 7) % N
      return { src: images[idx], key: i }
    })
    return { cols, rows, items }
  }, [images, size, dims])
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
  gridSize = 'medium',
  onReady,
}: {
  isActive: boolean
  initialImages: string[]
  gridSize?: GridSize
  onReady?: () => void
}) {
  const { images, animationKey } = usePersonalBackground(isActive, initialImages)
  const cycleGrid = useCycleGrid(images, gridSize)

  return (
    <div className="bg-fixed-overlay bg-grid-base">
      {cycleGrid && (
        <CycleGridView key={animationKey} grid={cycleGrid} isActive={isActive} onReady={onReady} />
      )}
      <div className="bg-overlay-gradient" />
    </div>
  )
}
