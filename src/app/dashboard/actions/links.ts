'use server'

import { and, eq, inArray, sql } from 'drizzle-orm'
import { z } from 'zod'

import { db } from '@/lib/db'
import { links } from '@/lib/db/schema'
import { buildLinkTitle, buildLinkUrl, isNetworkSlug } from '@/lib/networks'
import {
  assertTabOwned,
  requireUserId,
  revalidate,
  type LinkResult,
  type Result,
} from './_helpers'

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
