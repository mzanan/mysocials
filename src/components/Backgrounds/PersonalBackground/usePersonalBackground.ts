'use client'

import { useState } from 'react'

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

export function usePersonalBackground(isActive: boolean, initialImages: string[]) {
  const [animationKey, setAnimationKey] = useState(0)
  const [wasActive, setWasActive] = useState(isActive)

  if (isActive !== wasActive) {
    setWasActive(isActive)
    if (isActive) setAnimationKey((prev) => prev + 1)
  }

  return { images: initialImages, animationKey }
}
