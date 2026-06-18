'use client'

import { useEffect, useMemo, useState } from 'react'
import { cn } from '@/lib/utils'
import {
  GAP,
  buildSlots,
  useViewportWidth,
  wallColumns,
  type WallSlot,
  type WallVideo,
} from './useVideoWall'

const READY_MS = 600

function WallTile({ slot, isActive }: { slot: WallSlot; isActive: boolean }) {
  const [loaded, setLoaded] = useState(false)

  return (
    <div
      className={cn(
        'mb-1 break-inside-avoid overflow-hidden rounded-md bg-grid-base',
        !loaded && 'aspect-[3/4] skeleton-shimmer',
      )}
    >
      <video
        src={slot.url}
        poster={slot.posterUrl ?? undefined}
        autoPlay={slot.live && isActive}
        muted
        loop={slot.live}
        playsInline
        preload="metadata"
        onLoadedMetadata={() => setLoaded(true)}
        className={cn('block w-full', loaded ? 'h-auto' : 'h-full object-cover')}
      />
    </div>
  )
}

function SingleVideo({ video, isActive }: { video: WallVideo; isActive: boolean }) {
  return (
    <div className="bg-fixed-overlay bg-app-bg">
      {video.posterUrl ? (
        <div
          aria-hidden
          className="absolute inset-0 scale-110 bg-cover bg-center blur-2xl brightness-50"
          style={{ backgroundImage: `url(${video.posterUrl})` }}
        />
      ) : (
        <video
          aria-hidden
          src={video.url}
          autoPlay={isActive}
          muted
          loop
          playsInline
          className="absolute inset-0 h-full w-full scale-110 object-cover blur-2xl brightness-50"
        />
      )}
      <video
        src={video.url}
        poster={video.posterUrl ?? undefined}
        autoPlay={isActive}
        muted
        loop
        playsInline
        preload={isActive ? 'auto' : 'none'}
        className="relative h-full w-full object-contain"
      />
      <div className="bg-overlay-gradient" />
    </div>
  )
}

export function VideoWall({
  isActive,
  videos,
  onReady,
}: {
  isActive: boolean
  videos: WallVideo[]
  onReady?: () => void
}) {
  const width = useViewportWidth()
  const count = videos.length
  const cols = wallColumns(count, width)
  const slots = useMemo(() => buildSlots(videos, cols), [videos, cols])

  useEffect(() => {
    if (!isActive) return
    const t = setTimeout(() => onReady?.(), READY_MS)
    return () => clearTimeout(t)
  }, [isActive, onReady])

  if (count === 0) return <div className="bg-fixed-overlay bg-app-bg" />
  if (count === 1) return <SingleVideo video={videos[0]} isActive={isActive} />

  return (
    <div className="bg-fixed-overlay bg-grid-base">
      <div
        className="absolute inset-0 overflow-hidden p-1"
        style={{ columnCount: cols, columnGap: GAP }}
      >
        {slots.map((slot) => (
          <WallTile key={slot.key} slot={slot} isActive={isActive} />
        ))}
      </div>
      <div className="bg-overlay-gradient" />
    </div>
  )
}
