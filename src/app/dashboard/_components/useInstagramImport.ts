'use client'

import { useState } from 'react'
import { toast } from '@/lib/toast'

const IMPORT_POLL_INTERVAL_MS = 1500

type Progress = { imported: number; total: number }

type PollResult = {
  status: 'pending' | 'running' | 'processing' | 'done' | 'failed'
  total: number
  imported: number
  error: string | null
  reauth?: boolean
}

export function useInstagramImport(tabId: string) {
  const [importing, setImporting] = useState(false)
  const [progress, setProgress] = useState<Progress | null>(null)

  async function start() {
    setImporting(true)
    setProgress(null)

    const res = await fetch('/api/import/instagram', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ tabId }),
    })
    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as { error?: string } | null
      toast.error(data?.error ?? 'Could not start the import')
      setImporting(false)
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
        toast.error('Import failed. Please try again.')
        setImporting(false)
        return
      }
      const data = (await r.json()) as PollResult
      setProgress({ imported: data.imported, total: data.total })
      if (data.status === 'done') {
        window.location.reload()
        return
      }
      if (data.status === 'failed') {
        if (data.reauth) {
          toast.error('Reconnect Instagram to keep importing.')
          window.location.href = '/api/import/instagram/connect'
          return
        }
        toast.error(data.error ?? 'Import failed')
        setImporting(false)
        return
      }
    }
  }

  return { importing, progress, start }
}
