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
  gridSize: 'small' | 'medium' | 'large'
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

export interface DashboardData {
  username: string
  displayName: string | null
  bio: string | null
  accent: string
  avatarUrl: string | null
  published: boolean
  subscriptionStatus: string | null
  trialEndsAt: number | null
  instagramConnected: boolean
  tabs: DashTab[]
  links: DashLink[]
}
