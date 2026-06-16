import { apifyConfigured, fetchApifyMedia } from './apify'
import { fetchOfficialMedia, officialConfigured } from './official'
import type { ImportProvider } from './types'

export type IgMode = 'apify' | 'official'

export type { IgMedia, IgMediaType, IgProfile, IgConnectionRef, ImportProvider } from './types'
export { stillUrl } from './types'
export { apifyConfigured, fetchApifyMedia, fetchApifyProfile } from './apify'
export {
  IgAuthError,
  exchangeCodeForToken,
  fetchProfile,
  getAuthorizationUrl,
  getLongLivedToken,
  officialConfigured,
} from './official'

export function importEnabled(): boolean {
  return apifyConfigured() || officialConfigured()
}

export function igMode(): IgMode | null {
  const forced = process.env.IG_PROVIDER
  if (forced === 'apify') return apifyConfigured() ? 'apify' : null
  if (forced === 'official') return officialConfigured() ? 'official' : null
  if (apifyConfigured()) return 'apify'
  if (officialConfigured()) return 'official'
  return null
}

export function igProvider(): ImportProvider {
  const mode = igMode()
  if (mode === 'apify') return { fetchMedia: (conn, limit) => fetchApifyMedia(conn.username, limit) }
  if (mode === 'official') return { fetchMedia: (conn, limit) => fetchOfficialMedia(conn.accessToken, limit) }
  throw new Error('Instagram import not configured')
}
