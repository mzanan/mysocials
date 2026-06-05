'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  setAvatarFromInstagram,
  setAvatarFromMedia,
  updateProfile,
  updateUsername,
} from '../actions'
import { toast } from '@/lib/toast'
import type { DashboardData } from '@/types/dashboard'

export function useProfileSection(data: DashboardData) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  const [displayName, setDisplayName] = useState(data.displayName ?? '')
  const [bio, setBio] = useState(data.bio ?? '')
  const [accent, setAccent] = useState(data.accent)
  const [username, setUsername] = useState(data.username)
  const [avatarUrl, setAvatarUrl] = useState(data.avatarUrl)
  const [avatarBusy, setAvatarBusy] = useState(false)
  const [avatarMsg, setAvatarMsg] = useState<string | null>(null)
  const [msg, setMsg] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  function saveProfile() {
    setMsg(null)
    startTransition(async () => {
      const res = await updateProfile({ displayName: displayName || null, bio: bio || null, accent })
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

  async function onAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarBusy(true)
    setAvatarMsg(null)
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/upload/avatar', { method: 'POST', body: fd })
    if (res.ok) {
      const { url } = await res.json()
      setAvatarUrl(url)
      setAvatarMsg('Avatar updated')
      toast.success('Avatar updated')
      router.refresh()
    } else {
      const body = (await res.json().catch(() => ({}))) as { error?: string }
      const m = body.error ?? 'Upload failed'
      setAvatarMsg(m)
      toast.error(m)
    }
    setAvatarBusy(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  async function useInstagramAvatar() {
    setAvatarBusy(true)
    setAvatarMsg(null)
    const res = await setAvatarFromInstagram()
    if (res.ok) {
      setAvatarUrl(res.url)
      setAvatarMsg('Avatar updated')
      toast.success('Avatar updated from Instagram')
      router.refresh()
    } else {
      setAvatarMsg(res.error)
      toast.error(res.error)
    }
    setAvatarBusy(false)
  }

  async function pickAvatarFromMedia(mediaId: string) {
    setAvatarBusy(true)
    setAvatarMsg(null)
    const res = await setAvatarFromMedia(mediaId)
    if (res.ok) {
      setAvatarUrl(res.url)
      setAvatarMsg('Avatar updated')
      toast.success('Avatar updated')
      router.refresh()
    } else {
      setAvatarMsg(res.error)
      toast.error(res.error)
    }
    setAvatarBusy(false)
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
    avatarUrl,
    avatarBusy,
    avatarMsg,
    msg,
    fileRef,
    saveProfile,
    saveUsername,
    onAvatar,
    useInstagramAvatar,
    pickAvatarFromMedia,
  }
}
