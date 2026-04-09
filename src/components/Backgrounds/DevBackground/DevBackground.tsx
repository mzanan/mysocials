'use client'

import { motion } from 'framer-motion'
import { useDevBackground, containerVariants, itemVariants } from './useDevBackground'

export function DevBackground({ isActive }: { isActive: boolean }) {
  const { projects, animationKey } = useDevBackground(isActive)

  return (
    <div className="bg-fixed-overlay bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 h-full items-center justify-center"
        variants={containerVariants}
        initial="hidden"
        animate={isActive ? "visible" : "hidden"}
        key={animationKey}
      >
        {projects.map((project) => (
          <motion.div
            key={project.url}
            className="relative aspect-video rounded-xl overflow-hidden shadow-2xl border-2 border-white/10"
            variants={itemVariants}
            whileHover={{ scale: 1.02, zIndex: 10 }}
            transition={{ duration: 0.3 }}
          >
            <video
              src={project.video}
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
          </motion.div>
        ))}
      </motion.div>
      <div className="bg-overlay-gradient" />
    </div>
  )
}

