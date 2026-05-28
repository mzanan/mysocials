'use client'

import { useEffect } from 'react'
import { m } from 'motion/react'
import { useDevBackground, containerVariants, itemVariants } from './useDevBackground'

export function DevBackground({ isActive, onReady }: { isActive: boolean; onReady?: () => void }) {
  const { projects, animationKey } = useDevBackground(isActive)

  useEffect(() => {
    if (!isActive) return
    const t = setTimeout(() => onReady?.(), 1500)
    return () => clearTimeout(t)
  }, [isActive, animationKey, onReady])

  return (
    <div className="bg-fixed-overlay bg-gradient-to-br from-[#15151f] via-[#16131d] to-[#0e0e16]">
      <m.div
        className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 h-full items-center justify-center"
        variants={containerVariants}
        initial="hidden"
        animate={isActive ? "visible" : "hidden"}
        key={animationKey}
      >
        {projects.map((project) => (
          <m.div
            key={project.url}
            className="relative aspect-video rounded-xl overflow-hidden shadow-2xl border-2 border-white/10"
            variants={itemVariants}
            whileHover={{ scale: 1.02, zIndex: 10 }}
            transition={{ duration: 0.3 }}
          >
            <video
              src={project.video}
              poster={project.video.replace(/\.mp4$/, '.webp')}
              autoPlay={isActive}
              muted
              loop
              playsInline
              preload={isActive ? 'auto' : 'none'}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-end p-6">
              <div className="text-white">
                <p className="font-bold text-lg">{project.title}</p>
                <p className="text-sm text-gray-300 mt-1">Web Development</p>
              </div>
            </div>
          </m.div>
        ))}
      </m.div>
      <div className="bg-overlay-gradient" />
    </div>
  )
}

