'use client'

import { useState, useEffect } from 'react'
import { getDevProjects } from '@/lib/projects'

interface Project {
  url: string
  video: string
  title: string
}

export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3,
    },
  },
}

export const itemVariants = {
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

export function useDevBackground(isActive: boolean) {
  const [projects, setProjects] = useState<Project[]>([])
  const [animationKey, setAnimationKey] = useState(0)

  useEffect(() => {
    const devProjects = getDevProjects()
    setProjects(devProjects)
  }, [])

  useEffect(() => {
    if (isActive) {
      setAnimationKey(prev => prev + 1)
    }
  }, [isActive])

  return {
    projects,
    animationKey
  }
}
