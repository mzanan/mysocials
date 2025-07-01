'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'

interface UseShareProfileProps {
  username?: string
}

interface UseShareProfileResult {
  copying: boolean
  profileUrl: string
  handleCopyUrl: () => Promise<void>
}

export function useShareProfile({ username }: UseShareProfileProps): UseShareProfileResult {
  const [copying, setCopying] = useState(false)
  const [profileUrl, setProfileUrl] = useState('')

  useEffect(() => {
    if (!username) {
      setProfileUrl('')
      return
    }
    setProfileUrl(`${window.location.origin}/${username}`)
  }, [username])

  const handleCopyUrl = async (): Promise<void> => {
    if (!username || !profileUrl) return

    try {
      setCopying(true)
      await navigator.clipboard.writeText(profileUrl)
      
      toast.success('Profile link copied to clipboard!', {
        description: `${profileUrl}`,
        duration: 3000,
      })
    } catch {
      toast.error('Failed to copy link to clipboard')
    } finally {
      setCopying(false)
    }
  }

  return {
    copying,
    profileUrl,
    handleCopyUrl
  }
} 