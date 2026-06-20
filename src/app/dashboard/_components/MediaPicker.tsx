'use client'

import Image from 'next/image'
import { Dialog, DialogBody, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { DashMedia } from '@/types/dashboard'

export function MediaPicker({
  open,
  onOpenChange,
  media,
  onPick,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  media: DashMedia[]
  onPick: (id: string) => void
}) {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      size="lg"
      aria-describedby={undefined}
    >
      <DialogHeader>
        <DialogTitle>Pick avatar from your photos</DialogTitle>
      </DialogHeader>
      <DialogBody>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
          {media.map((m, i) => (
            <button
              key={m.id}
              type="button"
              onClick={() => onPick(m.id)}
              className="group relative aspect-square overflow-hidden rounded-lg border border-hairline-subtle bg-surface-subtle transition hover:border-accent"
            >
              <Image
                src={m.url}
                alt=""
                fill
                className="object-cover"
                sizes="120px"
                {...(i === 0 ? { priority: true } : { loading: 'eager' as const })}
              />
            </button>
          ))}
        </div>
      </DialogBody>
    </Dialog>
  )
}
