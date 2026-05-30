'use client'

import { useState, useEffect, useRef } from 'react'
import { m } from 'motion/react'
import Image from 'next/image'
import { usePersonalBackground, itemVariants } from './usePersonalBackground'

const GAP = 4

interface GridState {
  cols: number
  rows: number
  images: string[]
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

  const markLoaded = (index: number) => {
    loadedRef.current.add(index)
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

      setGrid({ cols, rows, images: images.slice(0, cols * rows) })
    }

    calculate()
    window.addEventListener('resize', calculate)
    return () => window.removeEventListener('resize', calculate)
  }, [images])

  const total = grid ? grid.images.length : 0

  useEffect(() => {
    if (!grid) return
    const t = setTimeout(() => setReadyCount(grid.images.length), 2500)
    return () => clearTimeout(t)
  }, [grid, animationKey])

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
        <div
          key={animationKey}
          className="absolute inset-0 grid"
          style={{
            gridTemplateColumns: `repeat(${grid.cols}, 1fr)`,
            gridTemplateRows: `repeat(${grid.rows}, 1fr)`,
            gap: GAP,
          }}
        >
          {grid.images.map((src, i) => {
            const revealed = isActive && i < readyCount
            return (
              <div key={i} className="relative overflow-hidden rounded-sm skeleton-shimmer">
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
      )}

      <div className="bg-overlay-gradient" />
    </div>
  )
}
