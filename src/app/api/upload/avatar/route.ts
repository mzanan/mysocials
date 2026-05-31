import { randomUUID } from 'node:crypto'

import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import sharp from 'sharp'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { profiles } from '@/lib/db/schema'
import { toDecodableImage } from '@/lib/media/decode'
import { storage } from '@/lib/storage'

export const runtime = 'nodejs'

const MAX_FILE_BYTES = 10 * 1024 * 1024

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const form = await req.formData()
  const file = form.get('file')
  if (!(file instanceof File)) return NextResponse.json({ error: 'Missing file' }, { status: 400 })
  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json({ error: 'Image is too large' }, { status: 413 })
  }

  const { data } = await sharp(await toDecodableImage(Buffer.from(await file.arrayBuffer())))
    .rotate()
    .resize(256, 256, { fit: 'cover' })
    .webp({ quality: 80 })
    .toBuffer({ resolveWithObject: true })

  const key = `avatar/${session.user.id}/${randomUUID()}.webp`
  await storage.put(key, data, 'image/webp')

  const existing = await db.query.profiles.findFirst({
    where: eq(profiles.user_id, session.user.id),
  })
  if (existing?.avatar_key) await storage.delete(existing.avatar_key).catch(() => {})

  const url = storage.publicUrl(key)
  await db
    .update(profiles)
    .set({ avatar_url: url, avatar_key: key })
    .where(eq(profiles.user_id, session.user.id))

  return NextResponse.json({ url })
}
