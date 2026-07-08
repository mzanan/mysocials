'use client'

import { useState, useTransition } from 'react'
import { deleteLink, updateLink } from '../actions'
import { toast } from '@/lib/toast'
import type { DashLink } from '@/types/dashboard'
import { useDashboardStore } from './DashboardStore'

export function useLinkRow(link: DashLink) {
  const { links, setLinks } = useDashboardStore()
  const [network, setNetwork] = useState(link.network ?? '')
  const [handle, setHandle] = useState(link.handle ?? '')
  const [title, setTitle] = useState(link.title)
  const [url, setUrl] = useState(link.url)
  const [icon, setIcon] = useState(link.icon ?? '')
  const [tabId, setTabId] = useState(link.tabId ?? '')
  const [pending, startTransition] = useTransition()

  function save() {
    startTransition(async () => {
      const payload = {
        tabId: tabId || null,
        network: network || null,
        handle: handle || null,
        title,
        url,
        icon: icon || null,
      }
      const res = await updateLink(link.id, payload)
      if (res.ok) {
        setLinks((prev) =>
          prev.map((l) =>
            l.id === link.id
              ? {
                  ...l,
                  tabId: tabId || null,
                  network: network || null,
                  handle: handle || null,
                  title,
                  url,
                  icon: icon || null,
                }
              : l,
          ),
        )
      }
    })
  }

  function setIconAndSave(next: string | null) {
    setIcon(next ?? '')
    startTransition(async () => {
      const payload = {
        tabId: tabId || null,
        network: network || null,
        handle: handle || null,
        title,
        url,
        icon: next,
      }
      const res = await updateLink(link.id, payload)
      if (res.ok) {
        setLinks((prev) =>
          prev.map((l) => (l.id === link.id ? { ...l, icon: next } : l)),
        )
      } else {
        setIcon(link.icon ?? '')
        toast.error(res.error ?? 'Could not update the icon')
      }
    })
  }

  function remove() {
    const snapshot = links
    setLinks((prev) => prev.filter((l) => l.id !== link.id))
    startTransition(async () => {
      const res = await deleteLink(link.id)
      if (!res.ok) {
        setLinks(snapshot)
        toast.error(res.error ?? 'Could not delete the link')
      }
    })
  }

  return {
    network,
    setNetwork,
    handle,
    setHandle,
    title,
    setTitle,
    url,
    setUrl,
    icon,
    setIcon,
    setIconAndSave,
    tabId,
    setTabId,
    pending,
    save,
    remove,
  }
}
