'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ChevronUp, ChevronDown, Trash2, Plus, Upload, Instagram } from 'lucide-react'
import { createTab, deleteTab, reorderTabs, updateTab } from '../actions'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input, inputBase } from '@/components/ui/input'
import { moveItem } from '@/lib/array'
import { cn } from '@/lib/utils'
import type { DashTab, DashboardData } from '@/types/dashboard'
import { useMediaManager } from './useMediaManager'

function MediaManager({
  tab,
  instagramEnabled,
  igConnected,
}: {
  tab: DashTab
  instagramEnabled: boolean
  igConnected: boolean
}) {
  const { busy, videoStep, error, imgRef, vidRef, onImages, onVideo, reorder, removeMedia, onImport } =
    useMediaManager(tab)

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
                  onClick={() => removeMedia(m.id)}
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
            <Button variant="glass" disabled={busy} onClick={() => vidRef.current?.click()}>
              <Upload size={14} />{' '}
              {videoStep === 'optimizing'
                ? 'Optimizing…'
                : videoStep === 'uploading'
                  ? 'Uploading…'
                  : 'Add video'}
            </Button>
          </>
        ) : (
          <>
            <input ref={imgRef} type="file" accept="image/*" multiple hidden onChange={onImages} />
            <Button variant="glass" disabled={busy} onClick={() => imgRef.current?.click()}>
              <Upload size={14} /> {busy ? 'Uploading…' : 'Add photos'}
            </Button>
            {instagramEnabled &&
              (igConnected ? (
                <Button variant="glass" disabled={busy} onClick={onImport}>
                  <Instagram size={14} /> {busy ? 'Importing…' : 'Import from Instagram'}
                </Button>
              ) : (
                <Button
                  variant="glass"
                  onClick={() => {
                    window.location.href = '/api/import/instagram/connect'
                  }}
                >
                  <Instagram size={14} /> Connect Instagram
                </Button>
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
        <Input value={label} onChange={(e) => setLabel(e.target.value)} onBlur={save} className="h-9 w-40" />
        <select
          value={type}
          onChange={(e) => setType(e.target.value as 'grid' | 'video')}
          onBlur={save}
          className={cn(inputBase, 'h-9 w-28')}
        >
          <option value="grid">Photo grid</option>
          <option value="video">Video</option>
        </select>
        <div className="ml-auto flex items-center gap-1">
          <Button variant="glass" disabled={index === 0} onClick={() => onReorder(index, -1)} aria-label="Move up">
            <ChevronUp size={15} />
          </Button>
          <Button variant="glass" disabled={index === total - 1} onClick={() => onReorder(index, 1)} aria-label="Move down">
            <ChevronDown size={15} />
          </Button>
          <Button
            variant="glass"
            className="text-red-300"
            onClick={() => deleteTab(tab.id).then(() => router.refresh())}
            aria-label="Delete tab"
          >
            <Trash2 size={15} />
          </Button>
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
    const ordered = moveItem(data.tabs, index, dir).map((t) => t.id)
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
        <Input
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          placeholder="New tab name"
          className="h-9 w-44"
        />
        <select
          value={newType}
          onChange={(e) => setNewType(e.target.value as 'grid' | 'video')}
          className={cn(inputBase, 'h-9 w-28')}
        >
          <option value="grid">Photo grid</option>
          <option value="video">Video</option>
        </select>
        <Button variant="glassPrimary" onClick={add} disabled={pending}>
          <Plus size={15} /> Add tab
        </Button>
      </div>
    </Card>
  )
}
