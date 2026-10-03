import { SITE_URL } from '@/lib/site'
import type { ProfilePublic } from '@/types/profile'

export const SITE_NAME = 'mySocials'

export const AI_CRAWLERS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-SearchBot',
  'Claude-User',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'Applebot-Extended',
]

export const PRIVATE_PATHS = ['/api/', '/dashboard', '/admin', '/preview']

export const siteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  url: SITE_URL,
  name: SITE_NAME,
  description: 'One beautiful page for all your links.',
  inLanguage: 'en',
  publisher: { '@type': 'Person', name: 'Matias Zanan', url: 'https://itsmatias.com' },
}

export function profileJsonLd(profile: ProfilePublic) {
  const url = `${SITE_URL}/${profile.username}`
  const links = profile.tabs.flatMap((tab) => tab.links.map((link) => link.url))
  const sameAs = [...new Set(links.filter((link) => /^https?:\/\//.test(link)))]
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    '@id': url,
    url,
    isPartOf: { '@id': `${SITE_URL}/#website` },
    mainEntity: {
      '@type': 'Person',
      name: profile.displayName || profile.username,
      alternateName: `@${profile.username}`,
      ...(profile.bio ? { description: profile.bio } : {}),
      ...(profile.avatarUrl ? { image: profile.avatarUrl } : {}),
      ...(sameAs.length > 0 ? { sameAs } : {}),
    },
  }
}
