'use client'

import { useEffect, useMemo, useState } from 'react'
import { m } from 'motion/react'
import { cn } from '@/lib/utils'
import {
  DESKTOP_MIN,
  FILL_PER_COL,
  GAP,
  assignColumns,
  buildSlots,
  justifyLayout,
  knownAspect,
  useAspects,
  useViewportHeight,
  useViewportWidth,
  wallColumns,
  type WallSlot,
  type WallVideo,
} from './useVideoWall'

const READY_MS = 1100
const MEASURE_TIMEOUT_MS = 2500
const ENTRANCE_EASE: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94]
const entranceDelay = (index: number) => Math.min(index * 0.06, 0.6)

function WallTile({
  slot,
  index,
  isActive,
  aspect,
}: {
  slot: WallSlot
  index: number
  isActive: boolean
  aspect: number
}) {
  const [loaded, setLoaded] = useState(false)

  return (
    <m.div
      className={cn(
        'overflow-hidden rounded-md bg-grid-base',
        !loaded && 'skeleton-shimmer',
      )}
      style={{ aspectRatio: aspect }}
      initial={{ opacity: 0, scale: 1.04 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.1, delay: entranceDelay(index), ease: ENTRANCE_EASE }}
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
        className="block h-full w-full object-cover"
      />
    </m.div>
  )
}

function JustifiedTile({
  video,
  index,
  isActive,
  live,
  rect,
  onAspect,
}: {
  video: WallVideo
  index: number
  isActive: boolean
  live: boolean
  rect: { x: number; y: number; width: number; height: number }
  onAspect: (url: string, aspect: number) => void
}) {
  const [loaded, setLoaded] = useState(false)

  return (
    <m.div
      className={cn(
        'absolute overflow-hidden rounded-md bg-grid-base',
        !loaded && 'skeleton-shimmer',
      )}
      style={{ left: rect.x, top: rect.y, width: rect.width, height: rect.height }}
      initial={{ opacity: 0, scale: 1.04 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.1, delay: entranceDelay(index), ease: ENTRANCE_EASE }}
    >
      <video
        src={video.url}
        poster={video.posterUrl ?? undefined}
        autoPlay={live && isActive}
        muted
        loop={live}
        playsInline
        preload="metadata"
        onLoadedMetadata={(e) => {
          const el = e.currentTarget
          if (el.videoWidth && el.videoHeight) onAspect(video.url, el.videoWidth / el.videoHeight)
          setLoaded(true)
        }}
        className="h-full w-full object-cover"
      />
    </m.div>
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
  const height = useViewportHeight()
  const count = videos.length
  const cols = wallColumns(count, width)
  const slots = useMemo(() => buildSlots(videos, cols), [videos, cols])
  const isDesktop = width >= DESKTOP_MIN

  const aspectItems = useMemo(
    () => videos.map((v) => ({ url: v.url, aspect: knownAspect(v) })),
    [videos],
  )
  const { aspects, reportAspect } = useAspects(aspectItems)
  const rects = useMemo(
    () => justifyLayout(aspects, width - GAP * 2, height - GAP * 2, GAP),
    [aspects, width, height],
  )

  const slotAspectItems = useMemo(
    () => slots.map((s) => ({ url: s.url, aspect: knownAspect(s) })),
    [slots],
  )
  const {
    aspects: slotAspects,
    reportAspect: reportSlotAspect,
    measuredCount,
  } = useAspects(slotAspectItems)
  const slotUrls = useMemo(() => slots.map((s) => s.url), [slots])
  const columns = useMemo(() => assignColumns(slotAspects, cols), [slotAspects, cols])
  const uniqueUrls = useMemo(() => Array.from(new Set(slotUrls)), [slotUrls])

  const [measureTimedOut, setMeasureTimedOut] = useState(false)
  useEffect(() => {
    if (isDesktop) return
    const t = setTimeout(() => setMeasureTimedOut(true), MEASURE_TIMEOUT_MS)
    return () => clearTimeout(t)
  }, [isDesktop])
  const wallReady = isDesktop || measuredCount >= uniqueUrls.length || measureTimedOut

  const [animationKey, setAnimationKey] = useState(0)
  const [wasActive, setWasActive] = useState(isActive)
  if (isActive !== wasActive) {
    setWasActive(isActive)
    if (isActive) setAnimationKey((k) => k + 1)
  }

  useEffect(() => {
    if (!isActive) return
    const t = setTimeout(() => onReady?.(), READY_MS)
    return () => clearTimeout(t)
  }, [isActive, onReady])

  if (count === 0) return <div className="bg-fixed-overlay bg-app-bg" />
  if (count === 1) return <SingleVideo video={videos[0]} isActive={isActive} />

  return (
    <div className="bg-fixed-overlay bg-grid-base">
      {isDesktop ? (
        <div key={animationKey} className="absolute" style={{ inset: GAP }}>
          {videos.map((video, i) => (
            <JustifiedTile
              key={video.url}
              video={video}
              index={i}
              isActive={isActive}
              live={i < 6}
              rect={rects[i] ?? { x: 0, y: 0, width: 0, height: 0 }}
              onAspect={reportAspect}
            />
          ))}
        </div>
      ) : wallReady ? (
        <div key={animationKey} className="absolute inset-x-0 top-0 flex p-1" style={{ gap: GAP }}>
          {columns.map((colIndices, c) => (
            <div key={c} className="flex flex-1 flex-col" style={{ gap: GAP }}>
              {colIndices.map((idx) => (
                <WallTile
                  key={slots[idx].key}
                  slot={slots[idx]}
                  index={idx}
                  isActive={isActive}
                  aspect={slotAspects[idx]}
                />
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div className="absolute inset-x-0 top-0 flex p-1" style={{ gap: GAP }}>
          {Array.from({ length: cols }, (_, c) => (
            <div key={c} className="flex flex-1 flex-col" style={{ gap: GAP }}>
              {Array.from({ length: FILL_PER_COL }, (_, r) => (
                <div key={r} className="aspect-[3/4] rounded-md bg-grid-base skeleton-shimmer" />
              ))}
            </div>
          ))}
          {uniqueUrls.map((url) => (
            <video
              key={url}
              src={url}
              muted
              playsInline
              preload="metadata"
              onLoadedMetadata={(e) => {
                const el = e.currentTarget
                if (el.videoWidth && el.videoHeight) reportSlotAspect(url, el.videoWidth / el.videoHeight)
              }}
              className="hidden"
            />
          ))}
        </div>
      )}
      <div className="bg-overlay-gradient" />
    </div>
  )
}
