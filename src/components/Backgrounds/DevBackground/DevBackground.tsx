'use client'

import { useEffect } from 'react'
import { m } from 'motion/react'
import {
  useDevBackground,
  containerVariants,
  itemVariants,
  type DevVideo,
} from './useDevBackground'

export function DevBackground({
  isActive,
  videos,
  onReady,
}: {
  isActive: boolean
  videos: DevVideo[]
  onReady?: () => void
}) {
  const { animationKey } = useDevBackground(isActive)

  useEffect(() => {
    if (!isActive) return
    const t = setTimeout(() => onReady?.(), 1500)
    return () => clearTimeout(t)
  }, [isActive, animationKey, onReady])

  return (
    <div className="bg-fixed-overlay bg-gradient-to-br from-app-bg via-app-bg-2 to-app-bg-3">
      <m.div
        className="grid h-full grid-cols-1 items-center justify-center gap-6 p-6 md:grid-cols-2"
        variants={containerVariants}
        initial="hidden"
        animate={isActive ? 'visible' : 'hidden'}
        key={animationKey}
      >
        {videos.map((video) => (
          <m.div
            key={video.url}
            className="relative aspect-video overflow-hidden rounded-xl border-2 border-white/10 shadow-2xl"
            variants={itemVariants}
            whileHover={{ scale: 1.02, zIndex: 10 }}
            transition={{ duration: 0.3 }}
          >
            <video
              src={video.url}
              poster={video.posterUrl ?? undefined}
              autoPlay={isActive}
              muted
              loop
              playsInline
              preload={isActive ? 'auto' : 'none'}
              className="h-full w-full object-cover"
            />
            {video.title && (
              <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/90 via-black/50 to-transparent p-6">
                <p className="text-lg font-bold text-white">{video.title}</p>
              </div>
            )}
          </m.div>
        ))}
      </m.div>
      <div className="bg-overlay-gradient" />
    </div>
  )
}
