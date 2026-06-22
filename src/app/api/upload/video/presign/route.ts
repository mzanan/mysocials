import { randomUUID } from 'node:crypto'

import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { and, eq } from 'drizzle-orm'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { tabs } from '@/lib/db/schema'
import { MAX_VIDEOS_PER_USER, countUserMedia } from '@/lib/media-quota'
import { storage } from '@/lib/storage'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { tabId } = (await req.json().catch(() => ({}))) as { tabId?: string }
  if (!tabId) return NextResponse.json({ error: 'Missing tabId' }, { status: 400 })

  const tab = await db.query.tabs.findFirst({
    where: and(eq(tabs.id, tabId), eq(tabs.user_id, session.user.id)),
  })
  if (!tab) return NextResponse.json({ error: 'Tab not found' }, { status: 404 })

  const existing = await countUserMedia(session.user.id, 'video')
  if (existing >= MAX_VIDEOS_PER_USER) {
    return NextResponse.json(
      {
        error: `Video limit reached (${existing}/${MAX_VIDEOS_PER_USER}). Delete some to add more.`,
      },
      { status: 409 },
    )
  }

  if (!storage.presignedPutUrl) {
    return NextResponse.json({ mode: 'local' })
  }

  const base = `media/${session.user.id}/${tabId}/${randomUUID()}`
  const clipKey = `${base}.mp4`
  const posterKey = `${base}.webp`
  const [clipUploadUrl, posterUploadUrl] = await Promise.all([
    storage.presignedPutUrl(clipKey, 'video/mp4'),
    storage.presignedPutUrl(posterKey, 'image/webp'),
  ])

  return NextResponse.json({ mode: 'r2', clipKey, clipUploadUrl, posterKey, posterUploadUrl })
}
