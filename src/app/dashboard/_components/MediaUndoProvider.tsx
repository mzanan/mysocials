'use client'

import { createContext, useContext, type ReactNode } from 'react'
import { deleteMedia } from '../actions'
import { toast } from '@/lib/toast'
import type { DashMedia } from '@/types/dashboard'
import { useDashboardStore } from './DashboardStore'

type MediaUndo = {
  remove: (tabId: string, item: DashMedia, index: number) => void
}

const MediaUndoContext = createContext<MediaUndo | null>(null)

export function MediaUndoProvider({ children }: { children: ReactNode }) {
  const { setTabMedia } = useDashboardStore()

  function remove(tabId: string, item: DashMedia, index: number) {
    setTabMedia(tabId, (prev) => prev.filter((m) => m.id !== item.id))

    const restore = () =>
      setTabMedia(tabId, (prev) => {
        if (prev.some((m) => m.id === item.id)) return prev
        const next = [...prev]
        next.splice(Math.min(index, next.length), 0, item)
        return next
      })

    void deleteMedia(item.id)
      .then((res) => {
        if (!res.ok) {
          restore()
          toast.error(res.error ?? 'Could not delete')
        }
      })
      .catch(() => {
        restore()
        toast.error('Could not delete')
      })
  }

  return <MediaUndoContext.Provider value={{ remove }}>{children}</MediaUndoContext.Provider>
}

export function useMediaUndo() {
  const ctx = useContext(MediaUndoContext)
  if (!ctx) throw new Error('useMediaUndo must be used within MediaUndoProvider')
  return ctx
}
