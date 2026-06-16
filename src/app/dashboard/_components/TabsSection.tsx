'use client'

import { useRef, useState, useTransition } from 'react'
import Image from 'next/image'
import { ChevronUp, ChevronDown, Trash2, Plus, Upload, Instagram, RotateCcw, X, GripVertical } from 'lucide-react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, useSortable, arrayMove, rectSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { createTab, deleteTab, reorderTabs, updateTab } from '../actions'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { moveItem } from '@/lib/array'
import { cn } from '@/lib/utils'
import { toast } from '@/lib/toast'
import type { DashMedia, DashTab } from '@/types/dashboard'
import { useDashboardStore } from './DashboardStore'
import { useImageUploader } from './useImageUploader'
import { useInstagramImport } from './useInstagramImport'
import { InstagramConnectButton } from './InstagramConnectButton'
import { useMediaManager } from './useMediaManager'
import { TabLinks } from './TabLinks'

function SortableMedia({
  m,
  index,
  onReorder,
  onRemove,
}: {
  m: DashMedia
  index: number
  onReorder: (index: number, dir: -1 | 1) => void
  onRemove: (id: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: m.id })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        'group relative aspect-square overflow-hidden rounded-lg border border-hairline bg-surface-subtle',
        isDragging && 'z-20 opacity-80',
      )}
    >
      <Image
        src={m.posterUrl ?? m.url}
        alt=""
        fill
        className="object-cover"
        sizes="120px"
        priority={index === 0}
        unoptimized={m.kind === 'video' && !m.posterUrl}
      />
      <button
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder"
        className="absolute left-1 top-1 z-10 grid h-7 w-7 cursor-grab touch-none place-items-center rounded-md bg-black/50 text-white opacity-100 transition active:cursor-grabbing sm:opacity-0 sm:group-hover:opacity-100"
      >
        <GripVertical size={14} />
      </button>
      {m.kind === 'video' && (
        <span className="absolute right-1 top-1 rounded bg-black/60 px-1 text-[10px] text-fg">▶</span>
      )}
      <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/50 p-1 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
        <Button variant="overlay" size="iconSm" onClick={() => onReorder(index, -1)} aria-label="Move left">
          <ChevronUp size={14} className="-rotate-90" />
        </Button>
        <Button variant="danger" size="iconSm" onClick={() => onRemove(m.id)} aria-label="Delete">
          <Trash2 size={14} />
        </Button>
        <Button variant="overlay" size="iconSm" onClick={() => onReorder(index, 1)} aria-label="Move right">
          <ChevronDown size={14} className="-rotate-90" />
        </Button>
      </div>
    </div>
  )
}

