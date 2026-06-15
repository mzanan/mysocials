'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Instagram } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from '@/lib/toast'

const SWITCH_STEPS = [
  'In the Instagram app, open your profile and tap the menu, then Settings and activity.',
  'Tap Account type and tools.',
  'Tap Switch to professional account and pick Creator or Business.',
  'Come back here and connect again.',
]

const ONBOARDING_STATUSES = new Set(['personal', 'declined'])

export function IgConnectStatus() {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const status = params.get('ig')
  const [reason] = useState(() => (status && ONBOARDING_STATUSES.has(status) ? status : null))
  const [open, setOpen] = useState(() => reason !== null)

  useEffect(() => {
    if (!status) return
    if (status === 'connected') toast.success('Instagram connected')
    if (status === 'error') toast.error("We couldn't connect your Instagram. Try again.")
    const next = new URLSearchParams(params.toString())
    next.delete('ig')
    const qs = next.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname)
  }, [status, params, pathname, router])

  return (
    <Dialog open={open} onOpenChange={setOpen} size="md">
      <DialogHeader>
        <div>
          <DialogTitle>Switch your Instagram to Professional</DialogTitle>
          <DialogDescription>
            {reason === 'personal'
              ? 'Your Instagram is a Personal account, and Instagram only allows imports from Professional accounts.'
              : 'The connection was cancelled. If Instagram asked you to switch to a Professional account, this is all it takes.'}{' '}
            It is free and takes about 30 seconds.
          </DialogDescription>
        </div>
      </DialogHeader>
      <DialogBody>
        <ol className="flex list-decimal flex-col gap-2 pl-5 text-sm text-fg-muted">
          {SWITCH_STEPS.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </DialogBody>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="secondary">Not now</Button>
        </DialogClose>
        <Button
          variant="primary"
          onClick={() => {
            window.location.href = '/api/import/instagram/connect'
          }}
        >
          <Instagram size={14} /> Try again
        </Button>
      </DialogFooter>
    </Dialog>
  )
}
