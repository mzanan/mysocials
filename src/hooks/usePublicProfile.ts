'use client'

import { useState, useEffect } from 'react'
import { Link } from '@/types/link'
import { Profile } from '@/types/profile'

interface PublicProfileData {
  profile: Profile
  links: Link[]
}

interface UsePublicProfileResult {
  data: PublicProfileData | null
  loading: boolean
  error: string | null
}

export function usePublicProfile(username: string): UsePublicProfileResult {
  const [data, setData] = useState<PublicProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const trackProfileView = async (username: string) => {
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
    const fetchProfile = async () => {
      if (!username) return

      try {
        setLoading(true)
        const response = await fetch(`/api/profile/${username}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Profile not found')
          }
          throw new Error('Error loading profile')
        }
        
        const result = await response.json()
        setData(result)

        trackProfileView(username)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [username])

  return {
    data,
    loading,
    error
  }
}