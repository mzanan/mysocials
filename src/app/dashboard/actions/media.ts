'use server'

import { and, eq } from 'drizzle-orm'

import { db } from '@/lib/db'
import { media } from '@/lib/db/schema'
import { storage } from '@/lib/storage'
import { assertTabOwned, requireUserId, revalidate, type Result } from './_helpers'

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
