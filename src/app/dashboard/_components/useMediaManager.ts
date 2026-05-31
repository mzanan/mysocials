'use client'

import { useRef, useState } from 'react'
import { deleteMedia, reorderMedia } from '../actions'
import { moveItem } from '@/lib/array'
import { extractPoster } from '@/lib/media/poster'
import { MAX_VIDEO_SECONDS, probeDuration, transcodeVideo } from '@/lib/media/transcode'
import { toast } from '@/lib/toast'
import type { DashMedia, DashTab } from '@/types/dashboard'
import { useDashboardStore } from './DashboardStore'

type MediaRow = { id: string; kind: 'image' | 'video'; url: string; poster_url: string | null }

function toDashMedia(row: MediaRow): DashMedia {
  return { id: row.id, kind: row.kind, url: row.url, posterUrl: row.poster_url }
}

export function useMediaManager(tab: DashTab) {
  const { setTabMedia } = useDashboardStore()
  const [busy, setBusy] = useState(false)
  const [videoStep, setVideoStep] = useState<'optimizing' | 'uploading' | null>(null)
  const [error, setError] = useState<string | null>(null)
  const vidRef = useRef<HTMLInputElement>(null)

  async function onVideo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setBusy(true)
    setError(null)
    try {
      const duration = await probeDuration(file)
      if (duration > MAX_VIDEO_SECONDS + 0.5) {
        const m = `Video is too long (${Math.round(duration)}s). Max ${MAX_VIDEO_SECONDS}s.`
        setError(m)
        toast.error(m)
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
        const m = body.error ?? 'Upload failed'
        setError(m)
        toast.error(m)
        return
      }
      const { media } = (await res.json()) as { media: MediaRow }
      setTabMedia(tab.id, (prev) => [...prev, toDashMedia(media)])
      toast.success('Video uploaded')
    } finally {
      setBusy(false)
      setVideoStep(null)
      if (vidRef.current) vidRef.current.value = ''
    }
  }

  function reorder(index: number, dir: -1 | 1) {
    const ordered = moveItem(tab.media, index, dir)
    setTabMedia(tab.id, () => ordered)
    reorderMedia(
      tab.id,
      ordered.map((m) => m.id),
    )
  }

  function removeMedia(id: string) {
    setTabMedia(tab.id, (prev) => prev.filter((m) => m.id !== id))
    deleteMedia(id)
  }

  return { busy, videoStep, error, vidRef, onVideo, reorder, removeMedia }
}
