import { randomUUID } from 'node:crypto'

import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { and, eq } from 'drizzle-orm'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { import_jobs, tabs } from '@/lib/db/schema'
import { importEnabled } from '@/lib/ig'
import { requirePublishAccess } from '@/lib/subscription'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  if (!importEnabled()) {
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

  const jobId = randomUUID()
  await db.insert(import_jobs).values({
    id: jobId,
    user_id: session.user.id,
    tab_id: tabId,
    source: 'instagram',
    status: 'pending',
  })

  return NextResponse.json({ jobId })
}
