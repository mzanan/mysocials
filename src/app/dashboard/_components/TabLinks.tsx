'use client'

import { useState, useTransition } from 'react'
import { Link2, Plus, Trash2, X } from 'lucide-react'
import { createLink } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { NetworkIcon } from '@/components/SocialIcon/NetworkIcon'
import { isNetworkSlug, type NetworkSlug } from '@/lib/networks'
import { toast } from '@/lib/toast'
import type { DashLink } from '@/types/dashboard'
import { useDashboardStore } from './DashboardStore'
import { useLinkRow } from './useLinkRow'
import { NetworkPicker } from './NetworkPicker'

function NetworkBadge({ slug }: { slug: string | null }) {
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-strong text-fg">
      {slug && isNetworkSlug(slug) ? (
        <NetworkIcon slug={slug} size={18} />
      ) : (
        <Link2 size={16} className="text-fg-muted" />
      )}
    </span>
  )
}

function LinkRow({ link }: { link: DashLink }) {
  const r = useLinkRow(link)
  const isNetwork = Boolean(r.network)

  return (
    <div className="flex items-center gap-2 rounded-xl border border-hairline-subtle bg-surface-subtle p-2">
      <NetworkBadge slug={r.network || null} />
      {isNetwork ? (
        <Input
          value={r.handle}
          onChange={(e) => r.setHandle(e.target.value)}
          onBlur={r.save}
          placeholder="@username"
          className="min-w-0 flex-1"
        />
      ) : (
        <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row">
          <Input
            value={r.title}
            onChange={(e) => r.setTitle(e.target.value)}
            onBlur={r.save}
            placeholder="Title"
            className="sm:w-32"
          />
          <Input
            value={r.url}
            onChange={(e) => r.setUrl(e.target.value)}
            onBlur={r.save}
            placeholder="https://…"
            className="min-w-0 flex-1"
          />
        </div>
      )}
      <Button variant="danger" size="icon" onClick={r.remove} aria-label="Delete link" className="shrink-0">
        <Trash2 size={15} />
      </Button>
    </div>
  )
}

export function TabLinks({ tabId }: { tabId: string }) {
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
    setHandle('')
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
        <div className="mt-2 flex items-center gap-2 rounded-xl border border-hairline bg-surface p-2">
          <NetworkBadge slug={draft.network} />
          {draft.network ? (
            <Input
              autoFocus
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder="@username"
              className="min-w-0 flex-1"
            />
          ) : (
            <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row">
              <Input
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title"
                className="sm:w-32"
              />
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://…"
                className="min-w-0 flex-1"
              />
            </div>
          )}
          <Button variant="secondary" onClick={confirmDraft} disabled={pending} className="shrink-0">
            Add
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setDraft(null)} aria-label="Cancel" className="shrink-0">
            <X size={15} />
          </Button>
        </div>
      )}

      {!draft && (
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-hairline-strong py-2.5 text-sm font-medium text-fg-muted transition-colors hover:bg-surface-subtle hover:text-fg"
        >
          <Plus size={16} /> Add link
        </button>
      )}

      <NetworkPicker open={pickerOpen} onOpenChange={setPickerOpen} onSelect={startDraft} />
    </div>
  )
}
