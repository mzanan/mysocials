'use client'

import { useState, useEffect } from 'react'
import { getBrowserCache, setBrowserCache } from '@/lib/browser-cache'

interface Project {
  url: string
  screenshot: string
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
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchScreenshots = async () => {
      setIsLoading(true)
      // Check browser cache first
      const cached = getBrowserCache<Project[]>('dev_screenshots')
      if (cached && cached.length > 0) {
        setProjects(cached)
        setIsLoading(false)
        return
      }

      // Fetch from API if not cached
      try {
        const response = await fetch('/api/dev-screenshots')
        const data = await response.json()
        if (data.screenshots && data.screenshots.length > 0) {
          // Cache the screenshots
          setBrowserCache('dev_screenshots', data.screenshots)
          setProjects(data.screenshots)
        }
      } catch (error) {
        console.error('Error fetching dev screenshots:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchScreenshots()
  }, [])

  useEffect(() => {
    if (isActive) {
      setAnimationKey(prev => prev + 1)
    }
  }, [isActive])

  return {
    projects,
    animationKey,
    isLoading
  }
}
