'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'motion/react'
import Image from 'next/image'
import { usePersonalBackground, containerVariants, itemVariants } from './usePersonalBackground'

const GAP = 4

interface GridState {
  cols: number
  cellSize: number
  columns: string[][]
}

export function PersonalBackground({ isActive }: { isActive: boolean }) {
  const { images, animationKey } = usePersonalBackground(isActive)
  const [grid, setGrid] = useState<GridState | null>(null)

  // Reveal advances only over a contiguous row-major prefix of *loaded* images,
  // so a cell never animates in while its image is still downloading — no holes
  // in a row, order preserved. `readyCount` = length of that prefix.
  const [readyCount, setReadyCount] = useState(0)
  const loadedRef = useRef<Set<number>>(new Set())

  // Replay from scratch every time the tab is (re)activated. Reset during render
  // (guarded) so children remount with readyCount already 0 — no visible→hidden flash.
  const prevKeyRef = useRef(animationKey)
  if (prevKeyRef.current !== animationKey) {
    prevKeyRef.current = animationKey
    loadedRef.current = new Set()
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

      // Number of cols that best matches screen aspect ratio
      let cols = Math.round(Math.sqrt(N * W / H))
      cols = Math.max(1, Math.min(cols, N))

      const rows = Math.floor(N / cols)
      if (rows === 0) return

      // Use only complete rows (no empty cells)
      const count = cols * rows
      const trimmed = images.slice(0, count)

      // Build columns in row-major order
      const columns: string[][] = Array.from({ length: cols }, () => [])
      trimmed.forEach((img, i) => columns[i % cols].push(img))

      // Cell size that fills both dimensions (larger wins → overflow is clipped)
      const cellW = (W - (cols - 1) * GAP) / cols
      const cellH = (H - (rows - 1) * GAP) / rows
      const cellSize = Math.ceil(Math.max(cellW, cellH))

      setGrid({ cols, cellSize, columns })
    }

    calculate()
    window.addEventListener('resize', calculate)
    return () => window.removeEventListener('resize', calculate)
  }, [images])

  if (!grid || images.length === 0) return null

  const { cols, cellSize, columns } = grid

  return (
    <div className="bg-fixed-overlay">
      <motion.div
        className="flex"
        style={{ gap: GAP }}
        variants={containerVariants}
        initial="hidden"
        animate={isActive ? 'visible' : 'hidden'}
        key={animationKey}
      >
        {columns.map((col, colIdx) => (
          <div key={colIdx} className="flex flex-col flex-shrink-0" style={{ gap: GAP }}>
            {col.map((src, imgIdx) => {
              const globalIndex = imgIdx * cols + colIdx
              const revealed = isActive && globalIndex < readyCount
              return (
                <motion.div
                  key={imgIdx}
                  className="relative overflow-hidden rounded-sm"
                  style={{ width: cellSize, height: cellSize }}
                  variants={itemVariants}
                  custom={colIdx}
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
                    sizes={`${cellSize}px`}
                    placeholder="blur"
                    blurDataURL="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxIDEiPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiMxYTFhMmUiLz48L3N2Zz4="
                    onLoad={() => markLoaded(globalIndex)}
                    onError={() => markLoaded(globalIndex)}
                  />
                </motion.div>
              )
            })}
          </div>
        ))}
      </motion.div>

      <div className="bg-overlay-gradient" />
    </div>
  )
}
