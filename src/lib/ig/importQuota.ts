import { randomUUID } from 'node:crypto'

import { sql } from 'drizzle-orm'

import { db } from '@/lib/db'

export const IMPORT_COOLDOWN_DAYS = 7
const DAY_MS = 24 * 60 * 60 * 1000
const COOLDOWN_MS = IMPORT_COOLDOWN_DAYS * DAY_MS
const STALE_JOB_MS = 10 * 60 * 1000

type ClaimResult = { ok: true; jobId: string } | { ok: false; message: string }

export async function claimImportJob(userId: string, tabId: string): Promise<ClaimResult> {
  const now = Date.now()
  const cooldownSince = new Date(now - COOLDOWN_MS).toISOString()
  const activeSince = new Date(now - STALE_JOB_MS).toISOString()
  const jobId = randomUUID()
  const blocking = sql`
    user_id = ${userId}
    AND (
      (status = 'done' AND imported > 0 AND created_at >= ${cooldownSince})
      OR (status IN ('pending', 'running', 'processing') AND updated_at >= ${activeSince})
    )
  `

  const inserted = (await db.all(sql`
    INSERT INTO import_jobs (id, user_id, tab_id, source, status)
    SELECT ${jobId}, ${userId}, ${tabId}, 'instagram', 'pending'
    WHERE NOT EXISTS (
      SELECT 1 FROM import_jobs
      WHERE ${blocking}
    )
    RETURNING id
  `)) as { id: string }[]
  if (inserted.length > 0) return { ok: true, jobId }

  const [blocker] = (await db.all(sql`
    SELECT status, created_at FROM import_jobs
    WHERE ${blocking}
    ORDER BY created_at DESC
    LIMIT 1
  `)) as { status: string; created_at: string }[]

  if (!blocker || blocker.status !== 'done') {
    return { ok: false, message: 'An Instagram import is already running. Wait for it to finish.' }
  }
  const days = Math.max(1, Math.ceil((new Date(blocker.created_at).getTime() + COOLDOWN_MS - now) / DAY_MS))
  return {
    ok: false,
    message: `You can import from Instagram once every ${IMPORT_COOLDOWN_DAYS} days. Try again in ${days} ${days === 1 ? 'day' : 'days'}.`,
  }
}
