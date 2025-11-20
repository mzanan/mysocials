'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { getBrowserCache, setBrowserCache } from '@/lib/browser-cache'

interface ValorantImage {
  id: string
  url: string
  thumbnail: string
  author: string
  authorUrl: string
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0, 0, 0.2, 1] as const,
    },
  },
}

interface ValorantBackgroundProps {
  isActive: boolean
}

export function ValorantBackground({ isActive }: ValorantBackgroundProps) {
  const [images, setImages] = useState<ValorantImage[]>([])
  const [animationKey, setAnimationKey] = useState(0)

  useEffect(() => {
    if (isActive) {
      setAnimationKey(prev => prev + 1)
    }
  }, [isActive])

  useEffect(() => {
    const fetchImages = async () => {
      // Check browser cache first
      const cached = getBrowserCache<ValorantImage[]>('valorant_images')
      if (cached && cached.length > 0) {
        setImages(cached)
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
      }
    }

    fetchImages()
  }, [])

  if (images.length === 0) {
    return (
      <div className="fixed inset-0 overflow-hidden z-0 bg-gray-900 flex items-center justify-center">
        <div className="text-white/30">Loading images...</div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 overflow-hidden z-0 bg-gray-900">
      <motion.div
        className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-1 p-1"
        variants={containerVariants}
        initial="hidden"
        animate={isActive ? "visible" : "hidden"}
        key={animationKey}
      >
        {images.map((image) => (
          <motion.a
            key={image.id}
            href={image.url}
            target="_blank"
            rel="noopener noreferrer"
            className="relative aspect-square rounded-sm overflow-hidden shadow-lg cursor-pointer block group"
            variants={itemVariants}
            whileHover={{ scale: 1.1, zIndex: 10 }}
            transition={{ duration: 0.3 }}
          >
            <Image
              src={image.thumbnail}
              alt={`Valorant image by ${image.author}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 25vw, (max-width: 1024px) 20vw, 12.5vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
              <p className="text-white text-xs line-clamp-1 font-medium">by {image.author}</p>
            </div>
          </motion.a>
        ))}
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40 pointer-events-none" />
    </div>
  )
}

