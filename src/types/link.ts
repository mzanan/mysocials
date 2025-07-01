export interface Link {
  id: string
  user_id: string
  title: string
  url: string
  order: number
  created_at: string
  updated_at: string
}

export interface CreateLinkData {
  title: string
  url: string
}

export interface UpdateLinkData extends CreateLinkData {
  id: string
} 