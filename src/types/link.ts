export interface Link {
  title: string
  url: string
  icon?: string
  icon_url?: string
  category: 'Personal' | 'Valorant' | 'Dev' | 'Trading'
  disabled?: boolean
  tooltip?: string
  transparent?: boolean
} 