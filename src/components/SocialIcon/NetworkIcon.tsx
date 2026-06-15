import {
  AtSign,
  Cloud,
  Facebook,
  Ghost,
  Github,
  Instagram,
  Link2,
  Linkedin,
  MessageCircle,
  Music2,
  Send,
  Twitch,
  Twitter,
  Youtube,
  type LucideIcon,
} from 'lucide-react'
import type { NetworkSlug } from '@/lib/networks'

function TikTok({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43V8.92a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.84-.35z" />
    </svg>
  )
}

const MAP: Partial<Record<NetworkSlug, LucideIcon>> = {
  instagram: Instagram,
  twitter: Twitter,
  youtube: Youtube,
  linkedin: Linkedin,
  threads: AtSign,
  facebook: Facebook,
  snapchat: Ghost,
  spotify: Music2,
  soundcloud: Cloud,
  appleMusic: Music2,
  github: Github,
  twitch: Twitch,
  discord: MessageCircle,
  telegram: Send,
}

export function NetworkIcon({ slug, size = 20 }: { slug: NetworkSlug; size?: number }) {
  if (slug === 'tiktok') return <TikTok size={size} />
  const Icon = MAP[slug] ?? Link2
  return <Icon size={size} strokeWidth={1.8} />
}
