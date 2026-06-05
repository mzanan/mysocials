import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { and, eq } from 'drizzle-orm'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { tabs } from '@/lib/db/schema'
import type { DashLink, DashTab } from '@/types/dashboard'

export type Result = { ok: true } | { ok: false; error: string }
export type TabResult = { ok: true; tab: DashTab } | { ok: false; error: string }
export type LinkResult = { ok: true; link: DashLink } | { ok: false; error: string }
export type AvatarResult = { ok: true; url: string } | { ok: false; error: string }

export async function requireUserId(): Promise<string> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) throw new Error('Unauthorized')
  return session.user.id
}

export function revalidate() {
  revalidatePath('/dashboard')
}

export async function assertTabOwned(tabId: string, uid: string): Promise<boolean> {
  const t = await db.query.tabs.findFirst({
    where: and(eq(tabs.id, tabId), eq(tabs.user_id, uid)),
  })
  return Boolean(t)
}
