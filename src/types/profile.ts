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

export interface TabPublic {
  id: string
  label: string
  type: 'grid' | 'video'
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
