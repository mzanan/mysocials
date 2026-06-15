'use client'

import { useRef, useState, useTransition } from 'react'
import Image from 'next/image'
import { ChevronUp, ChevronDown, Trash2, Plus, Upload, Instagram, RotateCcw, X } from 'lucide-react'
import { createTab, deleteTab, reorderTabs, updateTab } from '../actions'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Segmented } from '@/components/ui/segmented'
import { moveItem } from '@/lib/array'
import { toast } from '@/lib/toast'
import type { DashTab } from '@/types/dashboard'
import { useDashboardStore } from './DashboardStore'
import { useImageUploader } from './useImageUploader'
import { useInstagramImport } from './useInstagramImport'
import { useMediaManager } from './useMediaManager'

const GRID_SIZES = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
] as const

function MediaManager({
  tab,
  instagramEnabled,
  igConnected,
}: {
  tab: DashTab
  instagramEnabled: boolean
  igConnected: boolean
}) {
  const { busy, videoStep, error, vidRef, onVideo, reorder, removeMedia } = useMediaManager(tab)
  const up = useImageUploader(tab)
  const imgRef = useRef<HTMLInputElement>(null)
  const { importing, progress, start: onImport } = useInstagramImport(tab.id)

  return (
    <div className="mt-3">
      {tab.media.length > 0 && (
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
          {tab.media.map((m, i) => (
            <div
              key={m.id}
              className="group relative aspect-square overflow-hidden rounded-lg border border-hairline bg-surface-subtle"
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
                <span className="absolute left-1 top-1 rounded bg-black/60 px-1 text-[10px] text-fg">▶</span>
              )}
              <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/50 p-1 opacity-0 transition group-hover:opacity-100">
                <Button variant="overlay" size="iconSm" onClick={() => reorder(i, -1)} aria-label="Move left">
                  <ChevronUp size={14} className="-rotate-90" />
                </Button>
                <Button variant="danger" size="iconSm" onClick={() => removeMedia(m.id)} aria-label="Delete">
                  <Trash2 size={14} />
                </Button>
                <Button variant="overlay" size="iconSm" onClick={() => reorder(i, 1)} aria-label="Move right">
                  <ChevronDown size={14} className="-rotate-90" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="mt-3 flex flex-wrap gap-2">
        {tab.type === 'video' ? (
          <>
            <input ref={vidRef} type="file" accept="video/*" hidden onChange={onVideo} />
            <Button variant="secondary" disabled={busy} onClick={() => vidRef.current?.click()}>
              <Upload size={14} />{' '}
              {videoStep === 'optimizing' ? 'Optimizing…' : videoStep === 'uploading' ? 'Uploading…' : 'Add video'}
            </Button>
          </>
        ) : (
          <>
            <input
              ref={imgRef}
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={(e) => {
                up.enqueue(Array.from(e.target.files ?? []))
                e.target.value = ''
              }}
            />
            <Button variant="secondary" disabled={up.active} onClick={() => imgRef.current?.click()}>
              <Upload size={14} /> {up.active ? `Uploading ${up.done + 1}/${up.total}…` : 'Add photos'}
            </Button>
            {instagramEnabled &&
              (igConnected ? (
                <Button variant="secondary" disabled={importing} onClick={onImport}>
                  <Instagram size={14} />{' '}
                  {importing
                    ? progress && progress.total > 0
                      ? `Importing ${progress.imported}/${progress.total}…`
                      : 'Fetching from Instagram…'
                    : 'Import from Instagram'}
                </Button>
              ) : (
                <Button
                  variant="secondary"
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

      {instagramEnabled && tab.type !== 'video' && (
        <p className="mt-2 text-xs text-fg-subtle">
          Instagram import needs a Professional or Creator account.
        </p>
      )}

      {!up.active && up.total > 0 && (
        <div className="mt-2 flex flex-col gap-1.5 text-xs">
          <div className="flex items-center gap-2 text-fg-subtle">
            <span>
              {up.done} uploaded
              {up.failed.length > 0 && ` · ${up.failed.length} failed`}
            </span>
            {up.failed.length > 0 && (
              <Button variant="secondary" className="h-7 px-2 text-xs" onClick={up.retry}>
                <RotateCcw size={12} /> Retry failed ({up.failed.length})
              </Button>
            )}
            <Button variant="ghost" size="iconSm" onClick={up.clear} aria-label="Dismiss">
              <X size={13} />
            </Button>
          </div>
          {up.failed.map((it, i) => (
            <p key={i} className="text-danger">
              {it.file.name}: {it.error}
            </p>
          ))}
        </div>
      )}
      {error && <p className="mt-2 text-xs text-danger">{error}</p>}
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
  const { setTabs, patchTab } = useDashboardStore()
  const [label, setLabel] = useState(tab.label)
  const [type, setType] = useState(tab.type)
  const [gridSize, setGridSize] = useState(tab.gridSize)
  const [pending, startTransition] = useTransition()

  function save(next?: { gridSize?: 'small' | 'medium' | 'large' }) {
    const nextGridSize = next?.gridSize ?? gridSize
    startTransition(async () => {
      const res = await updateTab(tab.id, { label, type, gridSize: nextGridSize })
      if (res.ok) patchTab(tab.id, { label, type, gridSize: nextGridSize })
    })
  }

  function remove() {
    setTabs((prev) => prev.filter((t) => t.id !== tab.id))
    deleteTab(tab.id)
    toast.success(`Tab “${tab.label}” deleted`)
  }

  return (
    <div className="rounded-xl border border-hairline-subtle bg-surface-subtle p-3">
      <div className="flex flex-wrap items-center gap-2">
        <Input value={label} onChange={(e) => setLabel(e.target.value)} onBlur={() => save()} className="h-9 w-40" />
        <Select
          value={type}
          onChange={(e) => setType(e.target.value as 'grid' | 'video')}
          onBlur={() => save()}
          className="h-9 w-28"
        >
          <option value="grid">Photo grid</option>
          <option value="video">Video</option>
        </Select>
        {type === 'grid' && (
          <Segmented
            size="sm"
            className="h-9"
            aria-label="Grid size"
            value={gridSize}
            onChange={(v) => {
              setGridSize(v)
              save({ gridSize: v })
            }}
            options={GRID_SIZES}
          />
        )}
        <div className="ml-auto flex items-center gap-1">
          <Button variant="ghost" size="icon" disabled={index === 0} onClick={() => onReorder(index, -1)} aria-label="Move up">
            <ChevronUp size={15} />
          </Button>
          <Button variant="ghost" size="icon" disabled={index === total - 1} onClick={() => onReorder(index, 1)} aria-label="Move down">
            <ChevronDown size={15} />
          </Button>
          <Button variant="danger" size="icon" onClick={remove} aria-label="Delete tab">
            <Trash2 size={15} />
          </Button>
        </div>
      </div>
      {pending && <span className="text-xs text-fg-subtle">Saving…</span>}
      <MediaManager tab={tab} instagramEnabled={instagramEnabled} igConnected={igConnected} />
    </div>
  )
}

export function TabsSection({
  instagramEnabled,
  igConnected,
}: {
  instagramEnabled: boolean
  igConnected: boolean
}) {
  const { tabs, setTabs } = useDashboardStore()
  const [newLabel, setNewLabel] = useState('')
  const [newType, setNewType] = useState<'grid' | 'video'>('grid')
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function add() {
    if (!newLabel.trim()) return
    setError(null)
    startTransition(async () => {
      const res = await createTab({ label: newLabel.trim(), type: newType, gridSize: 'medium' })
      if (!res.ok) {
        setError(res.error)
        toast.error(res.error)
        return
      }
      setTabs((prev) => [...prev, res.tab])
      setNewLabel('')
      toast.success(`Tab “${res.tab.label}” created`)
    })
  }

  function handleReorder(index: number, dir: -1 | 1) {
    const ordered = moveItem(tabs, index, dir)
    setTabs(ordered)
    reorderTabs(ordered.map((t) => t.id))
  }

  return (
    <Card title="Tabs & media" desc="Each tab is a background — a photo grid or a video showcase.">
      <div className="flex flex-col gap-3">
        {tabs.map((tab, i) => (
          <TabRow
            key={tab.id}
            tab={tab}
            index={i}
            total={tabs.length}
            onReorder={handleReorder}
            instagramEnabled={instagramEnabled}
            igConnected={igConnected}
          />
        ))}
        {tabs.length === 0 && <p className="text-sm text-fg-subtle">No tabs yet. Add one below.</p>}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-hairline-subtle pt-4">
        <Input
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          placeholder="New tab name"
          className="h-9 w-44"
        />
        <Select
          value={newType}
          onChange={(e) => setNewType(e.target.value as 'grid' | 'video')}
          className="h-9 w-28"
        >
          <option value="grid">Photo grid</option>
          <option value="video">Video</option>
        </Select>
        <Button variant="secondary" onClick={add} disabled={pending}>
          <Plus size={15} /> Add tab
        </Button>
      </div>
      {error && <p className="mt-2 text-sm text-danger">{error}</p>}
    </Card>
  )
}
