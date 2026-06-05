'use server'

import { eq } from 'drizzle-orm'

import { db } from '@/lib/db'
import { profiles } from '@/lib/db/schema'
import { requirePublishAccess } from '@/lib/subscription'
import { requireUserId, revalidate, type Result } from './_helpers'

export async function setPublished(published: boolean): Promise<Result> {
  const uid = await requireUserId()
  if (published) {
    const gate = await requirePublishAccess(uid)
    if (!gate.ok) return { ok: false, error: gate.reason }
  }
  await db.update(profiles).set({ published }).where(eq(profiles.user_id, uid))
  revalidate()
  return { ok: true }
}
