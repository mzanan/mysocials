'use client'

import { AnimatePresence, m } from 'motion/react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import type { LightboxState } from './useVideoLightbox'
import type { MediaPublic } from '@/types/profile'

const CTRL =
  'grid size-10 place-items-center rounded-full bg-white/10 text-white backdrop-blur-md transition hover:bg-white/20'

export function VideoLightbox({
  videos,
  state,
}: {
  videos: MediaPublic[]
  state: LightboxState
}) {
  const { index, close, next, prev } = state
  const active = index === null ? null : videos[index]
  const multi = videos.length > 1

  return (
    <AnimatePresence>
      {active && (
        <m.div
          className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={close}
        >
          <button type="button" aria-label="Close" onClick={close} className={`absolute right-4 top-4 z-10 ${CTRL}`}>
            <X size={18} />
          </button>

          {multi && (
            <>
              <button
                type="button"
                aria-label="Previous"
                onClick={(e) => {
                  e.stopPropagation()
                  prev()
                }}
                className={`absolute left-3 top-1/2 z-10 -translate-y-1/2 sm:left-6 ${CTRL}`}
              >
                <ChevronLeft size={20} />
              </button>
              <button
                type="button"
                aria-label="Next"
                onClick={(e) => {
                  e.stopPropagation()
                  next()
                }}
                className={`absolute right-3 top-1/2 z-10 -translate-y-1/2 sm:right-6 ${CTRL}`}
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}

          <m.video
            key={active.url}
            src={active.url}
            poster={active.posterUrl ?? undefined}
            autoPlay
            loop
            playsInline
            controls
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.25 }}
            className="max-h-[85dvh] max-w-[92vw] rounded-2xl shadow-2xl"
          />
        </m.div>
      )}
    </AnimatePresence>
  )
}
