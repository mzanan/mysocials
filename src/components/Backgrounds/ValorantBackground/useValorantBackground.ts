'use client'

import { useState, useEffect } from 'react'

interface ValorantImage {
  id: string
  src: string
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export function useValorantBackground(isActive: boolean) {
  const [images, setImages] = useState<ValorantImage[]>([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [animationKey, setAnimationKey] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [imagesPreloaded, setImagesPreloaded] = useState(false)

  useEffect(() => {
    const loadAndPreloadImages = async () => {
      setIsLoading(true)

      try {
        const response = await fetch('/api/valorant')
        const data = await response.json()
        const imageFiles = data.images || []

        const shuffledImages = shuffleArray(imageFiles)
        const imagesWithIds: ValorantImage[] = shuffledImages.map((filename, index) => ({
          id: `valorant-${index}`,
          src: `/images/valorant/${filename}`
        }))

        setImages(imagesWithIds)

        const preloadPromises = imagesWithIds.map((image) => {
          return new Promise<void>((resolve) => {
            const img = new window.Image()
            img.onload = () => resolve()
            img.onerror = () => resolve()
            img.src = image.src
          })
        })

        await Promise.all(preloadPromises)
        setImagesPreloaded(true)
        setIsLoading(false)
      } catch (error) {
        console.error('Error loading valorant images:', error)
        setIsLoading(false)
      }
    }

    loadAndPreloadImages()
  }, [])

  useEffect(() => {
    if (isActive && images.length > 0) {
      const interval = setInterval(() => {
        setCurrentImageIndex(prev => (prev + 1) % images.length)
        setAnimationKey(prev => prev + 1)
      }, 3000)

      return () => clearInterval(interval)
    }
  }, [isActive, images.length])

  const currentImage = images[currentImageIndex]

  return {
    currentImage,
    images,
    animationKey,
    isLoading: isLoading || !imagesPreloaded
  }
}
