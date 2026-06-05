'use server'

import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { and, eq, inArray, sql } from 'drizzle-orm'
import { z } from 'zod'

import { auth } from '@/lib/auth'
import { setAvatarFromBuffer } from '@/lib/avatar'
import { db } from '@/lib/db'
import { ig_connections, links, media, profiles, tabs } from '@/lib/db/schema'
import { fetchProfile } from '@/lib/ig'
import { buildLinkTitle, buildLinkUrl, isNetworkSlug } from '@/lib/networks'
import { isUsernameAvailable } from '@/lib/profile/username'
import { requirePublishAccess } from '@/lib/subscription'
import { storage } from '@/lib/storage'
import type { DashLink, DashTab } from '@/types/dashboard'

type Result = { ok: true } | { ok: false; error: string }
type TabResult = { ok: true; tab: DashTab } | { ok: false; error: string }
type LinkResult = { ok: true; link: DashLink } | { ok: false; error: string }

async function requireUserId(): Promise<string> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) throw new Error('Unauthorized')
  return session.user.id
}

function revalidate() {
  revalidatePath('/dashboard')
}

const profileSchema = z.object({
  displayName: z.string().trim().max(60).nullable(),
  bio: z.string().trim().max(280).nullable(),
  accent: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Invalid color'),
})

export async function updateProfile(input: z.infer<typeof profileSchema>): Promise<Result> {
  const uid = await requireUserId()
  const parsed = profileSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message }
  await db
    .update(profiles)
    .set({
      display_name: parsed.data.displayName || null,
      bio: parsed.data.bio || null,
      accent: parsed.data.accent,
    })
    .where(eq(profiles.user_id, uid))
  revalidate()
  return { ok: true }
}

export async function updateUsername(username: string): Promise<Result> {
  const uid = await requireUserId()
  const lower = username.trim().toLowerCase()
  if (!(await isUsernameAvailable(lower, uid))) {
    return { ok: false, error: 'Username is taken or invalid' }
  }
  await db.update(profiles).set({ username: lower }).where(eq(profiles.user_id, uid))
  revalidate()
  return { ok: true }
}

type AvatarResult = { ok: true; url: string } | { ok: false; error: string }

export async function setAvatarFromInstagram(): Promise<AvatarResult> {
  const uid = await requireUserId()
  const conn = await db.query.ig_connections.findFirst({
    where: eq(ig_connections.user_id, uid),
  })
  if (!conn) return { ok: false, error: 'Instagram not connected' }
  try {
    const profile = await fetchProfile(conn.access_token)
    if (!profile.profilePictureUrl) return { ok: false, error: 'No Instagram profile picture' }
    const res = await fetch(profile.profilePictureUrl)
    if (!res.ok) return { ok: false, error: 'Could not fetch Instagram picture' }
    const url = await setAvatarFromBuffer(uid, Buffer.from(await res.arrayBuffer()))
    revalidate()
    return { ok: true, url }
  } catch {
    return { ok: false, error: 'Instagram avatar fetch failed' }
  }
}

export async function setAvatarFromMedia(mediaId: string): Promise<AvatarResult> {
  const uid = await requireUserId()
  const row = await db.query.media.findFirst({
    where: and(eq(media.id, mediaId), eq(media.kind, 'image')),
    with: { tab: { columns: { user_id: true } } },
  })
  if (!row || row.tab.user_id !== uid) return { ok: false, error: 'Photo not found' }
  try {
    const res = await fetch(row.url)
    if (!res.ok) return { ok: false, error: 'Could not load photo' }
    const url = await setAvatarFromBuffer(uid, Buffer.from(await res.arrayBuffer()))
    revalidate()
    return { ok: true, url }
  } catch {
    return { ok: false, error: 'Avatar update failed' }
  }
}

export async function setPublished(published: boolean): Promise<Result> {
  const uid = await requireUserId()
  if (published) {
    const gate = await requirePublishAccess(uid)
    if (!gate.ok) return { ok: false, error: gate.reason }
  }
  await db.update(profiles).set({ published }).where(eq(profiles.user_id, uid))
  revalidate()
  return { ok: true }
}

