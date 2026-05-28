'use client'

import { useState, useMemo } from 'react'
import { Link } from '@/types/link'
import { Profile, Category } from '@/types/profile'

export const iconContainerClasses = "w-8 h-8 flex items-center justify-center"

interface PublicProfileData {
  profile: Profile
  links: Link[]
}

const data: PublicProfileData = {
  profile: {
    id: "1",
    full_name: "Matias Zanan",
    avatar_url: "/avatar.webp",
    bios: {
      Personal: "✈  Digital Nomad",
      Dev: "💻 Full Stack Developer",
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
    },
    {
      title: "Tiktok",
      url: "https://www.tiktok.com/@matiasenasia",
      category: "Personal",
    },
    {
      title: "Youtube",
      url: "https://www.youtube.com/@PerdidoenAsia/shorts",
      category: "Personal",
    },
    {
      title: "Ecommerce Landing",
      url: "https://landing.itsmatias.com",
      icon: "shopping-bag",
      category: "Dev",
    },
    {
      title: "Ecommerce",
      url: "https://ecommerce.itsmatias.com",
      icon: "shopping-cart",
      category: "Dev",
    },
    {
      title: "My Dev Portfolio",
      url: "https://itsmatias.com",
      icon: "code",
      category: "Dev",
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

