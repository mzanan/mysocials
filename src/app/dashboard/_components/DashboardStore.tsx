'use client'

import { createContext, useContext, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react'
import type { DashLink, DashMedia, DashTab, DashboardData } from '@/types/dashboard'

type Store = {
  tabs: DashTab[]
  links: DashLink[]
  setTabs: Dispatch<SetStateAction<DashTab[]>>
  setLinks: Dispatch<SetStateAction<DashLink[]>>
  patchTab: (id: string, fields: Partial<Pick<DashTab, 'label' | 'type' | 'gridSize'>>) => void
  setTabMedia: (tabId: string, update: (media: DashMedia[]) => DashMedia[]) => void
}

const DashboardContext = createContext<Store | null>(null)

export function DashboardStore({ initial, children }: { initial: DashboardData; children: ReactNode }) {
  const [tabs, setTabs] = useState<DashTab[]>(initial.tabs)
  const [links, setLinks] = useState<DashLink[]>(initial.links)

  function patchTab(id: string, fields: Partial<Pick<DashTab, 'label' | 'type' | 'gridSize'>>) {
    setTabs((prev) => prev.map((t) => (t.id === id ? { ...t, ...fields } : t)))
  }

  function setTabMedia(tabId: string, update: (media: DashMedia[]) => DashMedia[]) {
    setTabs((prev) => prev.map((t) => (t.id === tabId ? { ...t, media: update(t.media) } : t)))
  }

  return (
    <DashboardContext.Provider value={{ tabs, links, setTabs, setLinks, patchTab, setTabMedia }}>
      {children}
    </DashboardContext.Provider>
  )
}

export function useDashboardStore() {
  const ctx = useContext(DashboardContext)
  if (!ctx) throw new Error('useDashboardStore must be used within DashboardStore')
  return ctx
}
