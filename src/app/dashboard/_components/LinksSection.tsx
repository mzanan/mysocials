'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronUp, ChevronDown, Trash2, Plus } from 'lucide-react'
import { createLink, deleteLink, reorderLinks, updateLink } from '../actions'
import { Card, btnCls, btnPrimaryCls, inputCls } from './ui'
import type { DashLink, DashboardData } from './types'

const ICONS = [
  { value: '', label: 'Auto / social' },
  { value: 'shopping-bag', label: 'Shopping bag' },
  { value: 'shopping-cart', label: 'Shopping cart' },
  { value: 'code', label: 'Code' },
]

function move<T>(arr: T[], index: number, dir: -1 | 1): T[] {
  const next = [...arr]
  const target = index + dir
  if (target < 0 || target >= next.length) return next
  ;[next[index], next[target]] = [next[target], next[index]]
  return next
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
  tabs: DashboardData['tabs']
  onReorder: (index: number, dir: -1 | 1) => void
}) {
  const router = useRouter()
  const [title, setTitle] = useState(link.title)
  const [url, setUrl] = useState(link.url)
  const [icon, setIcon] = useState(link.icon ?? '')
  const [tabId, setTabId] = useState(link.tabId ?? '')
  const [pending, startTransition] = useTransition()

  function save() {
    startTransition(async () => {
      await updateLink(link.id, { title, url, icon: icon || null, tabId: tabId || null })
      router.refresh()
    })
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] p-2">
      <input value={title} onChange={(e) => setTitle(e.target.value)} onBlur={save} placeholder="Title" className={`${inputCls} h-9 w-32`} />
      <input value={url} onChange={(e) => setUrl(e.target.value)} onBlur={save} placeholder="https://…" className={`${inputCls} h-9 min-w-0 flex-1`} />
      <select value={icon} onChange={(e) => setIcon(e.target.value)} onBlur={save} className={`${inputCls} h-9 w-36`}>
        {ICONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <select value={tabId} onChange={(e) => setTabId(e.target.value)} onBlur={save} className={`${inputCls} h-9 w-32`}>
        <option value="">All tabs</option>
        {tabs.map((t) => (
          <option key={t.id} value={t.id}>
            {t.label}
          </option>
        ))}
      </select>
      <div className="flex items-center gap-1">
        <button className={btnCls} disabled={index === 0} onClick={() => onReorder(index, -1)} aria-label="Move up">
          <ChevronUp size={15} />
        </button>
        <button className={btnCls} disabled={index === total - 1} onClick={() => onReorder(index, 1)} aria-label="Move down">
          <ChevronDown size={15} />
        </button>
        <button
          className={`${btnCls} text-red-300`}
          onClick={() => deleteLink(link.id).then(() => router.refresh())}
          aria-label="Delete link"
        >
          <Trash2 size={15} />
        </button>
      </div>
      {pending && <span className="text-xs text-white/40">Saving…</span>}
    </div>
  )
}

export function LinksSection({ data }: { data: DashboardData }) {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [icon, setIcon] = useState('')
  const [tabId, setTabId] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function add() {
    setError(null)
    startTransition(async () => {
      const res = await createLink({ title, url, icon: icon || null, tabId: tabId || null })
      if (!res.ok) {
        setError(res.error)
        return
      }
      setTitle('')
      setUrl('')
      setIcon('')
      router.refresh()
    })
  }

  function handleReorder(index: number, dir: -1 | 1) {
    const ordered = move(data.links, index, dir).map((l) => l.id)
    reorderLinks(ordered).then(() => router.refresh())
  }

  return (
    <Card title="Links" desc="Buttons on your page. Assign to a tab or show on all.">
      <div className="flex flex-col gap-2">
        {data.links.map((link, i) => (
          <LinkRow key={link.id} link={link} index={i} total={data.links.length} tabs={data.tabs} onReorder={handleReorder} />
        ))}
        {data.links.length === 0 && <p className="text-sm text-white/45">No links yet.</p>}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/[0.06] pt-4">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className={`${inputCls} h-9 w-32`} />
        <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" className={`${inputCls} h-9 min-w-0 flex-1`} />
        <select value={icon} onChange={(e) => setIcon(e.target.value)} className={`${inputCls} h-9 w-36`}>
          {ICONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <select value={tabId} onChange={(e) => setTabId(e.target.value)} className={`${inputCls} h-9 w-32`}>
          <option value="">All tabs</option>
          {data.tabs.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
        <button className={btnPrimaryCls} onClick={add} disabled={pending}>
          <Plus size={15} /> Add link
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-red-300/90">{error}</p>}
    </Card>
  )
}
