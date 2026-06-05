'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { setAvatarFromInstagram, setAvatarFromMedia } from '../actions'
import { toast } from '@/lib/toast'

export function useAvatar(initialUrl: string | null) {
  const router = useRouter()
  const [avatarUrl, setAvatarUrl] = useState(initialUrl)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  function applySuccess(url: string, label: string) {
    setAvatarUrl(url)
    setMsg(label)
    toast.success(label)
    router.refresh()
  }

  function applyError(error: string) {
    setMsg(error)
    toast.error(error)
  }

  async function uploadFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setBusy(true)
    setMsg(null)
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/upload/avatar', { method: 'POST', body: fd })
    if (res.ok) {
      const { url } = (await res.json()) as { url: string }
      applySuccess(url, 'Avatar updated')
    } else {
      const body = (await res.json().catch(() => ({}))) as { error?: string }
      applyError(body.error ?? 'Upload failed')
    }
    setBusy(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  async function useInstagramAvatar() {
    setBusy(true)
    setMsg(null)
    const res = await setAvatarFromInstagram()
    if (res.ok) applySuccess(res.url, 'Avatar updated from Instagram')
    else applyError(res.error)
    setBusy(false)
  }

  async function pickFromMedia(mediaId: string) {
    setBusy(true)
    setMsg(null)
    const res = await setAvatarFromMedia(mediaId)
    if (res.ok) applySuccess(res.url, 'Avatar updated')
    else applyError(res.error)
    setBusy(false)
  }

  return { avatarUrl, busy, msg, fileRef, uploadFile, useInstagramAvatar, pickFromMedia }
}
