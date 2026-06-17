'use client'

import { createContext, useContext, useRef, useState, type ReactNode } from 'react'
import { toast } from '@/lib/toast'

const IMPORT_POLL_INTERVAL_MS = 1500
const TOAST_ID = 'ig-import'

type Progress = { imported: number; total: number }

type PollResult = {
  status: 'pending' | 'running' | 'processing' | 'done' | 'failed'
  total: number
  imported: number
  error: string | null
  reauth?: boolean
}

type ImportState = {
  activeTabId: string | null
  progress: Progress | null
  start: (tabId: string) => void
}

const ImportContext = createContext<ImportState | null>(null)

export function ImportProvider({ children }: { children: ReactNode }) {
  const [activeTabId, setActiveTabId] = useState<string | null>(null)
  const [progress, setProgress] = useState<Progress | null>(null)
  const runningRef = useRef(false)

  async function start(tabId: string) {
    if (runningRef.current) return
    runningRef.current = true
    setActiveTabId(tabId)
    setProgress(null)
    toast.loading('Fetching from Instagram. Keep this tab open.', { id: TOAST_ID })

    function stop() {
      runningRef.current = false
      setActiveTabId(null)
      setProgress(null)
    }

    const res = await fetch('/api/import/instagram', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ tabId }),
    })
    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as { error?: string } | null
      toast.error(data?.error ?? 'Could not start the import', { id: TOAST_ID })
      stop()
      return
    }
    const { jobId } = (await res.json()) as { jobId: string }

    while (true) {
      await new Promise((r) => setTimeout(r, IMPORT_POLL_INTERVAL_MS))
      const r = await fetch('/api/import/instagram/poll', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ jobId }),
      })
      if (!r.ok) {
        toast.error('Import failed. Please try again.', { id: TOAST_ID })
        stop()
        return
      }
      const data = (await r.json()) as PollResult
      setProgress({ imported: data.imported, total: data.total })
      if (data.status === 'done') {
        toast.success('Your Instagram photos are in.', { id: TOAST_ID })
        window.location.reload()
        return
      }
      if (data.status === 'failed') {
        if (data.reauth) {
          toast.error('Reconnect Instagram to keep importing.', { id: TOAST_ID })
          window.location.href = '/api/import/instagram/connect'
          return
        }
        toast.error(data.error ?? 'Import failed', { id: TOAST_ID })
        stop()
        return
      }
      toast.loading(
        data.total > 0
          ? `Importing ${data.imported}/${data.total}. Keep this tab open.`
          : 'Fetching from Instagram. Keep this tab open.',
        { id: TOAST_ID },
      )
    }
  }

  return (
    <ImportContext.Provider value={{ activeTabId, progress, start }}>{children}</ImportContext.Provider>
  )
}

export function useImportContext() {
  const ctx = useContext(ImportContext)
  if (!ctx) throw new Error('useImportContext must be used within ImportProvider')
  return ctx
}
