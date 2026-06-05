'use client'

import { useState, useTransition } from 'react'
import { deleteLink, updateLink } from '../actions'
import type { DashLink } from '@/types/dashboard'
import { useDashboardStore } from './DashboardStore'

export function useLinkRow(link: DashLink) {
  const { setLinks } = useDashboardStore()
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

  function remove() {
    setLinks((prev) => prev.filter((l) => l.id !== link.id))
    deleteLink(link.id)
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
    tabId,
    setTabId,
    pending,
    save,
    remove,
  }
}
