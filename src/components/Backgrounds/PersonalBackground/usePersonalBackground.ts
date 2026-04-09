'use client'

import { useState, useEffect } from 'react'

export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
  },
}

export const itemVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: (index: number = 0) => ({
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      delay: index * 0.03,
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
