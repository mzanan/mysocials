'use client'

import { useCallback, useEffect, useState } from 'react'

export interface LightboxState {
  index: number | null
  open: (i: number) => void
  close: () => void
  next: () => void
  prev: () => void
}

export function useVideoLightbox(count: number): LightboxState {
  const [index, setIndex] = useState<number | null>(null)

  const open = useCallback((i: number) => setIndex(i), [])
  const close = useCallback(() => setIndex(null), [])
  const next = useCallback(
    () => setIndex((i) => (i === null ? i : (i + 1) % count)),
    [count],
  )
  const prev = useCallback(
    () => setIndex((i) => (i === null ? i : (i - 1 + count) % count)),
    [count],
  )

  useEffect(() => {
    if (index === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      else if (e.key === 'ArrowRight') next()
      else if (e.key === 'ArrowLeft') prev()
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [index, close, next, prev])

  return { index, open, close, next, prev }
}
