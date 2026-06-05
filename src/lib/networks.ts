export const NETWORKS = {
  instagram: { label: 'Instagram', baseUrl: 'https://instagram.com/' },
  twitter: { label: 'X (Twitter)', baseUrl: 'https://x.com/' },
  tiktok: { label: 'TikTok', baseUrl: 'https://tiktok.com/@' },
  youtube: { label: 'YouTube', baseUrl: 'https://youtube.com/@' },
  linkedin: { label: 'LinkedIn', baseUrl: 'https://linkedin.com/in/' },
  threads: { label: 'Threads', baseUrl: 'https://threads.net/@' },
  facebook: { label: 'Facebook', baseUrl: 'https://facebook.com/' },
  snapchat: { label: 'Snapchat', baseUrl: 'https://snapchat.com/add/' },
  pinterest: { label: 'Pinterest', baseUrl: 'https://pinterest.com/' },
  spotify: { label: 'Spotify', baseUrl: 'https://open.spotify.com/user/' },
  soundcloud: { label: 'SoundCloud', baseUrl: 'https://soundcloud.com/' },
  appleMusic: { label: 'Apple Music', baseUrl: 'https://music.apple.com/profile/' },
  github: { label: 'GitHub', baseUrl: 'https://github.com/' },
  twitch: { label: 'Twitch', baseUrl: 'https://twitch.tv/' },
  discord: { label: 'Discord', baseUrl: 'https://discord.gg/' },
  telegram: { label: 'Telegram', baseUrl: 'https://t.me/' },
} as const

export type NetworkSlug = keyof typeof NETWORKS

export const NETWORK_SLUGS = Object.keys(NETWORKS) as NetworkSlug[]

export function isNetworkSlug(value: string): value is NetworkSlug {
  return value in NETWORKS
}

function normalizeHandle(handle: string): string {
  return handle.trim().replace(/^@+/, '')
}

export function buildLinkUrl(slug: NetworkSlug, handle: string): string {
  return `${NETWORKS[slug].baseUrl}${normalizeHandle(handle)}`
}

export function buildLinkTitle(handle: string): string {
  return `@${normalizeHandle(handle)}`
}
