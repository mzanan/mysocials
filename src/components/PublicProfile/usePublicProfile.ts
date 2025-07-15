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
    avatar_url: 'https://pbs.twimg.com/profile_images/1871107424444395520/h2d-TH32_400x400.jpg',
    bio: 'Digital Nomad from Argentina, living in Vietnam. Crypto technical trader student.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    username_updated_at: new Date().toISOString(),
  },
  links: [
    { id: '1', title: 'Instagram', url: 'https://instagram.com/matizanan'},
    { id: '2', title: 'Tiktok', url: 'https://tiktok.com/@mzanan0'},
    { id: '3', title: 'X', url: 'https://x.com/mzanan'},
    { id: '4', title: 'Twitch', url: 'https://twitch.tv/gvtnomad'},
    { id: '5', title: 'Youtube', url: 'https://www.youtube.com/@GVTNomadCryptoTrading'},
    { id: '6', title: 'Facebook', url: 'https://www.facebook.com/groups/570791134308265/'},
    { id: '7', title: 'GVTNomad', url: 'https://gvtnomad.com/p/GVT13C89', icon_url: 'https://gvtnomad.com/gvtnomad_logo.svg'},
    { id: '8', title: 'TraderNaut', url: 'https://www.tradernaut.xyz', icon_url: 'https://gvtnomad.com/gvtnomad_logo.svg'},
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

