import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { and, eq, sql } from 'drizzle-orm'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { media, tabs } from '@/lib/db/schema'
import { MAX_VIDEOS_PER_USER, countUserMedia } from '@/lib/media-quota'
import { storage } from '@/lib/storage'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { tabId, clipKey, posterKey } = (await req.json().catch(() => ({}))) as {
    tabId?: string
    clipKey?: string
    posterKey?: string | null
  }
  if (!tabId || !clipKey) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const prefix = `media/${session.user.id}/${tabId}/`
  if (!clipKey.startsWith(prefix) || (posterKey && !posterKey.startsWith(prefix))) {
    return NextResponse.json({ error: 'Invalid key' }, { status: 400 })
  }

  const tab = await db.query.tabs.findFirst({
    where: and(eq(tabs.id, tabId), eq(tabs.user_id, session.user.id)),
  })
  if (!tab) return NextResponse.json({ error: 'Tab not found' }, { status: 404 })

  const existing = await countUserMedia(session.user.id, 'video')
  if (existing >= MAX_VIDEOS_PER_USER) {
    await storage.delete(clipKey).catch(() => {})
    if (posterKey) await storage.delete(posterKey).catch(() => {})
    return NextResponse.json(
      {
        error: `Video limit reached (${existing}/${MAX_VIDEOS_PER_USER}). Delete some to add more.`,
      },
      { status: 409 },
    )
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
      poster_key: posterKey ?? null,
      poster_url: posterKey ? storage.publicUrl(posterKey) : null,
      position: (max ?? -1) + 1,
    })
    .returning()

  return NextResponse.json({ media: row })
}
