'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateProfile, updateUsername } from '../actions'
import type { DashboardData } from '@/types/dashboard'

export function useProfileSection(data: DashboardData) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  const [displayName, setDisplayName] = useState(data.displayName ?? '')
  const [bio, setBio] = useState(data.bio ?? '')
  const [accent, setAccent] = useState(data.accent)
  const [username, setUsername] = useState(data.username)
  const [msg, setMsg] = useState<string | null>(null)

  function saveProfile() {
    setMsg(null)
    startTransition(async () => {
      const res = await updateProfile({
        displayName: displayName || null,
        bio: bio || null,
        accent,
      })
      setMsg(res.ok ? 'Saved' : res.error)
      if (res.ok) router.refresh()
    })
  }

  function saveUsername() {
    setMsg(null)
    startTransition(async () => {
      const res = await updateUsername(username)
      setMsg(res.ok ? 'Username updated' : res.error)
      if (res.ok) router.refresh()
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
    username,
    setUsername,
    msg,
    saveProfile,
    saveUsername,
  }
}
