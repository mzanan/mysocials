'use client'

import { useState, useEffect } from 'react'
import { getBrowserCache, setBrowserCache } from '@/lib/browser-cache'

interface ValorantImage {
  id: string
  url: string
  thumbnail: string
  author: string
  authorUrl: string
}

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
      duration: 0.4,
      delay: index * 0.03,
      ease: [0, 0, 0.2, 1] as const,
    },
  }),
}

export function useValorantBackground(isActive: boolean) {
  const [images, setImages] = useState<ValorantImage[]>([])
  const [animationKey, setAnimationKey] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchImages = async () => {
      setIsLoading(true)
      // Check browser cache first
      const cached = getBrowserCache<ValorantImage[]>('valorant_images')
      if (cached && cached.length > 0) {
        setImages(cached)
        setIsLoading(false)
        return
      }

      // Fetch from API if not cached
      try {
        const response = await fetch('/api/valorant')
        const data = await response.json()
        if (data.images && data.images.length > 0) {
          // Cache the images
          setBrowserCache('valorant_images', data.images)
          setImages(data.images)
        }
      } catch (error) {
        console.error('Error fetching Valorant images:', error)
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
