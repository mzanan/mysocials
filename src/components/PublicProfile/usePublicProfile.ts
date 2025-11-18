'use client'

import { Link } from '@/types/link'
import { Profile } from '@/types/profile'

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
    { id: '1', title: 'Instagram', url: 'https://instagram.com/matizanan'},
    { id: '2', title: 'Tiktok', url: 'https://tiktok.com/@mzanan0'},
    { id: '3', title: 'X', url: 'https://x.com/mzanan'},
    { id: '4', title: 'Youtube', url: 'https://www.youtube.com/@gvtnomad'},
    { id: '5', title: 'GVTNomad', url: 'https://gvtnomad.com/p/GVT13C89', icon_url: 'https://gvtnomad.com/gvtnomad_logo.svg'},
    { id: '6', title: 'TraderNaut', url: 'https://www.tradernaut.xyz', icon_url: 'https://gvtnomad.com/gvtnomad_logo.svg'},
  ]
}

export function usePublicProfile() {
  const handleLinkClick = (linkId: string) => {
    const link = data.links.find(l => l.id === linkId)
    if (link) {
      window.open(link.url, '_blank', 'noopener,noreferrer')
    }
  }

  return {
    profile: data.profile,
    links: data.links,
    handleLinkClick
  }
} 

