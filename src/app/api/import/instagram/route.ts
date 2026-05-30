import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { and, eq, sql } from 'drizzle-orm'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { ig_connections, media, tabs } from '@/lib/db/schema'
import { fetchAllMedia, instagramEnabled, stillUrl } from '@/lib/ig'
import { ingestImageBuffer } from '@/lib/media-ingest'
import { MAX_IMAGES_PER_USER, countUserMedia } from '@/lib/media-quota'
import { requirePublishAccess } from '@/lib/subscription'

export const runtime = 'nodejs'

const MAX_IMPORT = 60

export async function POST(req: Request) {
  if (!instagramEnabled()) {
    return NextResponse.json({ error: 'Instagram import not configured' }, { status: 404 })
  }
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const gate = await requirePublishAccess(session.user.id)
  if (!gate.ok) return NextResponse.json({ error: gate.reason }, { status: 402 })

  const { tabId } = (await req.json().catch(() => ({}))) as { tabId?: string }
  if (!tabId) return NextResponse.json({ error: 'Missing tabId' }, { status: 400 })

  const tab = await db.query.tabs.findFirst({
    where: and(eq(tabs.id, tabId), eq(tabs.user_id, session.user.id)),
  })
  if (!tab) return NextResponse.json({ error: 'Tab not found' }, { status: 404 })

  const conn = await db.query.ig_connections.findFirst({
    where: eq(ig_connections.user_id, session.user.id),
  })
  if (!conn) return NextResponse.json({ error: 'Instagram not connected' }, { status: 409 })

  let items
  try {
    items = await fetchAllMedia(conn.access_token, MAX_IMPORT)
  } catch {
    return NextResponse.json({ error: 'Could not fetch Instagram media' }, { status: 502 })
  }

  const existing = await countUserMedia(session.user.id, 'image')
  let remaining = MAX_IMAGES_PER_USER - existing
  if (remaining <= 0) {
    return NextResponse.json(
      { error: `Photo limit reached (${MAX_IMAGES_PER_USER}).`, imported: 0 },
      { status: 413 },
    )
  }

  const [{ max }] = await db
    .select({ max: sql<number>`coalesce(max(${media.position}), -1)` })
    .from(media)
    .where(eq(media.tab_id, tabId))
  let position = (max ?? -1) + 1

  let imported = 0
  for (const item of items) {
    if (remaining <= 0) break
    const src = stillUrl(item)
    if (!src) continue
    try {
      const res = await fetch(src)
      if (!res.ok) continue
      const buf = Buffer.from(await res.arrayBuffer())
      await ingestImageBuffer(buf, { userId: session.user.id, tabId, position: position++ })
      imported++
      remaining--
    } catch {
      continue
    }
  }

  return NextResponse.json({ imported })
}
