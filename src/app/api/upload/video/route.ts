import { randomUUID } from 'node:crypto'

import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { and, eq, sql } from 'drizzle-orm'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { media, tabs } from '@/lib/db/schema'
import { MAX_VIDEOS_PER_USER, countUserMedia } from '@/lib/media-quota'
import { storage } from '@/lib/storage'

export const runtime = 'nodejs'

const MAX_VIDEO_BYTES = 40 * 1024 * 1024
const ALLOWED = new Set(['video/mp4', 'video/webm'])

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const form = await req.formData()
  const tabId = String(form.get('tabId') ?? '')
  const clip = form.get('clip')
  const poster = form.get('poster')
  if (!tabId || !(clip instanceof File)) {
    return NextResponse.json({ error: 'Missing tabId or clip' }, { status: 400 })
  }
  if (!ALLOWED.has(clip.type)) {
    return NextResponse.json({ error: 'Only mp4 or webm allowed' }, { status: 415 })
  }
  if (clip.size > MAX_VIDEO_BYTES) {
    return NextResponse.json({ error: 'Video is too large (max 40MB)' }, { status: 413 })
  }

  const tab = await db.query.tabs.findFirst({
    where: and(eq(tabs.id, tabId), eq(tabs.user_id, session.user.id)),
  })
  if (!tab) return NextResponse.json({ error: 'Tab not found' }, { status: 404 })

  const existing = await countUserMedia(session.user.id, 'video')
  if (existing >= MAX_VIDEOS_PER_USER) {
    return NextResponse.json(
      { error: `Video limit reached (${MAX_VIDEOS_PER_USER}).` },
      { status: 413 },
    )
  }

  try {
    const ext = clip.type === 'video/webm' ? 'webm' : 'mp4'
    const base = `media/${session.user.id}/${tabId}/${randomUUID()}`
    const clipKey = `${base}.${ext}`
    await storage.put(clipKey, Buffer.from(await clip.arrayBuffer()), clip.type)

    let posterKey: string | null = null
    let posterUrl: string | null = null
    if (poster instanceof File && poster.size > 0) {
      posterKey = `${base}.webp`
      await storage.put(posterKey, Buffer.from(await poster.arrayBuffer()), 'image/webp')
      posterUrl = storage.publicUrl(posterKey)
    }

    const [{ max }] = await db
      .select({ max: sql<number>`coalesce(max(${media.position}), -1)` })
      .from(media)
      .where(eq(media.tab_id, tabId))

    const [row] = await db
      .insert(media)
      .values({
        tab_id: tabId,
        kind: 'video',
        r2_key: clipKey,
        url: storage.publicUrl(clipKey),
        poster_key: posterKey,
        poster_url: posterUrl,
        position: (max ?? -1) + 1,
      })
      .returning()

    return NextResponse.json({ media: row })
  } catch (e) {
    console.error('Video upload failed:', e)
    return NextResponse.json({ error: 'Could not save the video' }, { status: 500 })
  }
}
