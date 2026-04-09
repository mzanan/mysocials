'use client'

import { useState, useMemo } from 'react'
import { Link } from '@/types/link'
import { Profile, Category } from '@/types/profile'
import {
  PersonalBackground,
  DevBackground,
} from '../Backgrounds'

export const backgrounds = [
  { key: 'Personal', Component: PersonalBackground },
  { key: 'Dev', Component: DevBackground },
] as const

export const iconContainerClasses = "w-8 h-8 flex items-center justify-center"

interface PublicProfileData {
  profile: Profile
  links: Link[]
}

const data: PublicProfileData = {
  profile: {
    id: "1",
    full_name: "Matias Zanan",
    avatar_url:
      "https://pbs.twimg.com/profile_images/1963563791003914243/4yYUGPT5_400x400.jpg",
    bios: {
      Personal: "✈  Digital Nomad",
      Valorant: "🎮 Valorant Streamer",
      Dev: "💻 Full Stack Developer",
      Trading: "📈 Crypto Trader & Analyst",
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    username_updated_at: new Date().toISOString(),
  },
  links: [
    {
      title: "Instagram",
      url: "https://instagram.com/matiasenasia",
      category: "Personal",
      tooltip: "My Instagram Profile",
    },
    {
      title: "Tiktok",
      url: "https://www.tiktok.com/@matiasenasia",
      category: "Personal",
      tooltip: "My TikTok Profile",
    },
    {
      title: "Youtube",
      url: "https://www.youtube.com/@PerdidoenAsia/shorts",
      category: "Personal",
      tooltip: "My YouTube Profile",
    },

    {
      title: "Twitch",
      url: "https://twitch.tv/mzanan",
      category: "Valorant",
      tooltip: "Live Streaming",
    },
    {
      title: "Tiktok",
      url: "https://tiktok.com/@mzanan0",
      category: "Valorant",
      tooltip: "Daily Content",
    },

    {
      title: "Ecommerce Landing",
      url: "https://landing.itsmatias.com",
      icon: "🛍️",
      category: "Dev",
      tooltip: "Ecommerce Landing page",
    },
    {
      title: "Ecommerce",
      url: "https://ecommerce.itsmatias.com",
      icon: "🛒",
      category: "Dev",
      tooltip: "Full Online Store",
    },
    {
      title: "My Dev Portfolio",
      url: "https://itsmatias.com",
      icon: "🤓",
      category: "Dev",
      tooltip: "My Dev Portfolio",
    },

    {
      title: "Twitch",
      url: "https://twitch.tv/mzanann",
      category: "Trading",
      tooltip: "Crypto Trading Live Streaming",
    },
    {
      title: "YouTube",
      url: "https://www.youtube.com/@MatiasTrading",
      category: "Trading",
      tooltip: "Trading Channel Recordings",
    },
  ],
};

const categories: Category[] = ['Personal', 'Dev']

export function usePublicProfile() {
  const [activeCategory, setActiveCategory] = useState<Category>('Personal')

  const filteredLinks = useMemo(() => {
    return data.links.filter(link => link.category === activeCategory)
  }, [activeCategory])

  const handleLinkClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const currentBio = data.profile.bios?.[activeCategory] || ''

  return {
    profile: data.profile,
    bio: currentBio,
    links: filteredLinks,
    categories,
    activeCategory,
    setActiveCategory,
    handleLinkClick
  }
}

