'use client'

import { useState, useMemo } from 'react'
import { Link } from '@/types/link'
import { Profile } from '@/types/profile'
import {
  PersonalBackground,
  ValorantBackground,
  DevBackground,
  TradingBackground,
} from './Backgrounds'

export const backgrounds = [
  { key: 'Personal', Component: PersonalBackground },
  { key: 'Valorant', Component: ValorantBackground },
  { key: 'Dev', Component: DevBackground },
  { key: 'Trading', Component: TradingBackground },
] as const

export const iconContainerClasses = "w-8 h-8 flex items-center justify-center"

export type Category = 'Personal' | 'Valorant' | 'Dev' | 'Trading'

interface PublicProfileData {
  profile: Profile
  links: Link[]
}

const data: PublicProfileData = {
  profile: {
    id: '1',
    full_name: 'Matias Zanan',
    avatar_url: 'https://pbs.twimg.com/profile_images/1963563791003914243/4yYUGPT5_400x400.jpg',
    bio: '✈  Digital Nomad · 📍 From Argentina to the world · \n ₿ Crypto trader · 🤓 Student of @gvtnomad',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    username_updated_at: new Date().toISOString(),
  },
  links: [
    { title: 'Instagram', url: 'https://instagram.com/matizanan', category: 'Personal', tooltip: 'My Instagram Profile' },
    { title: 'X', url: 'https://x.com/mzanan', category: 'Personal', tooltip: 'My X Profile' },
    { title: '', url: '', category: 'Personal', transparent: true, tooltip: '' },

    { title: 'Twitch', url: 'https://twitch.tv/mzanan', category: 'Valorant', tooltip: 'Live Streaming' },
    { title: 'Tiktok', url: 'https://tiktok.com/@mzanan0', category: 'Valorant', tooltip: 'Daily Content' },
    { title: '', url: '', category: 'Valorant', transparent: true, tooltip: '' },

    { title: 'Ecommerce Landing', url: 'https://landing.itsmatias.com', icon: '🛍️', category: 'Dev', tooltip: 'Ecommerce Landing page' },
    { title: 'Ecommerce', url: 'https://ecommerce.itsmatias.com', icon: '🛒', category: 'Dev', tooltip: 'Full Online Store' },
    { title: 'My Dev Portfolio', url: 'https://itsmatias.com', icon: '🤓', category: 'Dev', tooltip: 'My Dev Portfolio' },

    { title: 'Twitch', url: 'https://twitch.tv/mzanann', category: 'Trading', tooltip: 'Crypto Trading Live Streaming' },
    { title: 'YouTube', url: 'https://www.youtube.com/@MatiasTrading', category: 'Trading', tooltip: 'Trading Channel Recordings' },
    { title: 'GVTNomad', url: 'https://gvtnomad.com/p/GVT13C89', icon_url: 'https://gvtnomad.com/gvtnomad_logo.svg', category: 'Trading', tooltip: 'Join GVTNomad' },
  ]
}

const categories: Category[] = ['Personal', 'Valorant', 'Dev', 'Trading']

export function usePublicProfile() {
  const [activeCategory, setActiveCategory] = useState<Category>('Personal')

  const filteredLinks = useMemo(() => {
    return data.links.filter(link => link.category === activeCategory)
  }, [activeCategory])

  const handleLinkClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return {
    profile: data.profile,
    links: filteredLinks,
    categories,
    activeCategory,
    setActiveCategory,
    handleLinkClick
  }
} 

