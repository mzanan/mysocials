import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { and, eq, sql } from 'drizzle-orm'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { media, tabs } from '@/lib/db/schema'
import { ingestImageBuffer } from '@/lib/media-ingest'
import { MAX_IMAGES_PER_USER, countUserMedia } from '@/lib/media-quota'

export const runtime = 'nodejs'

const MAX_FILE_BYTES = 15 * 1024 * 1024

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const form = await req.formData()
  const tabId = String(form.get('tabId') ?? '')
  const files = form.getAll('files').filter((f): f is File => f instanceof File)
  if (!tabId || files.length === 0) {
    return NextResponse.json({ error: 'Missing tabId or files' }, { status: 400 })
  }

  const tab = await db.query.tabs.findFirst({
    where: and(eq(tabs.id, tabId), eq(tabs.user_id, session.user.id)),
  })
  if (!tab) return NextResponse.json({ error: 'Tab not found' }, { status: 404 })

  const existing = await countUserMedia(session.user.id, 'image')
  if (existing + files.length > MAX_IMAGES_PER_USER) {
    return NextResponse.json(
      {
        error: `Photo limit reached (${existing}/${MAX_IMAGES_PER_USER}). Delete some to add more.`,
      },
      { status: 409 },
    )
  }

  const tooBig = files.find((f) => f.size > MAX_FILE_BYTES)
  if (tooBig) {
    return NextResponse.json({ error: `${tooBig.name} is too large` }, { status: 413 })
  }

  const [{ max }] = await db
    .select({ max: sql<number>`coalesce(max(${media.position}), -1)` })
    .from(media)
    .where(eq(media.tab_id, tabId))
  let position = (max ?? -1) + 1

  const created = []
  for (const file of files) {
    try {
      const input = Buffer.from(await file.arrayBuffer())
      const row = await ingestImageBuffer(input, {
        userId: session.user.id,
        tabId,
        position: position++,
      })
      created.push(row)
    } catch (err) {
      console.error('[upload/image] failed', {
        name: file.name,
        type: file.type,
        size: file.size,
        error: err instanceof Error ? err.message : String(err),
      })
      return NextResponse.json(
        { error: `Could not process ${file.name}` },
        { status: 500 },
      )
    }
  }

  return NextResponse.json({ media: created })
}
