import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { and, eq, sql } from 'drizzle-orm'

import { auth } from '@/lib/auth'
import { decryptSecret } from '@/lib/crypto'
import { db } from '@/lib/db'
import { ig_connections, import_jobs, media } from '@/lib/db/schema'
import { igProvider, IgAuthError, stillUrl } from '@/lib/ig'
import { ingestImageBuffer } from '@/lib/media-ingest'
import { MAX_IMAGES_PER_USER, countUserMedia } from '@/lib/media-quota'

export const runtime = 'nodejs'
export const maxDuration = 60

const CHUNK_SIZE = 10
const MAX_IMPORT = 60
const ITEM_FETCH_TIMEOUT_MS = 15_000
const STALE_PROCESSING_MS = (maxDuration + 30) * 1000

type JobState = {
  status: 'pending' | 'running' | 'processing' | 'done' | 'failed'
  total: number
  imported: number
  error: string | null
}

function state(row: typeof import_jobs.$inferSelect): JobState {
  return {
    status: row.status,
    total: row.total,
    imported: row.imported,
    error: row.error,
  }
}

async function claim(jobId: string, expected: JobState['status'], updatedAt?: string): Promise<boolean> {
  const res = await db
    .update(import_jobs)
    .set({ status: 'processing' })
    .where(
      and(
        eq(import_jobs.id, jobId),
        eq(import_jobs.status, expected),
        updatedAt ? eq(import_jobs.updated_at, updatedAt) : undefined,
      ),
    )
    .returning({ id: import_jobs.id })
  return res.length > 0
}

async function failJob(jobId: string, error: string) {
  await db.update(import_jobs).set({ status: 'failed', error }).where(eq(import_jobs.id, jobId))
}

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { jobId } = (await req.json().catch(() => ({}))) as { jobId?: string }
  if (!jobId) return NextResponse.json({ error: 'Missing jobId' }, { status: 400 })

  const job = await db.query.import_jobs.findFirst({
    where: and(eq(import_jobs.id, jobId), eq(import_jobs.user_id, session.user.id)),
  })
  if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 })

  if (job.status === 'done' || job.status === 'failed') return NextResponse.json(state(job))
  const stale =
    job.status === 'processing' && Date.now() - new Date(job.updated_at).getTime() > STALE_PROCESSING_MS
  if (job.status === 'processing' && !stale) return NextResponse.json(state(job))

  if (stale && job.pending_items === null) {
    const error = 'Instagram took too long to respond. Please try again.'
    if (await claim(jobId, 'processing', job.updated_at)) await failJob(jobId, error)
    const fresh = await db.query.import_jobs.findFirst({ where: eq(import_jobs.id, jobId) })
    return NextResponse.json(fresh ? state(fresh) : { error: 'Job vanished' }, { status: fresh ? 200 : 500 })
  }

  const step = stale ? 'running' : job.status
  if (!(await claim(jobId, job.status, stale ? job.updated_at : undefined))) {
    const fresh = await db.query.import_jobs.findFirst({ where: eq(import_jobs.id, jobId) })
    return NextResponse.json(fresh ? state(fresh) : { error: 'Job vanished' }, { status: fresh ? 200 : 500 })
  }

  try {
    if (step === 'pending') {
      const conn = await db.query.ig_connections.findFirst({
        where: eq(ig_connections.user_id, session.user.id),
      })
      if (!conn) throw new Error('Instagram not connected')

      const headroom = MAX_IMAGES_PER_USER - (await countUserMedia(session.user.id, 'image'))
      if (headroom <= 0) {
        throw new Error(`You already have ${MAX_IMAGES_PER_USER} photos. Delete some to import more.`)
      }

      const items = await igProvider().fetchMedia(
        { username: conn.username, accessToken: decryptSecret(conn.access_token) },
        MAX_IMPORT,
      )
      const remaining = items
        .filter((i) => i.mediaType !== 'VIDEO')
        .filter((i) => stillUrl(i))
        .map((i) => ({ id: i.id, src: stillUrl(i)! }))
      if (remaining.length === 0) throw new Error('No photos found on this Instagram account.')
      const capped = remaining.slice(0, headroom)

      const [{ max }] = await db
        .select({ max: sql<number>`coalesce(max(${media.position}), -1)` })
        .from(media)
        .where(eq(media.tab_id, job.tab_id))
      const startPosition = (max ?? -1) + 1

      const queue = capped.map((c, idx) => ({ ...c, position: startPosition + idx }))

      await db
        .update(import_jobs)
        .set({
          status: queue.length === 0 ? 'done' : 'running',
          total: queue.length,
          pending_items: JSON.stringify(queue),
        })
        .where(eq(import_jobs.id, jobId))

      const after = await db.query.import_jobs.findFirst({ where: eq(import_jobs.id, jobId) })
      return NextResponse.json(state(after!))
    }

    const queue = JSON.parse(job.pending_items ?? '[]') as Array<{
      id: string
      src: string
      position: number
    }>
    const chunk = queue.slice(0, CHUNK_SIZE)

    const results = await Promise.all(
      chunk.map(async (item) => {
        try {
          const res = await fetch(item.src, { signal: AbortSignal.timeout(ITEM_FETCH_TIMEOUT_MS) })
          if (!res.ok) return false
          const buf = Buffer.from(await res.arrayBuffer())
          const row = await ingestImageBuffer(buf, {
            userId: session.user.id,
            tabId: job.tab_id,
            maxImages: MAX_IMAGES_PER_USER,
          })
          return row !== null
        } catch {
          return false
        }
      }),
    )
    const importedNow = results.filter(Boolean).length

    const rest = queue.slice(CHUNK_SIZE)
    const nextImported = job.imported + importedNow
    const done = rest.length === 0

    await db
      .update(import_jobs)
      .set({
        status: done ? 'done' : 'running',
        imported: nextImported,
        pending_items: done ? null : JSON.stringify(rest),
      })
      .where(eq(import_jobs.id, jobId))

    return NextResponse.json({
      status: done ? ('done' as const) : ('running' as const),
      total: job.total,
      imported: nextImported,
      error: null,
    })
  } catch (e) {
    if (e instanceof IgAuthError) {
      await db.delete(ig_connections).where(eq(ig_connections.user_id, session.user.id))
    }
    await failJob(jobId, e instanceof Error ? e.message : 'Import failed')
    return NextResponse.json({
      status: 'failed' as const,
      total: job.total,
      imported: job.imported,
      error: e instanceof Error ? e.message : 'Import failed',
      reauth: e instanceof IgAuthError,
    })
  }
}
