'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteMedia, reorderMedia } from '../actions'
import { moveItem } from '@/lib/array'
import { extractPoster } from '@/lib/media/poster'
import { MAX_VIDEO_SECONDS, probeDuration, transcodeVideo } from '@/lib/media/transcode'
import type { DashTab } from '@/types/dashboard'

export function useMediaManager(tab: DashTab) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [videoStep, setVideoStep] = useState<'optimizing' | 'uploading' | null>(null)
  const [error, setError] = useState<string | null>(null)
  const imgRef = useRef<HTMLInputElement>(null)
  const vidRef = useRef<HTMLInputElement>(null)

  async function onImages(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) return
    setBusy(true)
    setError(null)
    const fd = new FormData()
    fd.append('tabId', tab.id)
    files.forEach((f) => fd.append('files', f))
    const res = await fetch('/api/upload/image', { method: 'POST', body: fd })
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string }
      setError(body.error ?? 'Upload failed')
    }
    setBusy(false)
    if (imgRef.current) imgRef.current.value = ''
    router.refresh()
  }

  async function onVideo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setBusy(true)
    setError(null)
    try {
      const duration = await probeDuration(file)
      if (duration > MAX_VIDEO_SECONDS + 0.5) {
        setError(`Video is too long (${Math.round(duration)}s). Max ${MAX_VIDEO_SECONDS}s.`)
        return
      }
      setVideoStep('optimizing')
      const optimized = await transcodeVideo(file).catch(() => null)
      if (!optimized && file.type !== 'video/mp4' && file.type !== 'video/webm') {
        setError('Could not optimize this video. Please try an mp4 or webm file.')
        return
      }
      const clip = optimized ? new File([optimized], 'clip.mp4', { type: 'video/mp4' }) : file
      const poster = await extractPoster(clip)
      setVideoStep('uploading')
      const fd = new FormData()
      fd.append('tabId', tab.id)
      fd.append('clip', clip)
      if (poster) fd.append('poster', poster, 'poster.webp')
      const res = await fetch('/api/upload/video', { method: 'POST', body: fd })
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string }
        setError(body.error ?? 'Upload failed')
      }
    } finally {
      setBusy(false)
      setVideoStep(null)
      if (vidRef.current) vidRef.current.value = ''
      router.refresh()
    }
  }

  function reorder(index: number, dir: -1 | 1) {
    const ordered = moveItem(tab.media, index, dir).map((m) => m.id)
    reorderMedia(tab.id, ordered).then(() => router.refresh())
  }

  function removeMedia(id: string) {
    deleteMedia(id).then(() => router.refresh())
  }

  async function onImport() {
    setBusy(true)
    setError(null)
    const res = await fetch('/api/import/instagram', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ tabId: tab.id }),
    })
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string }
      setError(body.error ?? 'Import failed')
    }
    setBusy(false)
    router.refresh()
  }

  return { busy, videoStep, error, imgRef, vidRef, onImages, onVideo, reorder, removeMedia, onImport }
}
