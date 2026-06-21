'use client'

import { useEffect, useRef, useState } from 'react'
import { reorderMedia, rotateMedia as rotateMediaApi } from '../actions'
import { moveItem } from '@/lib/array'
import { canCompressVideo, compressVideo } from '@/lib/media/compressVideo'
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

type PresignResponse =
  | {
      mode: 'r2'
      clipKey: string
      clipUploadUrl: string
      posterKey: string
      posterUploadUrl: string
    }
  | { mode: 'local' }

async function uploadClip(tabId: string, clip: Blob, poster: Blob | null): Promise<MediaRow> {
  const presignRes = await fetch('/api/upload/video/presign', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ tabId }),
  })
  if (!presignRes.ok) {
    const b = (await presignRes.json().catch(() => ({}))) as { error?: string }
    throw new Error(b.error ?? `upload failed (${presignRes.status})`)
  }
  const presign = (await presignRes.json()) as PresignResponse

  if (presign.mode === 'r2') {
    const put = await fetch(presign.clipUploadUrl, {
      method: 'PUT',
      headers: { 'content-type': 'video/mp4' },
      body: clip,
    })
    if (!put.ok) throw new Error(`upload failed (${put.status})`)
    if (poster) {
      await fetch(presign.posterUploadUrl, {
        method: 'PUT',
        headers: { 'content-type': 'image/webp' },
        body: poster,
      }).catch(() => {})
    }
    const confirmRes = await fetch('/api/upload/video/confirm', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        tabId,
        clipKey: presign.clipKey,
        posterKey: poster ? presign.posterKey : null,
      }),
    })
    if (!confirmRes.ok) {
      const b = (await confirmRes.json().catch(() => ({}))) as { error?: string }
      throw new Error(b.error ?? `upload failed (${confirmRes.status})`)
    }
    return (await confirmRes.json()).media as MediaRow
  }

  const fd = new FormData()
  fd.append('tabId', tabId)
  fd.append('clip', new File([clip], 'clip.mp4', { type: 'video/mp4' }))
  if (poster) fd.append('poster', poster, 'poster.webp')
  const res = await fetch('/api/upload/video', { method: 'POST', body: fd })
  if (!res.ok) {
    const b = (await res.json().catch(() => ({}))) as { error?: string }
    throw new Error(b.error ?? `upload failed (${res.status})`)
  }
  return (await res.json()).media as MediaRow
}

export function useMediaManager(tab: DashTab) {
  const { setTabMedia } = useDashboardStore()
  const mediaUndo = useMediaUndo()
  const [busy, setBusy] = useState(false)
  const [videoStep, setVideoStep] = useState<'compressing' | 'uploading' | null>(null)
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
    let uploaded = 0
    let failed = 0
    const supported = await canCompressVideo()
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        setVideoProgress({ index: i + 1, total: files.length })
        try {
          const check = validateClip(file)
          if (!check.ok) {
            toast.error(`${file.name}: ${check.reason}`)
            patch(i, 'error')
            failed++
            continue
          }
          if (!supported) {
            toast.error(`${file.name}: your browser can't process video. Try Chrome or update Safari.`)
            patch(i, 'error')
            failed++
            continue
          }

          setVideoStep('compressing')
          const clip = await compressVideo(file)
          const poster = await extractPoster(file)

          setVideoStep('uploading')
          const media = await uploadClip(tab.id, clip, poster)
          setTabMedia(tab.id, (prev) => [...prev, toDashMedia(media)])
          patch(i, 'done')
          uploaded++
        } catch (err) {
          toast.error(`${file.name}: ${err instanceof Error ? err.message : 'failed'}`)
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
