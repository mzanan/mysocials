'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Profile } from '@/types/profile'
import { useAuth } from './useAuth'

interface UseProfileResult {
  profile: Profile | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  updateUsername: (newUsername: string) => Promise<{ success: boolean; error?: string }>
  canUpdateUsername: boolean
}

export function useProfile(): UseProfileResult {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const supabase = createClient()

  const createProfile = async (): Promise<Profile | null> => {
    try {
      const response = await fetch('/api/profile/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to create profile')
      }

      const result = await response.json()
      return result.profile
    } catch {
      return null
    }
  }

  const updateUsername = async (newUsername: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('/api/profile/update-username', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newUsername }),
      })

      const result = await response.json()

      if (!response.ok) {
        return { success: false, error: result.error }
      }

      setProfile(result.profile)
      return { success: true }
    } catch {
      return { success: false, error: 'Failed to update username' }
    }
  }

  const canUpdateUsername = (): boolean => {
    if (!profile?.username_updated_at) return true
    
    const lastUpdate = new Date(profile.username_updated_at)
    const now = new Date()
    const daysDifference = (now.getTime() - lastUpdate.getTime()) / (1000 * 3600 * 24)
    return daysDifference >= 30
  }

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setProfile(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError) {
        if (profileError.code === 'PGRST116') {
          const newProfile = await createProfile()
          if (newProfile) {
            setProfile(newProfile)
          } else {
            setError('Could not create profile. Please try again.')
          }
        } else {
          setError(profileError.message)
        }
        return
      }

      setProfile(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading profile')
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }, [user, supabase])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  return {
    profile,
    loading,
    error,
    refetch: fetchProfile,
    updateUsername,
    canUpdateUsername: canUpdateUsername()
  }
} 