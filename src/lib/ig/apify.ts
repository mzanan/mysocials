import type { IgMedia, IgProfile } from './types'

const APIFY_BASE = 'https://api.apify.com/v2'
const RUN_TIMEOUT_MS = 50_000

export function apifyConfigured(): boolean {
  return Boolean(process.env.APIFY_TOKEN)
}

function apifyActor(): string {
  return process.env.APIFY_ACTOR ?? 'apify~instagram-scraper'
}

function normalizeHandle(input: string): string {
  let h = input.trim()
  const fromUrl = h.match(/instagram\.com\/([^/?#]+)/i)
  if (fromUrl) h = fromUrl[1]
  if (h.startsWith('@')) h = h.slice(1)
  return h.replace(/\/+$/, '').toLowerCase()
}

function profileUrl(handle: string): string {
  return `https://www.instagram.com/${handle}/`
}

async function runActor<T>(input: unknown): Promise<T[]> {
  const token = process.env.APIFY_TOKEN ?? ''
  const url = `${APIFY_BASE}/acts/${apifyActor()}/run-sync-get-dataset-items?token=${encodeURIComponent(token)}`
  const signal = AbortSignal.timeout(RUN_TIMEOUT_MS)
  let res: Response
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(input),
      signal,
    })
  } catch {
    throw new Error('Instagram is taking too long to respond. Please try again.')
  }
  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(`Instagram fetch failed (${res.status})${detail ? `: ${detail.slice(0, 200)}` : ''}`)
  }
  const json = (await res.json().catch(() => null)) as T[] | null
  return Array.isArray(json) ? json : []
}

interface ApifyChild {
  displayUrl?: string
  type?: string
}

interface ApifyPost {
  id?: string
  shortCode?: string
  type?: string
  displayUrl?: string
  childPosts?: ApifyChild[]
}

interface ApifyDetails {
  id?: string | number
  username?: string
  profilePicUrl?: string
  private?: boolean
}

function toMedia(id: string, type: string | undefined, url: string): IgMedia {
  const isVideo = type === 'Video'
  return {
    id,
    mediaType: isVideo ? 'VIDEO' : 'IMAGE',
    mediaUrl: isVideo ? null : url,
    thumbnailUrl: url,
  }
}

export async function fetchApifyMedia(username: string | null, limit = 60): Promise<IgMedia[]> {
  if (!username) throw new Error('Instagram username missing. Reconnect Instagram.')
  const handle = normalizeHandle(username)
  const posts = await runActor<ApifyPost>({
    resultsType: 'posts',
    directUrls: [profileUrl(handle)],
    resultsLimit: limit,
    addParentData: false,
  })

  const out: IgMedia[] = []
  for (const post of posts) {
    if (!post) continue
    const base = post.shortCode ?? post.id
    if (post.type === 'Sidecar' && post.childPosts?.length) {
      post.childPosts.forEach((child, idx) => {
        if (child?.displayUrl) out.push(toMedia(`${base ?? 'post'}_${idx}`, child.type, child.displayUrl))
      })
      continue
    }
    if (post.displayUrl) out.push(toMedia(base ?? post.displayUrl, post.type, post.displayUrl))
  }
  return out
}

export async function fetchApifyProfile(username: string): Promise<IgProfile> {
  const handle = normalizeHandle(username)
  const items = await runActor<ApifyDetails>({
    resultsType: 'details',
    directUrls: [profileUrl(handle)],
  })
  const p = items[0]
  if (!p || (!p.username && p.id == null)) {
    throw new Error("We couldn't find that Instagram profile. Check the username.")
  }
  if (p.private) {
    throw new Error('That Instagram profile is private. Only public profiles can be imported.')
  }
  return {
    id: String(p.id ?? handle),
    username: p.username ?? handle,
    profilePictureUrl: p.profilePicUrl ?? null,
    accountType: null,
  }
}
