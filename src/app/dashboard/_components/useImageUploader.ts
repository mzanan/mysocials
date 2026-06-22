'use client'

import { useEffect, useRef, useState } from 'react'
import { compressImage } from '@/lib/media/compressImage'
import { toast } from '@/lib/toast'
import type { DashMedia, DashTab } from '@/types/dashboard'
import { useDashboardStore } from './DashboardStore'

type ItemStatus = 'pending' | 'uploading' | 'done' | 'error'
export type UploadItem = { file: File; status: ItemStatus; error?: string; previewUrl: string }

type MediaRow = { id: string; kind: 'image' | 'video'; url: string; poster_url: string | null }

export function useImageUploader(tab: DashTab) {
  const { setTabMedia } = useDashboardStore()
  const [items, setItems] = useState<UploadItem[]>([])
  const [active, setActive] = useState(false)
  const urlsRef = useRef<string[]>([])

  useEffect(() => () => urlsRef.current.forEach(URL.revokeObjectURL), [])

  function patch(index: number, fields: Partial<UploadItem>) {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, ...fields } : it)))
  }

  async function uploadOne(file: File): Promise<{ ok: true } | { ok: false; error: string }> {
    const toSend = await compressImage(file).catch((err) => {
      console.warn('[upload/image] compress failed, sending original', file.name, err)
      return file
    })
    const fd = new FormData()
    fd.append('tabId', tab.id)
    fd.append('files', toSend)
    const res = await fetch('/api/upload/image', { method: 'POST', body: fd })
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string }
      return { ok: false, error: body.error ?? `Upload failed (${res.status})` }
    }
    const { media } = (await res.json()) as { media: MediaRow[] }
    const fresh: DashMedia[] = media.map((m) => ({
      id: m.id,
      kind: m.kind,
      url: m.url,
      posterUrl: m.poster_url,
    }))
    setTabMedia(tab.id, (prev) => [...prev, ...fresh])
    return { ok: true }
  }

  async function process(targets: { index: number; file: File }[]) {
    setActive(true)
    let ok = 0
    let fail = 0
    let cursor = 0
    const errors = new Set<string>()
    async function worker() {
      while (cursor < targets.length) {
        const { index, file } = targets[cursor++]
        patch(index, { status: 'uploading', error: undefined })
        const r = await uploadOne(file)
        if (r.ok) ok += 1
        else {
          fail += 1
          errors.add(r.error)
        }
        patch(index, r.ok ? { status: 'done' } : { status: 'error', error: r.error })
      }
    }
    const CONCURRENCY = 3
    await Promise.all(
      Array.from({ length: Math.min(CONCURRENCY, targets.length) }, worker),
    )
    setActive(false)
    if (fail === 0) {
      toast.success(`${ok} photo${ok === 1 ? '' : 's'} uploaded`)
      clear()
    } else {
      const detail = [...errors][0] ?? 'Upload failed'
      console.error('[upload/image] failures', { ok, fail, errors: [...errors] })
      toast.error(ok > 0 ? `${ok} uploaded · ${fail} failed — ${detail}` : detail)
    }
  }

  function enqueue(files: File[]) {
    if (files.length === 0) return
    const next: UploadItem[] = files.map((file) => {
      const previewUrl = URL.createObjectURL(file)
      urlsRef.current.push(previewUrl)
      return { file, status: 'pending', previewUrl }
    })
    setItems(next)
    void process(next.map((it, index) => ({ index, file: it.file })))
  }

  function retry() {
    const targets = items
      .map((it, index) => ({ it, index }))
      .filter(({ it }) => it.status === 'error')
      .map(({ it, index }) => ({ index, file: it.file }))
    if (targets.length === 0) return
    setItems((prev) =>
      prev.map((it) => (it.status === 'error' ? { ...it, status: 'pending', error: undefined } : it)),
    )
    void process(targets)
  }

  function clear() {
    urlsRef.current.forEach(URL.revokeObjectURL)
    urlsRef.current = []
    setItems([])
  }

  const done = items.filter((it) => it.status === 'done').length
  const failed = items.filter((it) => it.status === 'error')

  return { items, active, done, failed, total: items.length, enqueue, retry, clear }
}
