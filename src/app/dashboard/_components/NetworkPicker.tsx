'use client'

import { useState } from 'react'
import { Link2, Search } from 'lucide-react'
import { Dialog, DialogBody, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { NetworkIcon } from '@/components/SocialIcon/NetworkIcon'
import { NETWORKS, NETWORK_SLUGS, type NetworkSlug } from '@/lib/networks'

export function NetworkPicker({
  open,
  onOpenChange,
  onSelect,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  onSelect: (slug: NetworkSlug | null) => void
}) {
  const [q, setQ] = useState('')
  const query = q.trim().toLowerCase()
  const filtered = NETWORK_SLUGS.filter((s) => NETWORKS[s].label.toLowerCase().includes(query))

  function pick(v: NetworkSlug | null) {
    onSelect(v)
    onOpenChange(false)
    setQ('')
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      size="sm"
      aria-describedby={undefined}
    >
      <DialogHeader>
        <DialogTitle>Add a link</DialogTitle>
      </DialogHeader>
      <DialogBody className="p-0">
        <div className="sticky top-0 z-10 bg-app-bg px-3 pb-2 pt-3">
          <div className="flex items-center gap-2 rounded-xl border border-hairline bg-surface px-3">
            <Search size={15} className="shrink-0 text-fg-subtle" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search networks"
              className="h-10 flex-1 bg-transparent text-sm text-fg outline-none placeholder:text-fg-faint"
            />
          </div>
        </div>
        <div className="flex flex-col px-2 pb-2">
          {filtered.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => pick(s)}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-surface-strong"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-strong text-fg">
                <NetworkIcon slug={s} size={18} />
              </span>
              <span className="text-sm font-medium text-fg">{NETWORKS[s].label}</span>
            </button>
          ))}
          <button
            type="button"
            onClick={() => pick(null)}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-surface-strong"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-strong text-fg-muted">
              <Link2 size={18} />
            </span>
            <span className="text-sm font-medium text-fg">Custom link</span>
          </button>
        </div>
      </DialogBody>
    </Dialog>
  )
}
