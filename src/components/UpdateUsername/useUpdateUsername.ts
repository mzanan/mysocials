'use client'

import { useState } from 'react'
import { useProfile } from '@/hooks/useProfile'
import { toast } from 'sonner'

interface UseUpdateUsernameResult {
  newUsername: string
  setNewUsername: (username: string) => void
  isLoading: boolean
  error: string | null
  success: boolean
  canUpdate: boolean
  daysUntilUpdate: number
  handleUpdateUsername: () => Promise<void>
  resetMessages: () => void
}

export function useUpdateUsername(): UseUpdateUsernameResult {
  const [newUsername, setNewUsername] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  const { profile, updateUsername, canUpdateUsername } = useProfile()

  const calculateDaysUntilUpdate = (): number => {
    if (!profile?.username_updated_at) return 0
    
    const lastUpdate = new Date(profile.username_updated_at)
    const now = new Date()
    const daysSinceUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 3600 * 24)
    return Math.max(0, Math.ceil(30 - daysSinceUpdate))
  }

  const handleUpdateUsername = async (): Promise<void> => {
    if (!newUsername || newUsername.length < 3) return

    setIsLoading(true)
    setError(null)
    setSuccess(false)

    const result = await updateUsername(newUsername)

    if (result.success) {
      setSuccess(true)
      setNewUsername('')
      toast.success('Username updated successfully!', {
        description: `Your new username is: ${newUsername}`,
        duration: 4000,
      })
    } else {
      setError(result.error || 'Failed to update username')
      toast.error('Failed to update username', {
        description: result.error || 'Please try again later',
        duration: 4000,
      })
    }

    setIsLoading(false)
  }

  const resetMessages = (): void => {
    setError(null)
    setSuccess(false)
  }

  return {
    newUsername,
    setNewUsername,
    isLoading,
    error,
    success,
    canUpdate: canUpdateUsername,
    daysUntilUpdate: calculateDaysUntilUpdate(),
    handleUpdateUsername,
    resetMessages
  }
} 