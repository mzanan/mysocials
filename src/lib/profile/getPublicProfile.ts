import { sql } from 'drizzle-orm'

import { db } from '@/lib/db'
import { profiles } from '@/lib/db/schema'
import { billingEnabled, hasAccess } from '@/lib/subscription'
import type {
  LinkPublic,
  PublicProfileResult,
  SuspendedProfilePublic,
  TabPublic,
} from '@/types/profile'

type LinkRow = { title: string; url: string; icon: string | null; icon_url: string | null }

function toLinkPublic(l: LinkRow): LinkPublic {
  return { title: l.title, url: l.url, icon: l.icon, iconUrl: l.icon_url }
}

export async function getPublicProfileByUsername(
  username: string,
): Promise<PublicProfileResult | null> {
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

  if (billingEnabled() && !hasAccess(row)) {
    const suspended: SuspendedProfilePublic = {
      status: 'suspended',
      username: row.username,
      displayName: row.display_name,
      avatarUrl: row.avatar_url,
      accent: row.accent,
    }
    return suspended
  }

  const globalLinks: LinkPublic[] = row.links.filter((l) => l.tab_id === null).map(toLinkPublic)

  const tabs: TabPublic[] = row.tabs
    .map((t) => {
      const media = t.media
        .filter((m) => (t.type === 'video' ? m.kind === 'video' : m.kind === 'image'))
        .map((m) => ({
          url: m.url,
          posterUrl: m.poster_url,
          kind: m.kind,
          width: m.width,
          height: m.height,
        }))
      const ownLinks = t.links.map(toLinkPublic)
      return { id: t.id, label: t.label, type: t.type, gridSize: t.grid_size, media, ownLinks }
    })
    .filter((t) => t.media.length > 0 || t.ownLinks.length > 0)
    .map((t) => ({
      id: t.id,
      label: t.label,
      type: t.type,
      gridSize: t.gridSize,
      media: t.media,
      links: [...globalLinks, ...t.ownLinks],
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
