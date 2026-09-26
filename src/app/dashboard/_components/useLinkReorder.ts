'use client'

import { useTransition } from 'react'
import type { DragEndEvent } from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { reorderLinks } from '../actions'
import { toast } from '@/lib/toast'
import { useDragSensors } from '@/hooks/useDragSensors'
import { useDashboardStore } from './DashboardStore'

export function useLinkReorder(tabId: string) {
  const { links, setLinks } = useDashboardStore()
  const tabLinks = links.filter((l) => l.tabId === tabId)
  const sensors = useDragSensors()
  const [, startTransition] = useTransition()

  function onDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return
    const oldIndex = tabLinks.findIndex((l) => l.id === active.id)
    const newIndex = tabLinks.findIndex((l) => l.id === over.id)
    if (oldIndex < 0 || newIndex < 0) return
    const snapshot = links
    const ordered = arrayMove(tabLinks, oldIndex, newIndex)
    setLinks((prev) => [...prev.filter((l) => l.tabId !== tabId), ...ordered])
    startTransition(async () => {
      const res = await reorderLinks(ordered.map((l) => l.id))
      if (!res.ok) {
        setLinks(snapshot)
        toast.error(res.error ?? 'Could not save the new order')
      }
    })
  }

  return { tabLinks, sensors, sortable: tabLinks.length > 1, onDragEnd }
}
