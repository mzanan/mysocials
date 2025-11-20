'use client'

import { useState, useMemo } from 'react'
import { Link } from '@/types/link'
import { Profile } from '@/types/profile'

type Category = 'Personal' | 'Valorant' | 'Dev' | 'Trading'

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
    { title: 'Instagram', url: 'https://instagram.com/matizanan', category: 'Personal', tooltip: 'My Instagram profile' },
    { title: 'X', url: 'https://x.com/mzanan', category: 'Personal', tooltip: 'My X profile' },

    { title: 'Twitch', url: 'https://twitch.tv/mzanan', category: 'Valorant', tooltip: 'Live streaming' },
    { title: 'Tiktok', url: 'https://tiktok.com/@mzanan0', category: 'Valorant', tooltip: 'Daily content' },

    { title: 'Ecommerce Landing', url: 'https://ecommerce-landing-kappa.vercel.app/', icon: '🛍️', category: 'Dev', tooltip: 'Ecommerce landing page' },
    { title: 'Ecommerce', url: 'https://ecommerce-six-peach-14.vercel.app/', icon: '🛒', category: 'Dev', tooltip: 'Full online store' },
    { title: 'Portfolio Coming Soon', url: '/', icon: '🤓', category: 'Dev', disabled: true, tooltip: 'Coming soon' },

    { title: 'YouTube', url: 'https://www.youtube.com/@gvtnomad', category: 'Trading', tooltip: 'YouTube channel' },
    { title: 'GVTNomad', url: 'https://gvtnomad.com/p/GVT13C89', icon_url: 'https://gvtnomad.com/gvtnomad_logo.svg', category: 'Trading', tooltip: 'My referral code' },
    { title: 'TraderNaut', url: 'https://www.tradernaut.xyz', icon_url: 'https://gvtnomad.com/gvtnomad_logo.svg', category: 'Trading', tooltip: 'Trading tool' },
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

