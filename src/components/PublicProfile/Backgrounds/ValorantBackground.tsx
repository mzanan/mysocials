'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'

interface Video {
  id: string
  thumbnail: string
  title: string
  url: string
  platform: 'twitch' | 'tiktok'
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0, 0, 0.2, 1] as const,
    },
  },
}

export function ValorantBackground() {
  const [videos, setVideos] = useState<Video[]>([])

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const [twitchResponse, tiktokResponse] = await Promise.all([
          fetch('/api/twitch'),
          fetch('/api/tiktok'),
        ])

        const twitchData = await twitchResponse.json()
        const tiktokData = await tiktokResponse.json()

        const allVideos: Video[] = [
          ...(twitchData.videos || []),
          ...(tiktokData.videos || []),
        ]

        setVideos(allVideos.slice(0, 12))
      } catch (error) {
        console.error('Error fetching videos:', error)
      }
    }

    fetchVideos()
  }, [])

  if (videos.length === 0) {
    return (
      <div className="fixed inset-0 overflow-hidden z-0 bg-gray-900 flex items-center justify-center">
        <div className="text-white/30">Loading videos...</div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 overflow-hidden z-0 bg-gray-900">
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 h-full items-center justify-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        key={videos.length}
      >
        {videos.map((video) => (
          <motion.div
            key={video.id}
            className="relative aspect-video rounded-lg overflow-hidden shadow-2xl"
            variants={itemVariants}
            whileHover={{ scale: 1.05, zIndex: 10 }}
            transition={{ duration: 0.3 }}
          >
            <Image
              src={video.thumbnail}
              alt={video.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end p-4">
              <div className="text-white">
                <p className="font-semibold text-sm">{video.title}</p>
                <p className="text-xs text-gray-300 mt-1">{video.platform === 'twitch' ? 'Twitch' : 'TikTok'}</p>
              </div>
            </div>
            {video.platform === 'tiktok' && (
              <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                <span>🎵</span>
                TikTok
              </div>
            )}
          </motion.div>
        ))}
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50 pointer-events-none" />
    </div>
  )
}

