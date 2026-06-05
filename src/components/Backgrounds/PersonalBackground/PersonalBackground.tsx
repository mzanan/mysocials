'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { m } from 'motion/react'
import Image from 'next/image'
import { usePersonalBackground, itemVariants } from './usePersonalBackground'
import type { GridMode, MediaPublic } from '@/types/profile'

const GAP = 4
const CYCLE_MIN_CELL = 150
const CYCLE_MAX_CELL = 240
const MASONRY_GAP = 6
const MASONRY_TARGET_COL_W = 180
const MASONRY_MIN_COLS = 2
const MASONRY_MAX_COLS = 8

interface CycleGrid {
  cols: number
  rows: number
  items: { src: string; key: number }[]
}

interface MasonryColumn {
  src: string
  aspectRatio: string
  key: number
}

function useCycleGrid(images: string[]): CycleGrid | null {
  const [grid, setGrid] = useState<CycleGrid | null>(null)

  useEffect(() => {
    if (images.length === 0) {
      setGrid(null)
      return
    }

    const calculate = () => {
      const W = window.innerWidth
      const H = window.innerHeight
      const N = images.length
      let cols = Math.round(Math.sqrt((N * W) / H))
      cols = Math.max(1, cols)
      let cellW = W / cols
      if (cellW < CYCLE_MIN_CELL) cols = Math.max(1, Math.floor(W / CYCLE_MIN_CELL))
      else if (cellW > CYCLE_MAX_CELL) cols = Math.ceil(W / CYCLE_MAX_CELL)
      cellW = W / cols
      const rows = Math.max(1, Math.ceil(H / cellW))
      const total = cols * rows
      const items = Array.from({ length: total }, (_, i) => {
        const block = Math.floor(i / N)
        const idx = (i * 23 + block * 7) % N
        return { src: images[idx], key: i }
      })
      setGrid({ cols, rows, items })
    }

    calculate()
    window.addEventListener('resize', calculate)
    return () => window.removeEventListener('resize', calculate)
  }, [images])

  return grid
}

function useMasonryColumns(media: MediaPublic[]): MasonryColumn[][] {
  const [viewport, setViewport] = useState({ w: 0, h: 0, cols: MASONRY_MIN_COLS })

  useEffect(() => {
    const compute = () => {
      const w = window.innerWidth
      const h = window.innerHeight
      const ideal = Math.round(w / MASONRY_TARGET_COL_W)
      const cols = Math.max(MASONRY_MIN_COLS, Math.min(MASONRY_MAX_COLS, ideal))
      setViewport({ w, h, cols })
    }
    compute()
    window.addEventListener('resize', compute)
    return () => window.removeEventListener('resize', compute)
  }, [])

  return useMemo(() => {
    if (media.length === 0 || viewport.w === 0) return []
    const { w, h, cols } = viewport
    const colWidth = (w - (cols + 1) * MASONRY_GAP) / cols
    const out: MasonryColumn[][] = Array.from({ length: cols }, () => [])
    const colHeights = new Array(cols).fill(0)
    let i = 0
    let safety = 0
    while (colHeights.some((ch) => ch < h) && safety < 1000) {
      const m = media[i % media.length]
      const ratio = m.width && m.height ? m.width / m.height : 4 / 5
      const tileHeight = colWidth / ratio
      let target = 0
      for (let c = 1; c < cols; c++) {
        if (colHeights[c] < colHeights[target]) target = c
      }
      out[target].push({
        src: m.url,
        aspectRatio: m.width && m.height ? `${m.width} / ${m.height}` : '4 / 5',
        key: i,
      })
      colHeights[target] += tileHeight + MASONRY_GAP
      i++
      safety++
    }
    return out
  }, [media, viewport])
}

