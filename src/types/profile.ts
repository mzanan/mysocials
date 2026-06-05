export interface LinkPublic {
  title: string
  url: string
  icon?: string | null
  iconUrl?: string | null
}

export interface MediaPublic {
  url: string
  posterUrl?: string | null
  kind: 'image' | 'video'
  width?: number | null
  height?: number | null
}

export type GridSize = 'small' | 'medium' | 'large'

export interface TabPublic {
  id: string
  label: string
  type: 'grid' | 'video'
  gridSize: GridSize
  media: MediaPublic[]
  links: LinkPublic[]
}

export interface ProfilePublic {
  username: string
  displayName: string | null
  avatarUrl: string | null
  bio: string | null
  accent: string
  tabs: TabPublic[]
}

export interface SuspendedProfilePublic {
  status: 'suspended'
  username: string
  displayName: string | null
  avatarUrl: string | null
  accent: string
}

export type PublicProfileResult = ProfilePublic | SuspendedProfilePublic

export function isSuspended(
  p: PublicProfileResult,
): p is SuspendedProfilePublic {
  return 'status' in p && p.status === 'suspended'
}
