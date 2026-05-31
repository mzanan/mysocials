'use client'

import { useState, useTransition } from 'react'
import { deleteLink, updateLink } from '../actions'
import type { DashLink } from '@/types/dashboard'
import { useDashboardStore } from './DashboardStore'

export function useLinkRow(link: DashLink) {
  const { setLinks } = useDashboardStore()
  const [title, setTitle] = useState(link.title)
  const [url, setUrl] = useState(link.url)
  const [icon, setIcon] = useState(link.icon ?? '')
  const [tabId, setTabId] = useState(link.tabId ?? '')
  const [pending, startTransition] = useTransition()

  function save() {
    startTransition(async () => {
      const res = await updateLink(link.id, { title, url, icon: icon || null, tabId: tabId || null })
      if (res.ok) {
        setLinks((prev) =>
          prev.map((l) =>
            l.id === link.id ? { ...l, title, url, icon: icon || null, tabId: tabId || null } : l,
          ),
        )
      }
    })
  }

  function remove() {
    setLinks((prev) => prev.filter((l) => l.id !== link.id))
    deleteLink(link.id)
  }

  return { title, setTitle, url, setUrl, icon, setIcon, tabId, setTabId, pending, save, remove }
}
