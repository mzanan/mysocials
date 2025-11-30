'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { usePersonalBackground, containerVariants, itemVariants } from './usePersonalBackground'
import { useResponsiveColumns } from '@/hooks/useResponsiveColumns'

export function PersonalBackground({ isActive }: { isActive: boolean }) {
  const { images, animationKey } = usePersonalBackground(isActive)
  const columns = useResponsiveColumns(images)
  const columnCount = columns.length

  return (
    <div className="bg-fixed-overlay">
      <motion.div
        className="flex w-full gap-1 p-1"
        variants={containerVariants}
        initial="hidden"
        animate={isActive ? 'visible' : 'hidden'}
        key={animationKey}
      >
        {columns.map((col, colIdx) => (
          <div key={colIdx} className="flex flex-col gap-1 flex-1 min-w-0">
            {col.map((src, imgIdx) => {
              const globalIndex = imgIdx * columnCount + colIdx
              return (
                <motion.div
                  key={imgIdx}
                  className="relative overflow-hidden rounded-sm w-full aspect-square"
                  variants={itemVariants}
                  custom={globalIndex}
                  whileHover={{ scale: 1.05, zIndex: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <Image
                    src={src}
                    alt={`Background image ${imgIdx}`}
                    width={500}
                    height={500}
                    className="w-full h-auto object-cover"
                  />
                </motion.div>
              )
            })}
          </div>
        ))}
      </motion.div>

      <div className="bg-overlay-gradient" />
    </div>
  )
}