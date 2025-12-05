'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { useValorantBackground } from './useValorantBackground'

export function ValorantBackground({ isActive }: { isActive: boolean }) {
  const { currentImage, animationKey, isLoading } = useValorantBackground(isActive)

  if (isLoading || !currentImage) {
    return (
      <div className="fixed inset-0 bg-gray-900 flex items-center justify-center">
        <div className="text-white/30">Loading images...</div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 overflow-hidden">
      <AnimatePresence mode="wait">
        {isActive && (
          <motion.div
            key={`${currentImage.id}-${animationKey}`}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 0.95, filter: 'blur(5px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.95, filter: 'blur(5px)' }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <Image
              src={currentImage.src}
              alt="Valorant background"
              fill
              className="object-cover"
              priority
              loading="eager"
              quality={90}
              sizes="100vw"
            />
          </motion.div>
        )}
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20" />
    </div>
  )
}