export interface DashMedia {
  id: string
  kind: 'image' | 'video'
  url: string
  posterUrl: string | null
}

export interface DashTab {
  id: string
  label: string
  type: 'grid' | 'video'
  media: DashMedia[]
}

export interface DashLink {
  id: string
  tabId: string | null
  network: string | null
  handle: string | null
  title: string
  url: string
  icon: string | null
}

import type { Theme } from '@/lib/appearance'

export interface DashboardData {
  username: string
  displayName: string | null
  bio: string | null
  accent: string
  theme: Theme
  avatarUrl: string | null
  published: boolean
  subscriptionStatus: string | null
  instagramConnected: boolean
  tabs: DashTab[]
  links: DashLink[]
}
