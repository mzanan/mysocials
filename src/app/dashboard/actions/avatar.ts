'use server'

import { and, eq } from 'drizzle-orm'

import { setAvatarFromBuffer } from '@/lib/avatar'
import { db } from '@/lib/db'
import { ig_connections, media } from '@/lib/db/schema'
import { fetchProfile } from '@/lib/ig'
import { requireUserId, revalidate, type AvatarResult } from './_helpers'

export async function setAvatarFromInstagram(): Promise<AvatarResult> {
  const uid = await requireUserId()
  const conn = await db.query.ig_connections.findFirst({
    where: eq(ig_connections.user_id, uid),
  })
  if (!conn) return { ok: false, error: 'Instagram not connected' }
  try {
    const profile = await fetchProfile(conn.access_token)
    if (!profile.profilePictureUrl) return { ok: false, error: 'No Instagram profile picture' }
    const res = await fetch(profile.profilePictureUrl)
    if (!res.ok) return { ok: false, error: 'Could not fetch Instagram picture' }
    const url = await setAvatarFromBuffer(uid, Buffer.from(await res.arrayBuffer()))
    revalidate()
    return { ok: true, url }
  } catch {
    return { ok: false, error: 'Instagram avatar fetch failed' }
  }
}

export async function setAvatarFromMedia(mediaId: string): Promise<AvatarResult> {
  const uid = await requireUserId()
  const row = await db.query.media.findFirst({
    where: and(eq(media.id, mediaId), eq(media.kind, 'image')),
    with: { tab: { columns: { user_id: true } } },
  })
  if (!row || row.tab.user_id !== uid) return { ok: false, error: 'Photo not found' }
  try {
    const res = await fetch(row.url)
    if (!res.ok) return { ok: false, error: 'Could not load photo' }
    const url = await setAvatarFromBuffer(uid, Buffer.from(await res.arrayBuffer()))
    revalidate()
    return { ok: true, url }
  } catch {
    return { ok: false, error: 'Avatar update failed' }
  }
}
