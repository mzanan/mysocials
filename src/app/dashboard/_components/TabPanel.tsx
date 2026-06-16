'use client'

import { useState, useTransition } from 'react'
import { ChevronLeft, ChevronRight, Trash2 } from 'lucide-react'
import { updateTab } from '../actions'
import { Button } from '@/components/ui/button'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import type { DashTab } from '@/types/dashboard'
import { useDashboardStore } from './DashboardStore'
import { MediaManager } from './MediaManager'
import { TabLinks } from './TabLinks'

export function TabPanel({
  tab,
  index,
  total,
  onReorder,
  onRemove,
  instagramEnabled,
  igUsesUsername,
  igConnected,
  igUsername,
}: {
  tab: DashTab
  index: number
  total: number
  onReorder: (index: number, dir: -1 | 1) => void
  onRemove: (id: string) => void
  instagramEnabled: boolean
  igUsesUsername: boolean
  igConnected: boolean
  igUsername: string | null
}) {
  const { patchTab } = useDashboardStore()
  const [label, setLabel] = useState(tab.label)
  const [type, setType] = useState(tab.type)
  const [pending, startTransition] = useTransition()

  function save(next?: { type?: 'grid' | 'video' }) {
    const type_ = next?.type ?? type
    startTransition(async () => {
      const res = await updateTab(tab.id, { label, type: type_ })
      if (res.ok) patchTab(tab.id, { label, type: type_ })
    })
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <Field label="Tab name" className="flex-1 sm:max-w-xs">
          <Input value={label} onChange={(e) => setLabel(e.target.value)} onBlur={() => save()} />
        </Field>
        <Field label="Layout" className="sm:w-44">
          <Select
            value={type}
            onChange={(e) => {
              const v = e.target.value as 'grid' | 'video'
              setType(v)
              save({ type: v })
            }}
            className="w-full"
          >
            <option value="grid">Photo grid</option>
            <option value="video">Video</option>
          </Select>
        </Field>
        <div className="flex items-center gap-1 sm:pb-0.5">
          <Button
            variant="ghost"
            size="icon"
            disabled={index === 0}
            onClick={() => onReorder(index, -1)}
            aria-label="Move tab left"
          >
            <ChevronLeft size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            disabled={index === total - 1}
            onClick={() => onReorder(index, 1)}
            aria-label="Move tab right"
          >
            <ChevronRight size={16} />
          </Button>
          <Button
            variant="danger"
            size="icon"
            onClick={() => onRemove(tab.id)}
            aria-label="Delete tab"
            className="ml-auto"
          >
            <Trash2 size={16} />
          </Button>
        </div>
      </div>
      {pending && <span className="-mt-3 text-xs text-fg-subtle">Saving…</span>}

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
