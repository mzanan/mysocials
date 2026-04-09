'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
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
              return (
                <motion.div
                  key={imgIdx}
                  className="relative overflow-hidden rounded-sm"
                  style={{ width: cellSize, height: cellSize }}
                  variants={itemVariants}
                  custom={globalIndex}
                  whileHover={{ scale: 1.05, zIndex: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <Image
                    src={src}
                    alt=""
                    fill
                    className="object-cover"
                    sizes={`${cellSize}px`}
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
