import { randomUUID } from 'node:crypto'

import { eq } from 'drizzle-orm'
import sharp from 'sharp'

import { db } from '@/lib/db'
import { profiles } from '@/lib/db/schema'
import { toDecodableImage } from '@/lib/media/decode'
import { storage } from '@/lib/storage'

export async function setAvatarFromBuffer(userId: string, input: Buffer): Promise<string> {
  const { data } = await sharp(await toDecodableImage(input))
    .rotate()
    .resize(256, 256, { fit: 'cover' })
    .webp({ quality: 80 })
    .toBuffer({ resolveWithObject: true })

  const key = `avatar/${userId}/${randomUUID()}.webp`
  await storage.put(key, data, 'image/webp')

  const existing = await db.query.profiles.findFirst({ where: eq(profiles.user_id, userId) })
  if (existing?.avatar_key) await storage.delete(existing.avatar_key).catch(() => {})

  const url = storage.publicUrl(key)
  await db
    .update(profiles)
    .set({ avatar_url: url, avatar_key: key })
    .where(eq(profiles.user_id, userId))
  return url
}
