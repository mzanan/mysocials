'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateProfile, updateSearchVisibility, updateUsername } from '../actions'
import { toast } from '@/lib/toast'
import type { DashboardData } from '@/types/dashboard'

export function useProfileSection(data: DashboardData) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  const [displayName, setDisplayName] = useState(data.displayName ?? '')
  const [bio, setBio] = useState(data.bio ?? '')
  const [accent, setAccent] = useState(data.accent)
  const [username, setUsername] = useState(data.username)
  const [savedUsername, setSavedUsername] = useState(data.username)
  const [hideFromSearch, setHideFromSearch] = useState(data.hideFromSearch)
  const theme = data.theme

  function saveProfile(patch?: { accent?: string }) {
    startTransition(async () => {
      const res = await updateProfile({
        displayName: displayName || null,
        bio: bio || null,
        accent: patch?.accent ?? accent,
        theme,
      })
      if (!res.ok) toast.error(res.error)
      else router.refresh()
    })
  }

  function toggleHideFromSearch(hidden: boolean) {
    const previous = hideFromSearch
    setHideFromSearch(hidden)
    startTransition(async () => {
      const res = await updateSearchVisibility(hidden)
      if (res.ok) {
        router.refresh()
      } else {
        setHideFromSearch(previous)
        toast.error(res.error)
      }
    })
  }

  function saveUsername() {
    if (username === savedUsername) return
    startTransition(async () => {
      const res = await updateUsername(username)
      if (res.ok) {
        setSavedUsername(username)
        toast.success('Username updated')
        router.refresh()
      } else {
        toast.error(res.error)
        setUsername(savedUsername)
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
    username,
    setUsername,
    saveProfile,
    saveUsername,
    hideFromSearch,
    toggleHideFromSearch,
  }
}
