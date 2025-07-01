'use client'

import { useAuth } from '@/hooks/useAuth'
import { User } from '@supabase/supabase-js'

interface UseHeaderResult {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  handleSignOut: () => Promise<void>
}

export function useHeader(): UseHeaderResult {
  const { user, loading, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
  }

  return {
    user,
    loading,
    isAuthenticated: !!user,
    handleSignOut
  }
} 