function MediaManager({
  tab,
  instagramEnabled,
  igUsesUsername,
  igConnected,
}: {
  tab: DashTab
  instagramEnabled: boolean
  igUsesUsername: boolean
  igConnected: boolean
}) {
  const { busy, videoStep, error, vidRef, onVideo, reorder, setOrder, removeMedia } = useMediaManager(tab)
  const up = useImageUploader(tab)
  const imgRef = useRef<HTMLInputElement>(null)
  const { importing, progress, start: onImport } = useInstagramImport(tab.id)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e
    if (!over || active.id === over.id) return
    const oldIndex = tab.media.findIndex((m) => m.id === active.id)
    const newIndex = tab.media.findIndex((m) => m.id === over.id)
    if (oldIndex < 0 || newIndex < 0) return
    setOrder(arrayMove(tab.media, oldIndex, newIndex))
  }

  return (
    <div className="mt-3">
      {tab.media.length > 0 && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={tab.media.map((m) => m.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
              {tab.media.map((m, i) => (
                <SortableMedia
                  key={m.id}
                  m={m}
                  index={i}
                  onReorder={reorder}
                  onRemove={removeMedia}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        {tab.type === 'video' ? (
          <>
            <input ref={vidRef} type="file" accept="video/*" hidden onChange={onVideo} />
            <Button variant="secondary" disabled={busy} onClick={() => vidRef.current?.click()} className="w-full sm:w-auto">
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
            <Button variant="secondary" disabled={up.active} onClick={() => imgRef.current?.click()} className="w-full sm:w-auto">
              <Upload size={14} /> {up.active ? `Uploading ${up.done + 1}/${up.total}…` : 'Add photos'}
            </Button>
            {instagramEnabled &&
              (importing ? (
                <Button variant="secondary" disabled className="w-full sm:w-auto">
                  <Instagram size={14} />{' '}
                  {progress && progress.total > 0
                    ? `Importing ${progress.imported}/${progress.total}…`
                    : 'Fetching from Instagram…'}
                </Button>
              ) : igConnected ? (
                <Button variant="secondary" onClick={onImport} className="w-full sm:w-auto">
                  <Instagram size={14} /> Import from Instagram
                </Button>
              ) : (
                <InstagramConnectButton igUsesUsername={igUsesUsername} onConnected={onImport} />
              ))}
          </>
        )}
      </div>

      {instagramEnabled && tab.type !== 'video' && (
        <p className="mt-2 text-xs text-fg-subtle">
          {igUsesUsername
            ? 'Imports photos from any public Instagram profile.'
            : 'Instagram import needs a Professional or Creator account.'}
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
  igUsesUsername,
  igConnected,
  igUsername,
}: {
  tab: DashTab
  index: number
  total: number
  onReorder: (index: number, dir: -1 | 1) => void
  instagramEnabled: boolean
  igUsesUsername: boolean
  igConnected: boolean
  igUsername: string | null
}) {
  const { setTabs, patchTab } = useDashboardStore()
  const [label, setLabel] = useState(tab.label)
  const [type, setType] = useState(tab.type)
  const [pending, startTransition] = useTransition()

  function save() {
    startTransition(async () => {
      const res = await updateTab(tab.id, { label, type })
      if (res.ok) patchTab(tab.id, { label, type })
    })
  }

  function remove() {
    setTabs((prev) => prev.filter((t) => t.id !== tab.id))
    deleteTab(tab.id)
    toast.success(`Tab “${tab.label}” deleted`)
  }

  return (
    <div className="rounded-2xl border border-hairline-subtle p-3 transition-colors hover:border-hairline sm:p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Input value={label} onChange={(e) => setLabel(e.target.value)} onBlur={save} className="w-full sm:w-48" />
        <div className="flex items-center gap-2">
          <Select
            value={type}
            onChange={(e) => setType(e.target.value as 'grid' | 'video')}
            onBlur={save}
            className="h-10 flex-1 sm:w-40"
          >
            <option value="grid">Photo grid</option>
            <option value="video">Video</option>
          </Select>
          <div className="ml-auto flex items-center gap-1">
            <Button variant="ghost" size="icon" disabled={index === 0} onClick={() => onReorder(index, -1)} aria-label="Move up">
              <ChevronUp size={16} />
            </Button>
            <Button variant="ghost" size="icon" disabled={index === total - 1} onClick={() => onReorder(index, 1)} aria-label="Move down">
              <ChevronDown size={16} />
            </Button>
            <Button variant="danger" size="icon" onClick={remove} aria-label="Delete tab">
              <Trash2 size={16} />
            </Button>
          </div>
        </div>
      </div>
      {pending && <span className="text-xs text-fg-subtle">Saving…</span>}

      <MediaManager
        tab={tab}
        instagramEnabled={instagramEnabled}
        igUsesUsername={igUsesUsername}
        igConnected={igConnected}
      />

      <TabLinks tabId={tab.id} igUsername={igUsername} />
    </div>
  )
}

export function TabsSection({
  instagramEnabled,
  igUsesUsername,
  igConnected,
  igUsername,
}: {
  instagramEnabled: boolean
  igUsesUsername: boolean
  igConnected: boolean
  igUsername: string | null
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
      const res = await createTab({ label: newLabel.trim(), type: newType })
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
    <Card title="Tabs & links" desc="Each tab is a background with its own links.">
      <div className="flex flex-col gap-3">
        {tabs.map((tab, i) => (
          <TabRow
            key={tab.id}
            tab={tab}
            index={i}
            total={tabs.length}
            onReorder={handleReorder}
            instagramEnabled={instagramEnabled}
            igUsesUsername={igUsesUsername}
            igConnected={igConnected}
            igUsername={igUsername}
          />
        ))}
        {tabs.length === 0 && <p className="text-sm text-fg-subtle">No tabs yet. Add one below.</p>}
      </div>

      <div className="mt-4 flex flex-col gap-2 border-t border-hairline-subtle pt-4 sm:flex-row sm:items-center">
        <Input
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          placeholder="New tab name"
          className="w-full sm:w-44"
        />
        <div className="flex items-center gap-2">
          <Select
            value={newType}
            onChange={(e) => setNewType(e.target.value as 'grid' | 'video')}
            className="h-10 flex-1 sm:w-40"
          >
            <option value="grid">Photo grid</option>
            <option value="video">Video</option>
          </Select>
          <Button variant="secondary" onClick={add} disabled={pending} className="shrink-0">
            <Plus size={15} /> Add tab
          </Button>
        </div>
      </div>
      {error && <p className="mt-2 text-sm text-danger">{error}</p>}
    </Card>
  )
}
