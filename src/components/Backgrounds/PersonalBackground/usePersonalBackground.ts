'use client'

import { useState, useEffect } from 'react'

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

export function usePersonalBackground(isActive: boolean, initialImages: string[]) {
  const [animationKey, setAnimationKey] = useState(0)

  useEffect(() => {
    if (isActive) setAnimationKey(prev => prev + 1)
  }, [isActive])

  return { images: initialImages, animationKey }
}
