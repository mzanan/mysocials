'use client'

import { useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { FaviconIcon } from '@/components/ui/FaviconIcon'
import { LINK_ICONS, LINK_ICON_KEYS } from '@/lib/linkIcons'
import { cn } from '@/lib/utils'

function CurrentIcon({ value, url }: { value: string; url: string }) {
  const Icon = value ? LINK_ICONS[value] : null
  if (Icon) return <Icon size={18} strokeWidth={1.8} className="text-fg" />
  return <FaviconIcon url={url} size={18} />
}

export function LinkIconPicker({
  value,
  url,
  onChange,
}: {
  value: string
  url: string
  onChange: (key: string | null) => void
}) {
  const [open, setOpen] = useState(false)

  function pick(key: string | null) {
    onChange(key)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Change icon"
          className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-surface-strong transition hover:ring-2 hover:ring-hairline-strong"
        >
          <CurrentIcon value={value} url={url} />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64">
        <button
          type="button"
          onClick={() => pick(null)}
          className={cn(
            'mb-3 flex w-full cursor-pointer items-center gap-2 rounded-lg border border-hairline px-3 py-2 text-sm text-fg-muted transition hover:bg-hover hover:text-fg',
            !value && 'border-accent text-fg',
          )}
        >
          <FaviconIcon url={url} size={18} />
          Auto (site icon)
        </button>
        <div className="thin-scrollbar grid max-h-56 grid-cols-6 gap-1 overflow-y-auto pr-1">
          {LINK_ICON_KEYS.map((key) => {
            const Icon = LINK_ICONS[key]
            return (
              <button
                key={key}
                type="button"
                onClick={() => pick(key)}
                aria-label={key}
                className={cn(
                  'flex aspect-square w-full cursor-pointer items-center justify-center rounded-lg text-fg-muted transition hover:bg-hover hover:text-fg',
                  value === key && 'bg-accent/12 text-accent',
                )}
              >
                <Icon size={18} strokeWidth={1.8} />
              </button>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}
