'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ChevronUp, ChevronDown, Trash2, Plus, Upload, Instagram } from 'lucide-react'
import {
  createTab,
  deleteMedia,
  deleteTab,
  reorderMedia,
  reorderTabs,
  updateTab,
} from '../actions'
import { extractPoster } from './poster'
import { MAX_VIDEO_SECONDS, probeDuration, transcodeVideo } from './transcode'
import { Card, btnCls, btnPrimaryCls, inputCls } from './ui'
import type { DashTab, DashboardData } from './types'

function move<T>(arr: T[], index: number, dir: -1 | 1): T[] {
  const next = [...arr]
  const target = index + dir
  if (target < 0 || target >= next.length) return next
  ;[next[index], next[target]] = [next[target], next[index]]
  return next
}

function MediaManager({
  tab,
  instagramEnabled,
  igConnected,
}: {
  tab: DashTab
  instagramEnabled: boolean
  igConnected: boolean
}) {
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
      const clip = optimized
        ? new File([optimized], 'clip.mp4', { type: 'video/mp4' })
        : file
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
    const ordered = move(tab.media, index, dir).map((m) => m.id)
    reorderMedia(tab.id, ordered).then(() => router.refresh())
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

  return (
    <div className="mt-3">
      {tab.media.length > 0 && (
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
          {tab.media.map((m, i) => (
            <div
              key={m.id}
              className="group relative aspect-square overflow-hidden rounded-lg border border-white/10 bg-white/[0.04]"
            >
              <Image
                src={m.posterUrl ?? m.url}
                alt=""
                fill
                className="object-cover"
                sizes="120px"
                unoptimized={m.kind === 'video' && !m.posterUrl}
              />
              {m.kind === 'video' && (
                <span className="absolute left-1 top-1 rounded bg-black/60 px-1 text-[10px] text-white">▶</span>
              )}
              <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/50 p-1 opacity-0 transition group-hover:opacity-100">
                <button onClick={() => reorder(i, -1)} className="text-white/70 hover:text-white" aria-label="Move left">
                  <ChevronUp size={14} className="-rotate-90" />
                </button>
                <button
                  onClick={() => deleteMedia(m.id).then(() => router.refresh())}
                  className="text-red-300 hover:text-red-200"
                  aria-label="Delete"
                >
                  <Trash2 size={14} />
                </button>
                <button onClick={() => reorder(i, 1)} className="text-white/70 hover:text-white" aria-label="Move right">
                  <ChevronDown size={14} className="-rotate-90" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="mt-3 flex gap-2">
        {tab.type === 'video' ? (
          <>
            <input ref={vidRef} type="file" accept="video/*" hidden onChange={onVideo} />
            <button className={btnCls} disabled={busy} onClick={() => vidRef.current?.click()}>
              <Upload size={14} />{' '}
              {videoStep === 'optimizing'
                ? 'Optimizing…'
                : videoStep === 'uploading'
                  ? 'Uploading…'
                  : 'Add video'}
            </button>
          </>
        ) : (
          <>
            <input ref={imgRef} type="file" accept="image/*" multiple hidden onChange={onImages} />
            <button className={btnCls} disabled={busy} onClick={() => imgRef.current?.click()}>
              <Upload size={14} /> {busy ? 'Uploading…' : 'Add photos'}
            </button>
            {instagramEnabled &&
              (igConnected ? (
                <button className={btnCls} disabled={busy} onClick={onImport}>
                  <Instagram size={14} /> {busy ? 'Importing…' : 'Import from Instagram'}
                </button>
              ) : (
                <a className={btnCls} href="/api/import/instagram/connect">
                  <Instagram size={14} /> Connect Instagram
                </a>
              ))}
          </>
        )}
      </div>
      {error && <p className="mt-2 text-xs text-red-300">{error}</p>}
    </div>
  )
}

function TabRow({
  tab,
  index,
  total,
  onReorder,
  instagramEnabled,
  igConnected,
}: {
  tab: DashTab
  index: number
  total: number
  onReorder: (index: number, dir: -1 | 1) => void
  instagramEnabled: boolean
  igConnected: boolean
}) {
  const router = useRouter()
  const [label, setLabel] = useState(tab.label)
  const [type, setType] = useState(tab.type)
  const [pending, startTransition] = useTransition()

  function save() {
    startTransition(async () => {
      await updateTab(tab.id, { label, type })
      router.refresh()
    })
  }

  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-3">
      <div className="flex flex-wrap items-center gap-2">
        <input value={label} onChange={(e) => setLabel(e.target.value)} onBlur={save} className={`${inputCls} h-9 w-40`} />
        <select
          value={type}
          onChange={(e) => setType(e.target.value as 'grid' | 'video')}
          onBlur={save}
          className={`${inputCls} h-9 w-28`}
        >
          <option value="grid">Photo grid</option>
          <option value="video">Video</option>
        </select>
        <div className="ml-auto flex items-center gap-1">
          <button className={btnCls} disabled={index === 0} onClick={() => onReorder(index, -1)} aria-label="Move up">
            <ChevronUp size={15} />
          </button>
          <button className={btnCls} disabled={index === total - 1} onClick={() => onReorder(index, 1)} aria-label="Move down">
            <ChevronDown size={15} />
          </button>
          <button
            className={`${btnCls} text-red-300`}
            onClick={() => deleteTab(tab.id).then(() => router.refresh())}
            aria-label="Delete tab"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
      {pending && <span className="text-xs text-white/40">Saving…</span>}
      <MediaManager tab={tab} instagramEnabled={instagramEnabled} igConnected={igConnected} />
    </div>
  )
}

export function TabsSection({
  data,
  instagramEnabled,
}: {
  data: DashboardData
  instagramEnabled: boolean
}) {
  const router = useRouter()
  const [newLabel, setNewLabel] = useState('')
  const [newType, setNewType] = useState<'grid' | 'video'>('grid')
  const [pending, startTransition] = useTransition()

  function add() {
    if (!newLabel.trim()) return
    startTransition(async () => {
      await createTab({ label: newLabel.trim(), type: newType })
      setNewLabel('')
      router.refresh()
    })
  }

  function handleReorder(index: number, dir: -1 | 1) {
    const ordered = move(data.tabs, index, dir).map((t) => t.id)
    reorderTabs(ordered).then(() => router.refresh())
  }

  return (
    <Card title="Tabs & media" desc="Each tab is a background — a photo grid or a video showcase.">
      <div className="flex flex-col gap-3">
        {data.tabs.map((tab, i) => (
          <TabRow
            key={tab.id}
            tab={tab}
            index={i}
            total={data.tabs.length}
            onReorder={handleReorder}
            instagramEnabled={instagramEnabled}
            igConnected={data.instagramConnected}
          />
        ))}
        {data.tabs.length === 0 && <p className="text-sm text-white/45">No tabs yet. Add one below.</p>}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/[0.06] pt-4">
        <input
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          placeholder="New tab name"
          className={`${inputCls} h-9 w-44`}
        />
        <select
          value={newType}
          onChange={(e) => setNewType(e.target.value as 'grid' | 'video')}
          className={`${inputCls} h-9 w-28`}
        >
          <option value="grid">Photo grid</option>
          <option value="video">Video</option>
        </select>
        <button className={btnPrimaryCls} onClick={add} disabled={pending}>
          <Plus size={15} /> Add tab
        </button>
      </div>
    </Card>
  )
}
