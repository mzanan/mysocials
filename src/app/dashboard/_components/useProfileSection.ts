'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateProfile, updateUsername } from '../actions'
import { toast } from '@/lib/toast'
import type { Theme } from '@/lib/appearance'
import type { DashboardData } from '@/types/dashboard'

export function useProfileSection(data: DashboardData) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  const [displayName, setDisplayName] = useState(data.displayName ?? '')
  const [bio, setBio] = useState(data.bio ?? '')
  const [accent, setAccent] = useState(data.accent)
  const [theme, setTheme] = useState<Theme>(data.theme)
  const [username, setUsername] = useState(data.username)

  function saveProfile(patch?: { accent?: string; theme?: Theme }) {
    startTransition(async () => {
      const res = await updateProfile({
        displayName: displayName || null,
        bio: bio || null,
        accent: patch?.accent ?? accent,
        theme: patch?.theme ?? theme,
      })
      if (!res.ok) toast.error(res.error)
      else router.refresh()
    })
  }

  function saveUsername() {
    startTransition(async () => {
      const res = await updateUsername(username)
      if (res.ok) {
        toast.success('Username updated')
        router.refresh()
      } else {
        toast.error(res.error)
      }
    })
  }

  return {
    pending,
    displayName,
    setDisplayName,
    bio,
    setBio,
    accent,
    setAccent,
    theme,
    setTheme,
    username,
    setUsername,
    saveProfile,
    saveUsername,
  }
}
