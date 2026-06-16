'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, m } from 'motion/react'
import { cn } from '@/lib/utils'
import type { DevVideo } from './useDevBackground'

const ADVANCE_MS = 6000

export function DevBackground({
  isActive,
  videos,
  onReady,
}: {
  isActive: boolean
  videos: DevVideo[]
  onReady?: () => void
}) {
  const [index, setIndex] = useState(0)
  const count = videos.length

  useEffect(() => {
    if (!isActive) return
    const t = setTimeout(() => onReady?.(), 800)
    return () => clearTimeout(t)
  }, [isActive, onReady])

  useEffect(() => {
    if (!isActive || count <= 1) return
    const id = setInterval(() => setIndex((i) => (i + 1) % count), ADVANCE_MS)
    return () => clearInterval(id)
  }, [isActive, count])

  const active = count > 0 ? videos[Math.min(index, count - 1)] : null

  return (
    <div className="bg-fixed-overlay bg-app-bg">
      {active && (
        <AnimatePresence mode="wait">
          <m.div
            key={active.url}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            <video
              src={active.url}
              poster={active.posterUrl ?? undefined}
              autoPlay={isActive}
              muted
              loop
              playsInline
              preload={isActive ? 'auto' : 'none'}
              className="h-full w-full object-cover"
            />
          </m.div>
        </AnimatePresence>
      )}
      <div className="bg-overlay-gradient" />
      {count > 1 && (
        <div className="absolute bottom-16 left-1/2 z-20 flex -translate-x-1/2 gap-2">
          {videos.map((v, i) => (
            <button
              key={v.url}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Show video ${i + 1}`}
              className={cn(
                'h-1.5 rounded-full transition-all',
                i === index ? 'w-6 bg-fg' : 'w-1.5 bg-fg/40 hover:bg-fg/70',
              )}
            />
          ))}
        </div>
      )}
    </div>
  )
}
