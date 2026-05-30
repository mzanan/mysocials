import { sql } from 'drizzle-orm'

import { db } from '@/lib/db'
import { profiles } from '@/lib/db/schema'
import type { LinkPublic, ProfilePublic, TabPublic } from '@/types/profile'

export async function getPublicProfileByUsername(username: string): Promise<ProfilePublic | null> {
  const row = await db.query.profiles.findFirst({
    where: sql`lower(${profiles.username}) = ${username.toLowerCase()}`,
    with: {
      tabs: {
        orderBy: (t, { asc }) => [asc(t.position)],
        with: {
          media: { orderBy: (m, { asc }) => [asc(m.position)] },
          links: { orderBy: (l, { asc }) => [asc(l.position)] },
        },
      },
      links: { orderBy: (l, { asc }) => [asc(l.position)] },
    },
  })

  if (!row || !row.published) return null

  const globalLinks: LinkPublic[] = row.links
    .filter((l) => l.tab_id === null)
    .map((l) => ({ title: l.title, url: l.url, icon: l.icon, iconUrl: l.icon_url }))

  const tabs: TabPublic[] = row.tabs.map((t) => ({
    id: t.id,
    label: t.label,
    type: t.type,
    media: t.media
      .filter((m) => (t.type === 'video' ? m.kind === 'video' : m.kind === 'image'))
      .map((m) => ({
        url: m.url,
        posterUrl: m.poster_url,
        kind: m.kind,
        width: m.width,
        height: m.height,
      })),
    links: [
      ...globalLinks,
      ...t.links.map((l) => ({ title: l.title, url: l.url, icon: l.icon, iconUrl: l.icon_url })),
    ],
  }))

  return {
    username: row.username,
    displayName: row.display_name,
    avatarUrl: row.avatar_url,
    bio: row.bio,
    accent: row.accent,
    tabs,
  }
}
