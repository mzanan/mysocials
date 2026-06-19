'use client'

import { useEffect, useRef, useState } from 'react'
import { reorderMedia, rotateMedia as rotateMediaApi } from '../actions'
import { moveItem } from '@/lib/array'
import { extractPoster } from '@/lib/media/poster'
import { validateClip } from '@/lib/media/video'
import { toast } from '@/lib/toast'
import type { DashMedia, DashTab } from '@/types/dashboard'
import { useDashboardStore } from './DashboardStore'
import { useMediaUndo } from './MediaUndoProvider'

type MediaRow = { id: string; kind: 'image' | 'video'; url: string; poster_url: string | null }

type VideoStatus = 'uploading' | 'done' | 'error'
export type VideoUploadItem = { previewUrl: string; status: VideoStatus }

function toDashMedia(row: MediaRow): DashMedia {
  return { id: row.id, kind: row.kind, url: row.url, posterUrl: row.poster_url }
}

export function useMediaManager(tab: DashTab) {
  const { setTabMedia } = useDashboardStore()
  const mediaUndo = useMediaUndo()
  const [busy, setBusy] = useState(false)
  const [videoStep, setVideoStep] = useState<'uploading' | null>(null)
  const [videoProgress, setVideoProgress] = useState<{ index: number; total: number } | null>(null)
  const [videoItems, setVideoItems] = useState<VideoUploadItem[]>([])
  const vidRef = useRef<HTMLInputElement>(null)
  const videoUrlsRef = useRef<string[]>([])

  useEffect(() => () => videoUrlsRef.current.forEach(URL.revokeObjectURL), [])

  async function onVideo(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    videoUrlsRef.current.forEach(URL.revokeObjectURL)
    const urls = files.map((f) => URL.createObjectURL(f))
    videoUrlsRef.current = urls
    setVideoItems(files.map((_, i) => ({ previewUrl: urls[i], status: 'uploading' })))

    const patch = (i: number, status: VideoStatus) =>
      setVideoItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, status } : it)))

    setBusy(true)
    setVideoStep('uploading')
    let uploaded = 0
    let failed = 0
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        setVideoProgress({ index: i + 1, total: files.length })
        try {
          const check = await validateClip(file)
          if (!check.ok) {
            toast.error(`${file.name}: ${check.reason}`)
            patch(i, 'error')
            failed++
            continue
          }
          const poster = await extractPoster(file)
          const fd = new FormData()
          fd.append('tabId', tab.id)
          fd.append('clip', file)
          if (poster) fd.append('poster', poster, 'poster.webp')
          const res = await fetch('/api/upload/video', { method: 'POST', body: fd })
          if (!res.ok) {
            const body = (await res.json().catch(() => ({}))) as { error?: string }
            toast.error(`${file.name}: ${body.error ?? `upload failed (${res.status})`}`)
            patch(i, 'error')
            failed++
            continue
          }
          const { media } = (await res.json()) as { media: MediaRow }
          setTabMedia(tab.id, (prev) => [...prev, toDashMedia(media)])
          patch(i, 'done')
          uploaded++
        } catch {
          toast.error(`${file.name}: failed`)
          patch(i, 'error')
          failed++
        }
      }
      if (uploaded > 0) toast.success(`${uploaded} video${uploaded > 1 ? 's' : ''} uploaded`)
    } finally {
      setBusy(false)
      setVideoStep(null)
      setVideoProgress(null)
      if (vidRef.current) vidRef.current.value = ''
      if (failed === 0) {
        videoUrlsRef.current.forEach(URL.revokeObjectURL)
        videoUrlsRef.current = []
        setVideoItems([])
      }
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
    const index = tab.media.findIndex((m) => m.id === id)
    const item = tab.media[index]
    if (!item) return
    mediaUndo.remove(tab.id, item, index)
  }

  async function rotateMedia(id: string) {
    const res = await rotateMediaApi(id)
    if (!res.ok) {
      toast.error(res.error)
      return
    }
    setTabMedia(tab.id, (prev) => prev.map((m) => (m.id === id ? { ...m, url: res.url } : m)))
  }

  return {
    busy,
    videoStep,
    videoProgress,
    videoItems,
    vidRef,
    onVideo,
    reorder,
    setOrder,
    removeMedia,
    rotateMedia,
  }
}
