'use client'

import { useState, useEffect } from 'react'

interface AnalyticsData {
  profileViews: number
  totalClicks: number
  recentViews: number
  recentClicks: number
}

interface UseAnalyticsResult {
  stats: AnalyticsData | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  trackProfileView: (username: string) => Promise<void>
}

export function useAnalytics(): UseAnalyticsResult {
  const [stats, setStats] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async (): Promise<void> => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/analytics/stats')
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics')
      }

      const data = await response.json()
      setStats(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading analytics')
    } finally {
      setLoading(false)
    }
  }

  const trackProfileView = async (username: string): Promise<void> => {
    try {
      await fetch('/api/analytics/profile-view', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      })
    } catch (err) {
      console.error('Error tracking profile view:', err)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
    trackProfileView
  }
} 