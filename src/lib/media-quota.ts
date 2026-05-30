import { and, eq, sql } from 'drizzle-orm'

import { db } from '@/lib/db'
import { media, tabs } from '@/lib/db/schema'

export const MAX_IMAGES_PER_USER = 60
export const MAX_VIDEOS_PER_USER = 6

export async function countUserMedia(
  userId: string,
  kind: 'image' | 'video',
): Promise<number> {
  const [row] = await db
    .select({ n: sql<number>`count(*)` })
    .from(media)
    .innerJoin(tabs, eq(media.tab_id, tabs.id))
    .where(and(eq(tabs.user_id, userId), eq(media.kind, kind)))
  return Number(row?.n ?? 0)
}