const tabSchema = z.object({
  label: z.string().trim().min(1).max(24),
  type: z.enum(['grid', 'video']),
  gridSize: z.enum(['small', 'medium', 'large']).optional(),
})

export async function createTab(input: z.infer<typeof tabSchema>): Promise<TabResult> {
  const uid = await requireUserId()
  const parsed = tabSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message }
  const [{ max }] = await db
    .select({ max: sql<number>`coalesce(max(${tabs.position}), -1)` })
    .from(tabs)
    .where(eq(tabs.user_id, uid))
  const [row] = await db
    .insert(tabs)
    .values({
      user_id: uid,
      label: parsed.data.label,
      type: parsed.data.type,
      grid_size: parsed.data.gridSize ?? 'medium',
      position: (max ?? -1) + 1,
    })
    .returning()
  revalidate()
  return {
    ok: true,
    tab: {
      id: row.id,
      label: row.label,
      type: row.type,
      gridSize: row.grid_size,
      media: [],
    },
  }
}

export async function updateTab(
  id: string,
  input: z.infer<typeof tabSchema>,
): Promise<Result> {
  const uid = await requireUserId()
  const parsed = tabSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message }
  const patch: { label: string; type: 'grid' | 'video'; grid_size?: 'small' | 'medium' | 'large' } = {
    label: parsed.data.label,
    type: parsed.data.type,
  }
  if (parsed.data.gridSize) patch.grid_size = parsed.data.gridSize
  await db
    .update(tabs)
    .set(patch)
    .where(and(eq(tabs.id, id), eq(tabs.user_id, uid)))
  revalidate()
  return { ok: true }
}

export async function deleteTab(id: string): Promise<Result> {
  const uid = await requireUserId()
  const owned = await db.query.tabs.findFirst({
    where: and(eq(tabs.id, id), eq(tabs.user_id, uid)),
    with: { media: true },
  })
  if (!owned) return { ok: false, error: 'Tab not found' }
  await Promise.all(
    owned.media.flatMap((m) =>
      [m.r2_key, m.poster_key].filter(Boolean).map((k) => storage.delete(k as string)),
    ),
  )
  await db.delete(tabs).where(and(eq(tabs.id, id), eq(tabs.user_id, uid)))
  revalidate()
  return { ok: true }
}

export async function reorderTabs(orderedIds: string[]): Promise<Result> {
  const uid = await requireUserId()
  await Promise.all(
    orderedIds.map((id, i) =>
      db.update(tabs).set({ position: i }).where(and(eq(tabs.id, id), eq(tabs.user_id, uid))),
    ),
  )
  revalidate()
  return { ok: true }
}

async function assertTabOwned(tabId: string, uid: string): Promise<boolean> {
  const t = await db.query.tabs.findFirst({
    where: and(eq(tabs.id, tabId), eq(tabs.user_id, uid)),
  })
  return Boolean(t)
}

export async function deleteMedia(id: string): Promise<Result> {
  const uid = await requireUserId()
  const row = await db.query.media.findFirst({
    where: eq(media.id, id),
    with: { tab: true },
  })
  if (!row || row.tab.user_id !== uid) return { ok: false, error: 'Not found' }
  await Promise.all(
    [row.r2_key, row.poster_key].filter(Boolean).map((k) => storage.delete(k as string)),
  )
  await db.delete(media).where(eq(media.id, id))
  revalidate()
  return { ok: true }
}

export async function reorderMedia(tabId: string, orderedIds: string[]): Promise<Result> {
  const uid = await requireUserId()
  if (!(await assertTabOwned(tabId, uid))) return { ok: false, error: 'Tab not found' }
  await Promise.all(
    orderedIds.map((id, i) =>
      db.update(media).set({ position: i }).where(and(eq(media.id, id), eq(media.tab_id, tabId))),
    ),
  )
  revalidate()
  return { ok: true }
}

