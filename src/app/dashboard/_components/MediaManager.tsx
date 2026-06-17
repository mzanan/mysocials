'use client'

import { useRef } from 'react'
import Image from 'next/image'
import {
  ChevronUp,
  ChevronDown,
  Trash2,
  Upload,
  Instagram,
  RotateCcw,
  X,
  GripVertical,
} from 'lucide-react'
import {
  DndContext,
  closestCenter,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, useSortable, arrayMove, rectSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Button } from '@/components/ui/button'
import { Text } from '@/components/ui/text'
import { cn } from '@/lib/utils'
import type { DashMedia, DashTab } from '@/types/dashboard'
import { useImageUploader } from './useImageUploader'
import { useInstagramImport } from './useInstagramImport'
import { InstagramConnectButton } from './InstagramConnectButton'
import { useMediaManager } from './useMediaManager'

function SortableMedia({
  m,
  index,
  sortable,
  onReorder,
  onRemove,
}: {
  m: DashMedia
  index: number
  sortable: boolean
  onReorder: (index: number, dir: -1 | 1) => void
  onRemove: (id: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: m.id,
  })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        'group relative aspect-square overflow-hidden rounded-lg border border-hairline bg-surface-subtle',
        sortable && 'cursor-grab active:cursor-grabbing',
        isDragging && 'z-20 opacity-80 ring-2 ring-accent',
      )}
      {...(sortable ? attributes : {})}
      {...(sortable ? listeners : {})}
    >
      <Image
        src={m.posterUrl ?? m.url}
        alt=""
        fill
        className="pointer-events-none object-cover"
        sizes="120px"
        priority={index === 0}
        unoptimized={m.kind === 'video' && !m.posterUrl}
      />
      {sortable && (
        <span className="pointer-events-none absolute left-1 top-1 grid h-7 w-7 place-items-center rounded-md bg-black/45 text-white opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
          <GripVertical size={14} />
        </span>
      )}
      {m.kind === 'video' && (
        <span className="pointer-events-none absolute right-1 top-1 rounded bg-black/60 px-1 text-[10px] text-white">
          ▶
        </span>
      )}
      <div
        onPointerDown={(e) => e.stopPropagation()}
        className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-black/45 p-1 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100"
      >
        {sortable ? (
          <Button variant="overlay" size="iconSm" onClick={() => onReorder(index, -1)} aria-label="Move left">
            <ChevronUp size={14} className="-rotate-90" />
          </Button>
        ) : (
          <span className="size-7" />
        )}
        <Button variant="danger" size="iconSm" onClick={() => onRemove(m.id)} aria-label="Delete">
          <Trash2 size={14} />
        </Button>
        {sortable ? (
          <Button variant="overlay" size="iconSm" onClick={() => onReorder(index, 1)} aria-label="Move right">
            <ChevronDown size={14} className="-rotate-90" />
          </Button>
        ) : (
          <span className="size-7" />
        )}
      </div>
    </div>
  )
}

export function MediaManager({
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
  const { busy, videoStep, videoProgress, vidRef, onVideo, reorder, setOrder, removeMedia } =
    useMediaManager(tab)
  const up = useImageUploader(tab)
  const imgRef = useRef<HTMLInputElement>(null)
  const { importing, progress, start: onImport } = useInstagramImport(tab.id)
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 8 } }),
  )

  const sortable = tab.media.length > 1

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e
    if (!over || active.id === over.id) return
    const oldIndex = tab.media.findIndex((m) => m.id === active.id)
    const newIndex = tab.media.findIndex((m) => m.id === over.id)
    if (oldIndex < 0 || newIndex < 0) return
    setOrder(arrayMove(tab.media, oldIndex, newIndex))
  }

  return (
    <div className="flex flex-col gap-3">
      {tab.media.length > 0 && (
        <DndContext
          id={`media-${tab.id}`}
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onDragEnd}
        >
          <SortableContext items={tab.media.map((m) => m.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
              {tab.media.map((m, i) => (
                <SortableMedia
                  key={m.id}
                  m={m}
                  index={i}
                  sortable={sortable}
                  onReorder={reorder}
                  onRemove={removeMedia}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        {tab.type === 'video' ? (
          <>
            <input ref={vidRef} type="file" accept="video/*" multiple hidden onChange={onVideo} />
            <Button
              variant="secondary"
              disabled={busy}
              onClick={() => vidRef.current?.click()}
              className="w-full sm:w-auto"
            >
              <Upload size={14} />{' '}
              {videoStep
                ? `${videoStep === 'optimizing' ? 'Optimizing' : 'Uploading'}${
                    videoProgress && videoProgress.total > 1
                      ? ` ${videoProgress.index}/${videoProgress.total}`
                      : ''
                  }…`
                : 'Add video'}
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
            <Button
              variant="secondary"
              disabled={up.active}
              onClick={() => imgRef.current?.click()}
              className="w-full sm:w-auto"
            >
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
        <Text variant="caption">
          {igUsesUsername
            ? 'Imports photos from any public Instagram profile.'
            : 'Instagram import needs a Professional or Creator account.'}
        </Text>
      )}

      {!up.active && up.total > 0 && (
        <div className="flex flex-col gap-1.5 text-xs">
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

      {tab.media.length === 0 && tab.type !== 'video' && (
        <Text variant="caption" className="text-fg-faint">
          No photos yet. Add some or import from Instagram.
        </Text>
      )}
    </div>
  )
}
