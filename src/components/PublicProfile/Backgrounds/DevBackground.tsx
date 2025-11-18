'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'

interface Project {
  url: string
  screenshot: string
  title: string
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 30 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0, 0, 0.2, 1] as const,
    },
  },
}

export function DevBackground() {
  const [projects, setProjects] = useState<Project[]>([])

  useEffect(() => {
    const fetchScreenshots = async () => {
      try {
        const response = await fetch('/api/dev-screenshots')
        const data = await response.json()
        if (data.screenshots && data.screenshots.length > 0) {
          setProjects(data.screenshots)
        }
      } catch (error) {
        console.error('Error fetching dev screenshots:', error)
      }
    }

    fetchScreenshots()
  }, [])

  if (projects.length === 0) {
    return (
      <div className="fixed inset-0 overflow-hidden z-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white/30">Loading projects...</div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 overflow-hidden z-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 h-full items-center justify-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        key={projects.length}
      >
        {projects.map((project) => (
          <motion.div
            key={project.url}
            className="relative aspect-video rounded-xl overflow-hidden shadow-2xl border-2 border-white/10"
            variants={itemVariants}
            whileHover={{ scale: 1.02, zIndex: 10 }}
            transition={{ duration: 0.3 }}
          >
            {project.screenshot.startsWith('data:') ? (
              <Image
                src={project.screenshot}
                alt={project.title}
                fill
                className="object-cover"
                unoptimized
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            ) : (
              <Image
                src={project.screenshot}
                alt={project.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-end p-6">
              <div className="text-white">
                <p className="font-bold text-lg">{project.title}</p>
                <p className="text-sm text-gray-300 mt-1">Web Development</p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40 pointer-events-none" />
    </div>
  )
}

