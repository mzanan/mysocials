'use client'

import { useState, useEffect } from 'react'
import { getBrowserCache, setBrowserCache } from '@/lib/browser-cache'

export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.02,
    },
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
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchImages = async () => {
      setIsLoading(true)
      // Check browser cache first
      const cached = getBrowserCache<string[]>('instagram_images')
      if (cached && cached.length > 0) {
        let repeatedImages: string[] = []
        while (repeatedImages.length < 40) {
          repeatedImages = [...repeatedImages, ...cached]
        }
        setImages(repeatedImages.slice(0, 40))
        setIsLoading(false)
        return
      }

      // Fetch from API if not cached
      try {
        const response = await fetch('/api/instagram')
        const data = await response.json()
        if (data.images && data.images.length > 0) {
          // Cache the images
          setBrowserCache('instagram_images', data.images)

          let repeatedImages: string[] = []
          while (repeatedImages.length < 40) {
            repeatedImages = [...repeatedImages, ...data.images]
          }
          setImages(repeatedImages.slice(0, 40))
        }
      } catch (error) {
        console.error('Error fetching Instagram images:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchImages()
  }, [])

  useEffect(() => {
    if (isActive) {
      setAnimationKey(prev => prev + 1)
    }
  }, [isActive])

  return {
    images,
    animationKey,
    isLoading
  }
}
