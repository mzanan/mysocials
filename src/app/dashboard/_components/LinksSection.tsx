'use client'

import { useState, useTransition } from 'react'
import { ChevronUp, ChevronDown, Link2, Plus, Trash2, X } from 'lucide-react'
import { createLink, reorderLinks } from '../actions'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { NetworkIcon } from '@/components/SocialIcon/NetworkIcon'
import { moveItem } from '@/lib/array'
import { NETWORKS, isNetworkSlug, type NetworkSlug } from '@/lib/networks'
import { toast } from '@/lib/toast'
import type { DashLink, DashTab } from '@/types/dashboard'
import { useDashboardStore } from './DashboardStore'
import { useLinkRow } from './useLinkRow'
import { NetworkPicker } from './NetworkPicker'

const ICONS = [
  { value: '', label: 'Auto' },
  { value: 'shopping-bag', label: 'Bag' },
  { value: 'shopping-cart', label: 'Cart' },
  { value: 'code', label: 'Code' },
]

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

function TabSelect({
  value,
  onChange,
  onBlur,
  tabs,
}: {
  value: string
  onChange: (v: string) => void
  onBlur?: () => void
  tabs: DashTab[]
}) {
  return (
    <Select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      className="h-9 w-28"
    >
      <option value="">All tabs</option>
      {tabs.map((t) => (
        <option key={t.id} value={t.id}>
          {t.label}
        </option>
      ))}
    </Select>
  )
}

function LinkRow({
  link,
  index,
  total,
  tabs,
  onReorder,
}: {
  link: DashLink
  index: number
  total: number
  tabs: DashTab[]
  onReorder: (index: number, dir: -1 | 1) => void
}) {
  const r = useLinkRow(link)
  const isNetwork = Boolean(r.network)

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-hairline-subtle bg-surface-subtle p-2.5">
      <NetworkBadge slug={r.network || null} />
      {isNetwork ? (
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <span className="hidden shrink-0 text-sm font-medium text-fg sm:block">
            {isNetworkSlug(r.network) ? NETWORKS[r.network].label : r.network}
          </span>
          <Input
            value={r.handle}
            onChange={(e) => r.setHandle(e.target.value)}
            onBlur={r.save}
            placeholder="@username"
            className="h-9 min-w-0 flex-1"
          />
        </div>
      ) : (
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          <Input
            value={r.title}
            onChange={(e) => r.setTitle(e.target.value)}
            onBlur={r.save}
            placeholder="Title"
            className="h-9 w-28"
          />
          <Input
            value={r.url}
            onChange={(e) => r.setUrl(e.target.value)}
            onBlur={r.save}
            placeholder="https://…"
            className="h-9 min-w-0 flex-1"
          />
          <Select
            value={r.icon}
            onChange={(e) => r.setIcon(e.target.value)}
            onBlur={r.save}
            className="h-9 w-24"
          >
            {ICONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </div>
      )}
      <TabSelect value={r.tabId} onChange={r.setTabId} onBlur={r.save} tabs={tabs} />
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" disabled={index === 0} onClick={() => onReorder(index, -1)} aria-label="Move up">
          <ChevronUp size={15} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          disabled={index === total - 1}
          onClick={() => onReorder(index, 1)}
          aria-label="Move down"
        >
          <ChevronDown size={15} />
        </Button>
        <Button variant="danger" size="icon" onClick={r.remove} aria-label="Delete link">
          <Trash2 size={15} />
        </Button>
      </div>
      {r.pending && <span className="text-xs text-fg-subtle">Saving…</span>}
    </div>
  )
}

type Draft = { network: NetworkSlug | null }

export function LinksSection() {
  const { tabs, links, setLinks } = useDashboardStore()
  const [pickerOpen, setPickerOpen] = useState(false)
  const [draft, setDraft] = useState<Draft | null>(null)
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

  function cancelDraft() {
    setDraft(null)
  }

  function confirmDraft() {
    if (!draft) return
    startTransition(async () => {
      const res = await createLink({
        tabId: null,
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

  function handleReorder(index: number, dir: -1 | 1) {
    const ordered = moveItem(links, index, dir)
    setLinks(ordered)
    reorderLinks(ordered.map((l) => l.id))
  }

  return (
    <Card title="Links" desc="Buttons on your page. Assign to a tab or show on all.">
      <div className="flex flex-col gap-2">
        {links.map((link, i) => (
          <LinkRow key={link.id} link={link} index={i} total={links.length} tabs={tabs} onReorder={handleReorder} />
        ))}
        {links.length === 0 && !draft && <p className="text-sm text-fg-subtle">No links yet.</p>}
      </div>

      {draft && (
        <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl border border-hairline bg-surface p-2.5">
          <NetworkBadge slug={draft.network} />
          {draft.network ? (
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <span className="hidden shrink-0 text-sm font-medium text-fg sm:block">
                {NETWORKS[draft.network].label}
              </span>
              <Input
                autoFocus
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                placeholder="@username"
                className="h-9 min-w-0 flex-1"
              />
            </div>
          ) : (
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
              <Input
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title"
                className="h-9 w-28"
              />
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://…"
                className="h-9 min-w-0 flex-1"
              />
            </div>
          )}
          <Button variant="secondary" onClick={confirmDraft} disabled={pending}>
            Add
          </Button>
          <Button variant="ghost" size="icon" onClick={cancelDraft} aria-label="Cancel">
            <X size={15} />
          </Button>
        </div>
      )}

      {!draft && (
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-hairline-strong py-3 text-sm font-medium text-fg-muted transition-colors hover:bg-surface-subtle hover:text-fg"
        >
          <Plus size={16} /> Add link
        </button>
      )}

      <NetworkPicker open={pickerOpen} onOpenChange={setPickerOpen} onSelect={startDraft} />
    </Card>
  )
}
