'use client'

import { useState, useTransition } from 'react'
import { Link2, Plus, Trash2, X } from 'lucide-react'
import { createLink } from '../actions'
import { Button } from '@/components/ui/button'
import { NetworkIcon } from '@/components/SocialIcon/NetworkIcon'
import { isNetworkSlug, type NetworkSlug } from '@/lib/networks'
import { cn } from '@/lib/utils'
import { toast } from '@/lib/toast'
import type { DashLink } from '@/types/dashboard'
import { useDashboardStore } from './DashboardStore'
import { useLinkRow } from './useLinkRow'
import { NetworkPicker } from './NetworkPicker'

const bareInput = 'w-full min-w-0 bg-transparent placeholder:text-fg-faint outline-none'

function NetworkBadge({ slug }: { slug: string | null }) {
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-strong text-fg">
      {slug && isNetworkSlug(slug) ? (
        <NetworkIcon slug={slug} size={18} />
      ) : (
        <Link2 size={16} className="text-fg-muted" />
      )}
    </span>
  )
}

function LinkFields({
  network,
  handle,
  setHandle,
  title,
  setTitle,
  url,
  setUrl,
  onBlur,
  autoFocus,
}: {
  network: string | null
  handle: string
  setHandle: (v: string) => void
  title: string
  setTitle: (v: string) => void
  url: string
  setUrl: (v: string) => void
  onBlur?: () => void
  autoFocus?: boolean
}) {
  if (network) {
    return (
      <div className="flex min-w-0 flex-1 items-center">
        <span className="text-[15px] text-fg-faint">@</span>
        <input
          autoFocus={autoFocus}
          value={handle}
          onChange={(e) => setHandle(e.target.value)}
          onBlur={onBlur}
          placeholder="username"
          className={cn(bareInput, 'ml-0.5 text-[15px] text-fg')}
        />
      </div>
    )
  }
  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <input
        autoFocus={autoFocus}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={onBlur}
        placeholder="Title"
        className={cn(bareInput, 'text-[15px] font-medium text-fg')}
      />
      <input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        onBlur={onBlur}
        placeholder="https://…"
        className={cn(bareInput, 'text-xs text-fg-muted')}
      />
    </div>
  )
}

function LinkRow({ link }: { link: DashLink }) {
  const r = useLinkRow(link)

  return (
    <div className="group flex items-center gap-3 rounded-xl border border-hairline px-3 py-2 transition hover:border-hairline-strong focus-within:border-accent">
      <NetworkBadge slug={r.network || null} />
      <LinkFields
        network={r.network || null}
        handle={r.handle}
        setHandle={r.setHandle}
        title={r.title}
        setTitle={r.setTitle}
        url={r.url}
        setUrl={r.setUrl}
        onBlur={r.save}
      />
      <Button
        variant="ghost"
        size="icon"
        onClick={r.remove}
        aria-label="Delete link"
        className="shrink-0 text-fg-faint hover:bg-danger/10 hover:text-danger"
      >
        <Trash2 size={15} />
      </Button>
    </div>
  )
}

export function TabLinks({ tabId, igUsername }: { tabId: string; igUsername: string | null }) {
  const { links, setLinks } = useDashboardStore()
  const tabLinks = links.filter((l) => l.tabId === tabId)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [draft, setDraft] = useState<{ network: NetworkSlug | null } | null>(null)
  const [handle, setHandle] = useState('')
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [pending, startTransition] = useTransition()

  function startDraft(slug: NetworkSlug | null) {
    setDraft({ network: slug })
    setHandle(slug === 'instagram' && igUsername ? igUsername : '')
    setTitle('')
    setUrl('')
  }

  function confirmDraft() {
    if (!draft) return
    startTransition(async () => {
      const res = await createLink({
        tabId,
        network: draft.network,
        handle: draft.network ? handle : null,
        title: draft.network ? undefined : title,
        url: draft.network ? undefined : url,
        icon: null,
      })
      if (!res.ok) {
        toast.error(res.error)
        return
      }
      setLinks((prev) => [...prev, res.link])
      setDraft(null)
      toast.success('Link added')
    })
  }

  return (
    <div className="mt-4 border-t border-hairline-subtle pt-4">
      <p className="mb-2 text-xs font-medium text-fg-subtle">Links</p>
      <div className="flex flex-col gap-2">
        {tabLinks.map((link) => (
          <LinkRow key={link.id} link={link} />
        ))}
      </div>

      {draft && (
        <div className="mt-2 flex items-center gap-3 rounded-xl border border-accent/40 bg-surface-strong px-3 py-2">
          <NetworkBadge slug={draft.network} />
          <LinkFields
            autoFocus
            network={draft.network}
            handle={handle}
            setHandle={setHandle}
            title={title}
            setTitle={setTitle}
            url={url}
            setUrl={setUrl}
          />
          <Button variant="secondary" size="sm" onClick={confirmDraft} disabled={pending} className="shrink-0">
            Add
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDraft(null)}
            aria-label="Cancel"
            className="shrink-0"
          >
            <X size={15} />
          </Button>
        </div>
      )}

      {!draft && (
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-hairline-strong py-2.5 text-sm font-medium text-fg-muted transition-colors hover:bg-hover hover:text-fg"
        >
          <Plus size={16} /> Add link
        </button>
      )}

      <NetworkPicker open={pickerOpen} onOpenChange={setPickerOpen} onSelect={startDraft} />
    </div>
  )
}
