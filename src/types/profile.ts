export type Category = 'Personal' | 'Valorant' | 'Dev' | 'Trading'

export interface Profile {
  id: string
  full_name?: string
  avatar_url?: string
  bios?: Record<Category, string>
  username_updated_at?: string
  created_at: string
  updated_at: string
}
 