const linkSchema = z
  .object({
    tabId: z.string().nullable(),
    network: z.string().trim().nullable(),
    handle: z.string().trim().nullable(),
    title: z.string().trim().max(40).optional(),
    url: z.string().trim().max(500).optional(),
    icon: z.string().trim().max(40).nullable(),
  })
  .superRefine((data, ctx) => {
    if (data.network) {
      if (!isNetworkSlug(data.network)) {
        ctx.addIssue({ code: 'custom', message: 'Unknown network', path: ['network'] })
      }
      if (!data.handle || !data.handle.trim()) {
        ctx.addIssue({ code: 'custom', message: 'Handle is required', path: ['handle'] })
      }
    } else {
      if (!data.title || data.title.trim().length === 0) {
        ctx.addIssue({ code: 'custom', message: 'Title is required', path: ['title'] })
      }
      if (!data.url || data.url.trim().length === 0) {
        ctx.addIssue({ code: 'custom', message: 'URL is required', path: ['url'] })
      } else {
        try {
          new URL(data.url)
        } catch {
          ctx.addIssue({ code: 'custom', message: 'Invalid URL', path: ['url'] })
        }
      }
    }
  })

type LinkFields = {
  network: string | null
  handle: string | null
  title: string
  url: string
  icon: string | null
}

function deriveLinkFields(input: z.infer<typeof linkSchema>): LinkFields {
  if (input.network && isNetworkSlug(input.network) && input.handle) {
    return {
      network: input.network,
      handle: input.handle.trim().replace(/^@+/, ''),
      title: buildLinkTitle(input.handle),
      url: buildLinkUrl(input.network, input.handle),
      icon: null,
    }
  }
  return {
    network: null,
    handle: null,
    title: (input.title ?? '').trim(),
    url: (input.url ?? '').trim(),
    icon: input.icon?.trim() || null,
  }
}

export async function createLink(input: z.infer<typeof linkSchema>): Promise<LinkResult> {
  const uid = await requireUserId()
  const parsed = linkSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message }
  if (parsed.data.tabId && !(await assertTabOwned(parsed.data.tabId, uid))) {
    return { ok: false, error: 'Tab not found' }
  }
  const fields = deriveLinkFields(parsed.data)
  const [{ max }] = await db
    .select({ max: sql<number>`coalesce(max(${links.position}), -1)` })
    .from(links)
    .where(eq(links.user_id, uid))
  const [row] = await db
    .insert(links)
    .values({
      user_id: uid,
      tab_id: parsed.data.tabId,
      ...fields,
      position: (max ?? -1) + 1,
    })
    .returning()
  revalidate()
  return {
    ok: true,
    link: {
      id: row.id,
      tabId: row.tab_id,
      network: row.network,
      handle: row.handle,
      title: row.title,
      url: row.url,
      icon: row.icon,
    },
  }
}

export async function updateLink(
  id: string,
  input: z.infer<typeof linkSchema>,
): Promise<Result> {
  const uid = await requireUserId()
  const parsed = linkSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message }
  if (parsed.data.tabId && !(await assertTabOwned(parsed.data.tabId, uid))) {
    return { ok: false, error: 'Tab not found' }
  }
  const fields = deriveLinkFields(parsed.data)
  await db
    .update(links)
    .set({
      tab_id: parsed.data.tabId,
      ...fields,
    })
    .where(and(eq(links.id, id), eq(links.user_id, uid)))
  revalidate()
  return { ok: true }
}

export async function deleteLink(id: string): Promise<Result> {
  const uid = await requireUserId()
  await db.delete(links).where(and(eq(links.id, id), eq(links.user_id, uid)))
  revalidate()
  return { ok: true }
}

export async function reorderLinks(orderedIds: string[]): Promise<Result> {
  const uid = await requireUserId()
  const owned = await db
    .select({ id: links.id })
    .from(links)
    .where(and(eq(links.user_id, uid), inArray(links.id, orderedIds)))
  const ownedSet = new Set(owned.map((r) => r.id))
  await Promise.all(
    orderedIds
      .filter((id) => ownedSet.has(id))
      .map((id, i) => db.update(links).set({ position: i }).where(eq(links.id, id))),
  )
  revalidate()
  return { ok: true }
}
