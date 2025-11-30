'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { useValorantBackground, containerVariants, itemVariants } from './useValorantBackground'
import { useResponsiveColumns } from '@/hooks/useResponsiveColumns'

export function ValorantBackground({ isActive }: { isActive: boolean }) {
  const { images, animationKey, isLoading } = useValorantBackground(isActive)
  const columns = useResponsiveColumns(images)
  const columnCount = columns.length

  if (isLoading) {
    return (
      <div className="bg-fixed-overlay bg-gray-900 flex items-center justify-center">
        <div className="text-white/30">Loading images...</div>
      </div>
    )
  }

  return (
    <div className="bg-fixed-overlay bg-gray-900">
      <motion.div
        className="flex w-full gap-1 p-1"
        variants={containerVariants}
        initial="hidden"
        animate={isActive ? "visible" : "hidden"}
        key={animationKey}
      >
        {columns.map((col, colIdx) => (
          <div key={colIdx} className="flex flex-col gap-1 flex-1 min-w-0">
            {col.map((image, imgIdx) => {
              const globalIndex = imgIdx * columnCount + colIdx
              return (
                <motion.a
                  key={image.id}
                  href={image.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative aspect-square rounded-sm overflow-hidden shadow-lg cursor-pointer block group"
                  variants={itemVariants}
                  custom={globalIndex}
                  whileHover={{ scale: 1.05, zIndex: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <Image
                    src={image.thumbnail}
                    alt={`Valorant image by ${image.author}`}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                    <p className="text-white text-xs line-clamp-1 font-medium">by {image.author}</p>
                  </div>
                </motion.a>
              )
            })}
          </div>
        ))}
      </motion.div>
      <div className="bg-overlay-gradient" />
    </div>
  )
}