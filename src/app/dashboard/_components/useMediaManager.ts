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
  const vidRef = useRef<HTMLInputElement>(null)

  async function onVideo(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setBusy(true)
    let uploaded = 0
    try {
      for (const file of files) {
        try {
          const duration = await probeDuration(file)
          if (duration > MAX_VIDEO_SECONDS + 0.5) {
            toast.error(`${file.name}: too long (max ${MAX_VIDEO_SECONDS}s)`)
            continue
          }
          setVideoStep('optimizing')
          const optimized = await transcodeVideo(file).catch(() => null)
          if (!optimized && file.type !== 'video/mp4' && file.type !== 'video/webm') {
            toast.error(`${file.name}: could not optimize (use mp4 or webm)`)
            continue
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
            toast.error(`${file.name}: ${body.error ?? 'upload failed'}`)
            continue
          }
          const { media } = (await res.json()) as { media: MediaRow }
          setTabMedia(tab.id, (prev) => [...prev, toDashMedia(media)])
          uploaded++
        } catch {
          toast.error(`${file.name}: failed`)
        }
      }
      if (uploaded > 0) toast.success(`${uploaded} video${uploaded > 1 ? 's' : ''} uploaded`)
    } finally {
      setBusy(false)
      setVideoStep(null)
      if (vidRef.current) vidRef.current.value = ''
    }
  }

  function setOrder(ordered: DashMedia[]) {
    setTabMedia(tab.id, () => ordered)
    reorderMedia(
      tab.id,
      ordered.map((m) => m.id),
    )
  }

  function reorder(index: number, dir: -1 | 1) {
    setOrder(moveItem(tab.media, index, dir))
  }

  function removeMedia(id: string) {
    setTabMedia(tab.id, (prev) => prev.filter((m) => m.id !== id))
    deleteMedia(id)
  }

  return { busy, videoStep, vidRef, onVideo, reorder, setOrder, removeMedia }
}
