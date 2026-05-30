'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { deleteLink, updateLink } from '../actions'
import type { DashLink } from '@/types/dashboard'

export function useLinkRow(link: DashLink) {
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

  function remove() {
    deleteLink(link.id).then(() => router.refresh())
  }

  return { title, setTitle, url, setUrl, icon, setIcon, tabId, setTabId, pending, save, remove }
}
