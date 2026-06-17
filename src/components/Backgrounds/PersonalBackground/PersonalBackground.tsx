'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, m } from 'motion/react'
import Image from 'next/image'
import {
  itemVariants,
  useGridShape,
  usePersonalBackground,
  useRotatingSlots,
  type GridShape,
} from './usePersonalBackground'

const GAP = 4
const READY_FALLBACK_MS = 2500
const READY_PER_TILE_MS = 30
const READY_BASE_MS = 500

function CycleGridView({
  grid,
  slots,
  isActive,
  onReady,
}: {
  grid: GridShape
  slots: string[]
  isActive: boolean
  onReady?: () => void
}) {
  const total = slots.length
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
    if (isActive && total > 0 && readyCount >= total && !readyFiredRef.current) {
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
      {slots.map((src, i) => {
        const revealed = isActive && i < readyCount
        return (
          <div key={i} className="skeleton-shimmer relative overflow-hidden rounded-sm">
            <m.div
              className="absolute inset-0"
              variants={itemVariants}
              custom={i}
              initial="hidden"
              animate={revealed ? 'visible' : 'hidden'}
            >
              <AnimatePresence initial={false}>
                <m.div
                  key={src}
                  className="absolute inset-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.9, ease: 'easeInOut' }}
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
              </AnimatePresence>
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
  const grid = useGridShape(images.length)
  const [filled, setFilled] = useState(false)
  const slots = useRotatingSlots(images, grid?.count ?? 0, filled && isActive)

  function handleReady() {
    setFilled(true)
    onReady?.()
  }

  return (
    <div className="bg-fixed-overlay bg-grid-base">
      {grid && slots.length > 0 && (
        <CycleGridView
          key={animationKey}
          grid={grid}
          slots={slots}
          isActive={isActive}
          onReady={handleReady}
        />
      )}
      <div className="bg-overlay-gradient" />
    </div>
  )
}
