'use client'

import { useState, useEffect } from 'react'

export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
  },
}

// `col` is the cell's column index: each row reveals left→right with a small
// bounded stagger. The top-to-bottom order comes from the load gate in the
// component, not from the delay, so it can't run away on large grids.
export const itemVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: (col: number = 0) => ({
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      delay: col * 0.04,
      ease: [0, 0, 0.2, 1] as const,
    },
  }),
}

export function usePersonalBackground(isActive: boolean) {
  const [images, setImages] = useState<string[]>([])
  const [animationKey, setAnimationKey] = useState(0)

  useEffect(() => {
    fetch('/api/instagram')
      .then(r => r.json())
      .then(data => {
        if (data.images?.length > 0) setImages(data.images)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (isActive) setAnimationKey(prev => prev + 1)
  }, [isActive])

  return { images, animationKey }
}