export function PersonalBackground({
  isActive,
  initialImages,
  initialMedia,
  gridMode = 'cycle',
  onReady,
}: {
  isActive: boolean
  initialImages: string[]
  initialMedia?: MediaPublic[]
  gridMode?: GridMode
  onReady?: () => void
}) {
  const { images, animationKey } = usePersonalBackground(isActive, initialImages)

  const [readyCount, setReadyCount] = useState(0)
  const loadedRef = useRef<Set<number>>(new Set())
  const readyFiredRef = useRef(false)

  const prevKeyRef = useRef(animationKey)
  if (prevKeyRef.current !== animationKey) {
    prevKeyRef.current = animationKey
    loadedRef.current = new Set()
    readyFiredRef.current = false
    setReadyCount(0)
  }

  const markLoaded = (index: number) => {
    loadedRef.current.add(index)
    setReadyCount((prev) => {
      let n = prev
      while (loadedRef.current.has(n)) n++
      return n
    })
  }

  const cycleGrid = useCycleGrid(gridMode === 'cycle' ? images : [])
  const masonryColumns = useMasonryColumns(
    gridMode === 'masonry' ? (initialMedia ?? []) : [],
  )

  const totalCycle = cycleGrid ? cycleGrid.items.length : 0
  const totalMasonry = masonryColumns.reduce((n, c) => n + c.length, 0)
  const total = gridMode === 'cycle' ? totalCycle : totalMasonry

  useEffect(() => {
    if (total === 0) return
    const t = setTimeout(() => setReadyCount(total), 2500)
    return () => clearTimeout(t)
  }, [total, animationKey])

  useEffect(() => {
    if (isActive && total > 0 && readyCount >= total && !readyFiredRef.current) {
      const t = setTimeout(() => {
        readyFiredRef.current = true
        onReady?.()
      }, total * 30 + 500)
      return () => clearTimeout(t)
    }
  }, [isActive, readyCount, total, onReady])

  return (
    <div className="bg-fixed-overlay bg-grid-base">
      {gridMode === 'cycle' && cycleGrid && (
        <div
          key={animationKey}
          className="absolute inset-0 grid"
          style={{
            gridTemplateColumns: `repeat(${cycleGrid.cols}, 1fr)`,
            gridTemplateRows: `repeat(${cycleGrid.rows}, 1fr)`,
            gap: GAP,
          }}
        >
          {cycleGrid.items.map(({ src, key }, i) => {
            const revealed = isActive && i < readyCount
            return (
              <div
                key={key}
                className="relative overflow-hidden rounded-sm skeleton-shimmer"
              >
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
                    sizes={`${Math.ceil(100 / cycleGrid.cols)}vw`}
                    {...(i === 0
                      ? { priority: true }
                      : { loading: 'eager' as const })}
                    onLoad={() => markLoaded(i)}
                    onError={() => markLoaded(i)}
                  />
                </m.div>
              </div>
            )
          })}
        </div>
      )}

      {gridMode === 'masonry' && totalMasonry > 0 && (
        <div
          key={animationKey}
          className="absolute inset-0 flex items-start overflow-hidden"
          style={{ gap: MASONRY_GAP, padding: MASONRY_GAP }}
        >
          {masonryColumns.map((col, ci) => (
            <div
              key={ci}
              className="flex min-w-0 flex-1 flex-col"
              style={{ gap: MASONRY_GAP }}
            >
              {col.map(({ src, aspectRatio, key }) => {
                const flatIndex = key
                const revealed = isActive && flatIndex < readyCount
                return (
                  <div
                    key={key}
                    className="relative overflow-hidden rounded-sm skeleton-shimmer"
                    style={{ aspectRatio }}
                  >
                    <m.div
                      className="absolute inset-0"
                      variants={itemVariants}
                      custom={flatIndex}
                      initial="hidden"
                      animate={revealed ? 'visible' : 'hidden'}
                      whileHover={{ scale: 1.03, zIndex: 10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Image
                        src={src}
                        alt=""
                        fill
                        className="object-cover"
                        sizes={`${MASONRY_TARGET_COL_W}px`}
                        loading="eager"
                        onLoad={() => markLoaded(flatIndex)}
                        onError={() => markLoaded(flatIndex)}
                      />
                    </m.div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      )}

      <div className="bg-overlay-gradient" />
    </div>
  )
}
