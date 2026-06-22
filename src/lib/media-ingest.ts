import { randomUUID } from 'node:crypto'

import { sql } from 'drizzle-orm'
import sharp from 'sharp'

import { db } from '@/lib/db'
import { toDecodableImage } from '@/lib/media/decode'
import { storage } from '@/lib/storage'

export type IngestedImage = {
  id: string
  kind: 'image'
  url: string
  poster_url: string | null
}

export async function ingestImageBuffer(
  input: Buffer,
  opts: { userId: string; tabId: string; maxImages: number },
): Promise<IngestedImage | null> {
  const { data, info } = await sharp(await toDecodableImage(input))
    .rotate()
    .resize({ width: 720, withoutEnlargement: true })
    .webp({ quality: 72 })
    .toBuffer({ resolveWithObject: true })

  const key = `media/${opts.userId}/${opts.tabId}/${randomUUID()}.webp`
  await storage.put(key, data, 'image/webp')

  // Atomic quota: the count guard, position and insert run as one statement under
  // SQLite's write lock, so concurrent uploads serialize and can't overshoot the cap.
  const rows = (await db.all(sql`
    INSERT INTO media (id, tab_id, kind, r2_key, url, width, height, position)
    SELECT ${randomUUID()}, ${opts.tabId}, 'image', ${key}, ${storage.publicUrl(key)}, ${info.width}, ${info.height},
      (SELECT coalesce(max(position), -1) + 1 FROM media WHERE tab_id = ${opts.tabId})
    WHERE (
      SELECT count(*) FROM media AS m
      JOIN tabs AS t ON m.tab_id = t.id
      WHERE t.user_id = ${opts.userId} AND m.kind = 'image'
    ) < ${opts.maxImages}
    RETURNING id, kind, url, poster_url
  `)) as IngestedImage[]

  if (rows.length === 0) {
    await storage.delete(key).catch(() => {})
    return null
  }
  return rows[0]
}
