'use server'

import { randomUUID } from 'node:crypto'

import { and, eq, inArray } from 'drizzle-orm'
import sharp from 'sharp'

import { db } from '@/lib/db'
import { media } from '@/lib/db/schema'
import { storage } from '@/lib/storage'
import { assertTabOwned, positionCase, requireUserId, revalidate, type Result } from './_helpers'

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

export async function rotateMedia(
  id: string,
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  const uid = await requireUserId()
  const row = await db.query.media.findFirst({
    where: eq(media.id, id),
    with: { tab: true },
  })
  if (!row || row.tab.user_id !== uid) return { ok: false, error: 'Not found' }
  if (row.kind !== 'image') return { ok: false, error: 'Only photos can be rotated' }

  const { data, info } = await sharp(await storage.get(row.r2_key))
    .rotate(90)
    .webp({ quality: 72 })
    .toBuffer({ resolveWithObject: true })

  const newKey = `media/${uid}/${row.tab_id}/${randomUUID()}.webp`
  await storage.put(newKey, data, 'image/webp')
  await storage.delete(row.r2_key).catch(() => {})

  const url = storage.publicUrl(newKey)
  await db
    .update(media)
    .set({ r2_key: newKey, url, width: info.width, height: info.height })
    .where(eq(media.id, id))
  return { ok: true, url }
}

export async function reorderMedia(tabId: string, orderedIds: string[]): Promise<Result> {
  const uid = await requireUserId()
  if (!(await assertTabOwned(tabId, uid))) return { ok: false, error: 'Tab not found' }
  if (orderedIds.length === 0) return { ok: true }
  await db
    .update(media)
    .set({ position: positionCase(media.id, media.position, orderedIds) })
    .where(and(eq(media.tab_id, tabId), inArray(media.id, orderedIds)))
  revalidate()
  return { ok: true }
}
