'use client'

import { useState } from 'react'
import { Instagram } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogBody, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { toast } from '@/lib/toast'

export function InstagramConnectButton({ igUsesUsername }: { igUsesUsername: boolean }) {
  const [open, setOpen] = useState(false)
  const [username, setUsername] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!igUsesUsername) {
    return (
      <Button
        variant="secondary"
        onClick={() => {
          window.location.href = '/api/import/instagram/connect'
        }}
      >
        <Instagram size={14} /> Connect Instagram
      </Button>
    )
  }

  async function connect() {
    const handle = username.trim()
    if (!handle) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/import/instagram/connect', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ username: handle }),
      })
      const data = (await res.json().catch(() => null)) as { username?: string; error?: string } | null
      if (!res.ok) {
        toast.error(data?.error ?? "We couldn't connect that Instagram profile.")
        setSubmitting(false)
        return
      }
      toast.success(`Connected @${data?.username ?? handle}`)
      window.location.reload()
    } catch {
      toast.error("We couldn't connect that Instagram profile.")
      setSubmitting(false)
    }
  }

  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        <Instagram size={14} /> Connect Instagram
      </Button>
      <Dialog open={open} onOpenChange={setOpen} size="sm">
        <DialogHeader>
          <DialogTitle>Connect Instagram</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <Field label="Your public Instagram username">
            <Input
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') connect()
              }}
              placeholder="@username"
            />
          </Field>
          <p className="mt-2 text-xs text-fg-subtle">
            We fetch photos from your public profile. No login needed.
          </p>
        </DialogBody>
        <DialogFooter>
          <Button variant="secondary" onClick={() => setOpen(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="primary" onClick={connect} disabled={submitting || !username.trim()}>
            {submitting ? 'Connecting…' : 'Connect'}
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  )
}
