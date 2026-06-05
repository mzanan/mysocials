'use server'

import { eq } from 'drizzle-orm'
import { z } from 'zod'

import { db } from '@/lib/db'
import { profiles } from '@/lib/db/schema'
import { isUsernameAvailable } from '@/lib/profile/username'
import { requireUserId, revalidate, type Result } from './_helpers'

const profileSchema = z.object({
  displayName: z.string().trim().max(60).nullable(),
  bio: z.string().trim().max(280).nullable(),
  accent: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Invalid color'),
})

export async function updateProfile(input: z.infer<typeof profileSchema>): Promise<Result> {
  const uid = await requireUserId()
  const parsed = profileSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message }
  await db
    .update(profiles)
    .set({
      display_name: parsed.data.displayName || null,
      bio: parsed.data.bio || null,
      accent: parsed.data.accent,
    })
    .where(eq(profiles.user_id, uid))
  revalidate()
  return { ok: true }
}

export async function updateUsername(username: string): Promise<Result> {
  const uid = await requireUserId()
  const lower = username.trim().toLowerCase()
  if (!(await isUsernameAvailable(lower, uid))) {
    return { ok: false, error: 'Username is taken or invalid' }
  }
  await db.update(profiles).set({ username: lower }).where(eq(profiles.user_id, uid))
  revalidate()
  return { ok: true }
}
