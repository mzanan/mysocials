'use client'

import { useState } from 'react'
import type { LinkPublic, ProfilePublic, TabPublic } from '@/types/profile'

export const iconContainerClasses = 'w-8 h-8 flex items-center justify-center'

export function usePublicProfile(profile: ProfilePublic) {
  const tabs = profile.tabs
  const [activeTabId, setActiveTabId] = useState<string>(tabs[0]?.id ?? '')

  const activeTab: TabPublic | undefined = tabs.find((t) => t.id === activeTabId) ?? tabs[0]
  const links: LinkPublic[] = activeTab?.links ?? []

  const handleLinkClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return { profile, tabs, activeTab, activeTabId, setActiveTabId, links, handleLinkClick }
}
