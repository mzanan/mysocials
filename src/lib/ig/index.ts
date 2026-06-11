const IG_GRAPH = 'https://graph.instagram.com'
const IG_API_VERSION = 'v23.0'

export function instagramEnabled(): boolean {
  return Boolean(process.env.INSTAGRAM_APP_ID && process.env.INSTAGRAM_APP_SECRET)
}

function redirectUri(): string {
  return `${process.env.BETTER_AUTH_URL ?? ''}/api/import/instagram/callback`
}

export function getAuthorizationUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.INSTAGRAM_APP_ID ?? '',
    redirect_uri: redirectUri(),
    response_type: 'code',
    scope: 'instagram_business_basic',
    state,
  })
  return `https://www.instagram.com/oauth/authorize?${params.toString()}`
}

export async function exchangeCodeForToken(
  code: string,
): Promise<{ accessToken: string; userId: string }> {
  const res = await fetch('https://api.instagram.com/oauth/access_token', {
    method: 'POST',
    body: new URLSearchParams({
      client_id: process.env.INSTAGRAM_APP_ID ?? '',
      client_secret: process.env.INSTAGRAM_APP_SECRET ?? '',
      grant_type: 'authorization_code',
      redirect_uri: redirectUri(),
      code,
    }),
  })
  if (!res.ok) throw new Error(`IG token exchange failed: ${res.status}`)
  const json = (await res.json()) as { access_token: string; user_id: number | string }
  return { accessToken: json.access_token, userId: String(json.user_id) }
}

export async function getLongLivedToken(
  shortToken: string,
): Promise<{ accessToken: string; expiresAt: Date | null }> {
  const params = new URLSearchParams({
    grant_type: 'ig_exchange_token',
    client_secret: process.env.INSTAGRAM_APP_SECRET ?? '',
    access_token: shortToken,
  })
  const res = await fetch(`${IG_GRAPH}/access_token?${params.toString()}`)
  if (!res.ok) throw new Error(`IG long-lived token failed: ${res.status}`)
  const json = (await res.json()) as { access_token: string; expires_in?: number }
  return {
    accessToken: json.access_token,
    expiresAt: json.expires_in ? new Date(Date.now() + json.expires_in * 1000) : null,
  }
}

export async function fetchProfile(token: string): Promise<{
  id: string
  username: string | null
  profilePictureUrl: string | null
  accountType: string | null
}> {
  const params = new URLSearchParams({
    fields: 'id,username,profile_picture_url,account_type',
    access_token: token,
  })
  const res = await fetch(`${IG_GRAPH}/${IG_API_VERSION}/me?${params.toString()}`)
  if (!res.ok) throw new Error(`IG profile fetch failed: ${res.status}`)
  const json = (await res.json()) as {
    id: string
    username?: string
    profile_picture_url?: string
    account_type?: string
  }
  return {
    id: json.id,
    username: json.username ?? null,
    profilePictureUrl: json.profile_picture_url ?? null,
    accountType: json.account_type ?? null,
  }
}

export interface IgMedia {
  id: string
  mediaType: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM'
  mediaUrl: string | null
  thumbnailUrl: string | null
}

export async function fetchAllMedia(token: string, limit = 60): Promise<IgMedia[]> {
  const out: IgMedia[] = []
  let url: string | null = `${IG_GRAPH}/${IG_API_VERSION}/me/media?${new URLSearchParams({
    fields: 'id,media_type,media_url,thumbnail_url',
    access_token: token,
    limit: '50',
  }).toString()}`

  while (url && out.length < limit) {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`IG media fetch failed: ${res.status}`)
    const json = (await res.json()) as {
      data: Array<{
        id: string
        media_type: IgMedia['mediaType']
        media_url?: string
        thumbnail_url?: string
      }>
      paging?: { next?: string }
    }
    for (const m of json.data) {
      out.push({
        id: m.id,
        mediaType: m.media_type,
        mediaUrl: m.media_url ?? null,
        thumbnailUrl: m.thumbnail_url ?? null,
      })
    }
    url = json.paging?.next ?? null
  }
  return out.slice(0, limit)
}

export function stillUrl(m: IgMedia): string | null {
  return m.mediaType === 'VIDEO' ? m.thumbnailUrl : m.mediaUrl
}
