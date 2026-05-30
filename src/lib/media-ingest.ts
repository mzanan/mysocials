import { randomUUID } from 'node:crypto'

import sharp from 'sharp'

import { db } from '@/lib/db'
import { media } from '@/lib/db/schema'
import { storage } from '@/lib/storage'

export async function ingestImageBuffer(
  input: Buffer,
  opts: { userId: string; tabId: string; position: number },
) {
  const { data, info } = await sharp(input)
    .rotate()
    .resize({ width: 480, withoutEnlargement: true })
    .webp({ quality: 70 })
    .toBuffer({ resolveWithObject: true })

  const key = `media/${opts.userId}/${opts.tabId}/${randomUUID()}.webp`
  await storage.put(key, data, 'image/webp')

  const [row] = await db
    .insert(media)
    .values({
      tab_id: opts.tabId,
      kind: 'image',
      r2_key: key,
      url: storage.publicUrl(key),
      width: info.width,
      height: info.height,
      position: opts.position,
    })
    .returning()

  return row
}
