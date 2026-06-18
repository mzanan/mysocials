'use client'

import { useRef } from 'react'
import { Play } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { MediaPublic } from '@/types/profile'

export function VideoTile({
  video,
  onOpen,
  className,
}: {
  video: MediaPublic
  onOpen: () => void
  className?: string
}) {
  const ref = useRef<HTMLVideoElement>(null)

  function preview() {
    ref.current?.play().catch(() => {})
  }
  function stop() {
    const v = ref.current
    if (!v) return
    v.pause()
    v.currentTime = 0
  }

  return (
    <button
      type="button"
      onClick={onOpen}
      onMouseEnter={preview}
      onMouseLeave={stop}
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-hairline-strong bg-surface shadow-glass-lg',
        className,
      )}
    >
      <video
        ref={ref}
        src={video.url}
        poster={video.posterUrl ?? undefined}
        muted
        loop
        playsInline
        preload="metadata"
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute bottom-3 left-3 grid size-9 place-items-center rounded-full bg-black/40 text-white backdrop-blur-md transition-transform duration-300 group-hover:scale-110"
      >
        <Play size={16} className="translate-x-px fill-current" />
      </span>
    </button>
  )
}
