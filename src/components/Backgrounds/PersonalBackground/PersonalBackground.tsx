'use client'

import { useState, useEffect, useRef } from 'react'
import { m } from 'motion/react'
import Image from 'next/image'
import { usePersonalBackground, itemVariants } from './usePersonalBackground'

const GAP = 4

interface GridState {
  cols: number
  cellSize: number
  columns: string[][]
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
  const [grid, setGrid] = useState<GridState | null>(null)

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

  const markLoaded = (globalIndex: number) => {
    loadedRef.current.add(globalIndex)
    setReadyCount(prev => {
      let n = prev
      while (loadedRef.current.has(n)) n++
      return n
    })
  }

  useEffect(() => {
    if (images.length === 0) return

    const calculate = () => {
      const W = window.innerWidth
      const H = window.innerHeight
      const N = images.length

      let cols = Math.round(Math.sqrt((N * W) / H))
      cols = Math.max(1, Math.min(cols, N))

      const rows = Math.floor(N / cols)
      if (rows === 0) return

      const count = cols * rows
      const trimmed = images.slice(0, count)

      const columns: string[][] = Array.from({ length: cols }, () => [])
      trimmed.forEach((img, i) => columns[i % cols].push(img))

      const cellW = (W - (cols - 1) * GAP) / cols
      const cellH = (H - (rows - 1) * GAP) / rows
      const cellSize = Math.ceil(Math.max(cellW, cellH))

      setGrid({ cols, cellSize, columns })
    }

    calculate()
    window.addEventListener('resize', calculate)
    return () => window.removeEventListener('resize', calculate)
  }, [images])

  useEffect(() => {
    if (!grid) return
    const total = grid.columns.reduce((n, col) => n + col.length, 0)
    const t = setTimeout(() => setReadyCount(total), 2500)
    return () => clearTimeout(t)
  }, [grid, animationKey])

  const total = grid ? grid.columns.reduce((n, col) => n + col.length, 0) : 0

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
      {grid && (
        <div className="flex" style={{ gap: GAP }} key={animationKey}>
          {grid.columns.map((col, colIdx) => (
            <div key={colIdx} className="flex flex-col flex-shrink-0" style={{ gap: GAP }}>
              {col.map((src, imgIdx) => {
                const globalIndex = imgIdx * grid.cols + colIdx
                const revealed = isActive && globalIndex < readyCount
                return (
                  <div
                    key={imgIdx}
                    className="relative overflow-hidden rounded-sm skeleton-shimmer"
                    style={{ width: grid.cellSize, height: grid.cellSize }}
                  >
                    <m.div
                      className="absolute inset-0"
                      variants={itemVariants}
                      custom={globalIndex}
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
                        sizes={`${grid.cellSize}px`}
                        loading="eager"
                        onLoad={() => markLoaded(globalIndex)}
                        onError={() => markLoaded(globalIndex)}
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
