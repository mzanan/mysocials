'use server'

import { and, eq, inArray, sql } from 'drizzle-orm'
import { z } from 'zod'

import { db } from '@/lib/db'
import { tabs } from '@/lib/db/schema'
import { storage } from '@/lib/storage'
import { positionCase, requireUserId, revalidate, type Result, type TabResult } from './_helpers'

const tabSchema = z.object({
  label: z.string().trim().min(1).max(24),
  type: z.enum(['grid', 'video']),
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
  const patch = {
    label: parsed.data.label,
    type: parsed.data.type,
  }
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
  if (orderedIds.length === 0) return { ok: true }
  await db
    .update(tabs)
    .set({ position: positionCase(tabs.id, tabs.position, orderedIds) })
    .where(and(eq(tabs.user_id, uid), inArray(tabs.id, orderedIds)))
  revalidate()
  return { ok: true }
}
