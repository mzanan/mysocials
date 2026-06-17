'use client'

import { createContext, useContext, useRef, type ReactNode } from 'react'
import { deleteMedia } from '../actions'
import { toast } from '@/lib/toast'
import type { DashMedia } from '@/types/dashboard'
import { useDashboardStore } from './DashboardStore'

const UNDO_MS = 6000

type MediaUndo = {
  remove: (tabId: string, item: DashMedia, index: number) => void
}

const MediaUndoContext = createContext<MediaUndo | null>(null)

export function MediaUndoProvider({ children }: { children: ReactNode }) {
  const { setTabMedia } = useDashboardStore()
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  function remove(tabId: string, item: DashMedia, index: number) {
    setTabMedia(tabId, (prev) => prev.filter((m) => m.id !== item.id))

    const toastId = `del-${item.id}`
    const timer = setTimeout(() => {
      timers.current.delete(item.id)
      toast.dismiss(toastId)
      deleteMedia(item.id)
    }, UNDO_MS)
    timers.current.set(item.id, timer)

    toast(item.kind === 'video' ? 'Video deleted' : 'Photo deleted', {
      id: toastId,
      duration: UNDO_MS,
      action: {
        label: 'Undo',
        onClick: () => {
          const t = timers.current.get(item.id)
          if (!t) return
          clearTimeout(t)
          timers.current.delete(item.id)
          setTabMedia(tabId, (prev) => {
            if (prev.some((m) => m.id === item.id)) return prev
            const next = [...prev]
            next.splice(Math.min(index, next.length), 0, item)
            return next
          })
        },
      },
    })
  }

  return <MediaUndoContext.Provider value={{ remove }}>{children}</MediaUndoContext.Provider>
}

export function useMediaUndo() {
  const ctx = useContext(MediaUndoContext)
  if (!ctx) throw new Error('useMediaUndo must be used within MediaUndoProvider')
  return ctx
}
