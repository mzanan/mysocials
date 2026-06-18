'use client'

import { useEffect, useRef, useState } from 'react'
import { Volume2, VolumeX } from 'lucide-react'
import type { MediaPublic } from '@/types/profile'

function ReelItem({ video, muted }: { video: MediaPublic; muted: boolean }) {
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (ref.current) ref.current.muted = muted
  }, [muted])

  useEffect(() => {
    const v = ref.current
    if (!v) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) v.play().catch(() => {})
        else v.pause()
      },
      { threshold: 0.6 },
    )
    io.observe(v)
    return () => io.disconnect()
  }, [])

  return (
    <section className="relative h-dvh w-full snap-start snap-always">
      {video.posterUrl && (
        <div
          aria-hidden
          className="absolute inset-0 scale-110 bg-cover bg-center blur-2xl brightness-50"
          style={{ backgroundImage: `url(${video.posterUrl})` }}
        />
      )}
      <video
        ref={ref}
        src={video.url}
        poster={video.posterUrl ?? undefined}
        muted
        loop
        playsInline
        preload="metadata"
        className="relative h-full w-full object-contain"
      />
    </section>
  )
}

export function VideoReelFeed({ videos }: { videos: MediaPublic[] }) {
  const [muted, setMuted] = useState(true)

  return (
    <div className="no-scrollbar absolute inset-0 snap-y snap-mandatory overflow-y-scroll overscroll-contain">
      {videos.map((video) => (
        <ReelItem key={video.url} video={video} muted={muted} />
      ))}
      <button
        type="button"
        onClick={() => setMuted((m) => !m)}
        aria-label={muted ? 'Unmute' : 'Mute'}
        className="fixed bottom-24 right-4 z-30 grid size-11 place-items-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-md transition hover:bg-black/60"
      >
        {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
      </button>
    </div>
  )
}
