'use server'

import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { and, eq, inArray, sql } from 'drizzle-orm'
import { z } from 'zod'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { links, media, profiles, tabs } from '@/lib/db/schema'
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
  gridMode: z.enum(['cycle', 'masonry']).optional(),
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
      grid_mode: parsed.data.gridMode ?? 'cycle',
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
      gridMode: row.grid_mode,
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
  const patch: { label: string; type: 'grid' | 'video'; grid_mode?: 'cycle' | 'masonry' } = {
    label: parsed.data.label,
    type: parsed.data.type,
  }
  if (parsed.data.gridMode) patch.grid_mode = parsed.data.gridMode
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

const linkSchema = z.object({
  tabId: z.string().nullable(),
  title: z.string().trim().min(1).max(40),
  url: z.string().trim().url().max(500),
  icon: z.string().trim().max(40).nullable(),
})

export async function createLink(input: z.infer<typeof linkSchema>): Promise<LinkResult> {
  const uid = await requireUserId()
  const parsed = linkSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message }
  if (parsed.data.tabId && !(await assertTabOwned(parsed.data.tabId, uid))) {
    return { ok: false, error: 'Tab not found' }
  }
  const [{ max }] = await db
    .select({ max: sql<number>`coalesce(max(${links.position}), -1)` })
    .from(links)
    .where(eq(links.user_id, uid))
  const [row] = await db
    .insert(links)
    .values({
      user_id: uid,
      tab_id: parsed.data.tabId,
      title: parsed.data.title,
      url: parsed.data.url,
      icon: parsed.data.icon || null,
      position: (max ?? -1) + 1,
    })
    .returning()
  revalidate()
  return {
    ok: true,
    link: { id: row.id, tabId: row.tab_id, title: row.title, url: row.url, icon: row.icon },
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
  await db
    .update(links)
    .set({
      tab_id: parsed.data.tabId,
      title: parsed.data.title,
      url: parsed.data.url,
      icon: parsed.data.icon || null,
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
