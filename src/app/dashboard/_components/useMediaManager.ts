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

type VideoStatus = 'queued' | 'compressing' | 'uploading' | 'done' | 'error'
export type VideoUploadItem = {
  id: string
  previewUrl: string
  status: VideoStatus
  progress?: number
}

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
  const [videoItems, setVideoItems] = useState<VideoUploadItem[]>([])
  const vidRef = useRef<HTMLInputElement>(null)
  const videoUrlsRef = useRef<string[]>([])
  const queueRef = useRef<{ id: string; file: File }[]>([])
  const runningRef = useRef(false)

  useEffect(() => () => videoUrlsRef.current.forEach(URL.revokeObjectURL), [])

  function patchItem(id: string, fields: Partial<VideoUploadItem>) {
    setVideoItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...fields } : it)))
  }

  async function drain() {
    if (runningRef.current) return
    runningRef.current = true
    setBusy(true)
    const canCompress = await canCompressVideo()
    const stats = { uploaded: 0, failed: 0 }
    try {
      // Outer loop re-checks the queue so clips added during the final upload still run.
      while (queueRef.current.length) {
        let pendingUpload: Promise<void> = Promise.resolve()
        while (queueRef.current.length) {
          const task = queueRef.current.shift()!
          const check = validateClip(task.file)
          if (!check.ok) {
            toast.error(`${task.file.name}: ${check.reason}`)
            patchItem(task.id, { status: 'error' })
            stats.failed++
            continue
          }
          if (!canCompress) {
            toast.error(`${task.file.name}: your browser can't process video. Try Chrome or update Safari.`)
            patchItem(task.id, { status: 'error' })
            stats.failed++
            continue
          }

          let clip: Blob
          let poster: Blob | null
          try {
            patchItem(task.id, { status: 'compressing', progress: 0 })
            clip = await compressVideo(task.file, (p) => patchItem(task.id, { progress: p }))
            poster = await extractPoster(clip)
          } catch (err) {
            toast.error(`${task.file.name}: ${err instanceof Error ? err.message : 'failed'}`)
            patchItem(task.id, { status: 'error' })
            stats.failed++
            continue
          }

          // Pipeline: upload this clip while the next one transcodes (one upload in flight).
          patchItem(task.id, { status: 'uploading', progress: undefined })
          const prior = pendingUpload
          const clipToSend = clip
          const posterToSend = poster
          pendingUpload = (async () => {
            await prior
            try {
              const media = await uploadClip(tab.id, clipToSend, posterToSend)
              setTabMedia(tab.id, (prev) => [...prev, toDashMedia(media)])
              patchItem(task.id, { status: 'done' })
              stats.uploaded++
            } catch (err) {
              toast.error(`${task.file.name}: ${err instanceof Error ? err.message : 'failed'}`)
              patchItem(task.id, { status: 'error' })
              stats.failed++
            }
          })()
        }
        await pendingUpload
      }
    } finally {
      runningRef.current = false
      setBusy(false)
      if (stats.uploaded > 0) {
        toast.success(`${stats.uploaded} video${stats.uploaded > 1 ? 's' : ''} uploaded`)
      }
      if (stats.failed === 0) {
        videoUrlsRef.current.forEach(URL.revokeObjectURL)
        videoUrlsRef.current = []
        setVideoItems([])
      } else {
        setVideoItems((prev) => prev.filter((it) => it.status === 'error'))
      }
    }
  }

  function onVideo(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (vidRef.current) vidRef.current.value = ''
    if (!files.length) return
    const additions = files.map((file) => {
      const id = crypto.randomUUID()
      const previewUrl = URL.createObjectURL(file)
      videoUrlsRef.current.push(previewUrl)
      return { id, file, previewUrl }
    })
    setVideoItems((prev) => [
      ...prev,
      ...additions.map((a) => ({
        id: a.id,
        previewUrl: a.previewUrl,
        status: 'queued' as const,
      })),
    ])
    queueRef.current.push(...additions.map((a) => ({ id: a.id, file: a.file })))
    void drain()
  }

  function setOrder(ordered: DashMedia[]) {
    const snapshot = tab.media
    setTabMedia(tab.id, () => ordered)
    void (async () => {
      const res = await reorderMedia(
        tab.id,
        ordered.map((m) => m.id),
      )
      if (!res.ok) {
        setTabMedia(tab.id, () => snapshot)
        toast.error(res.error ?? 'Could not save the new order')
      }
    })()
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
    videoItems,
    vidRef,
    onVideo,
    reorder,
    setOrder,
    removeMedia,
    rotateMedia,
  }
}
