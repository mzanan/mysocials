import { sql } from 'drizzle-orm'

import { db } from '@/lib/db'
import { profiles } from '@/lib/db/schema'

export const RESERVED_USERNAMES = new Set([
  'api',
  'dashboard',
  'admin',
  'login',
  'signup',
  'logout',
  'auth',
  '_next',
  'favicon.ico',
  'robots.txt',
  'sitemap.xml',
  'icon.svg',
  'opengraph-image',
  'images',
  'videos',
  'uploads',
  'public',
  'static',
  'settings',
  'billing',
  'pricing',
  'about',
  'terms',
  'privacy',
  'support',
  'help',
  'app',
  'www',
])

export const USERNAME_RE = /^[a-z0-9_]{3,30}$/

export function slugifyUsername(base: string): string {
  return base.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 30)
}

async function isTaken(candidate: string): Promise<boolean> {
  const rows = await db
    .select({ user_id: profiles.user_id })
    .from(profiles)
    .where(sql`lower(${profiles.username}) = ${candidate}`)
    .limit(1)
  return rows.length > 0
}

export async function generateUniqueUsername(email: string): Promise<string> {
  let base = slugifyUsername(email.split('@')[0] || 'user')
  if (base.length < 3) base = `user${base}`
  base = base.slice(0, 24)
  let candidate = base
  let n = 0
  while (RESERVED_USERNAMES.has(candidate) || (await isTaken(candidate))) {
    n += 1
    candidate = `${base}${n}`
  }
  return candidate
}

export async function isUsernameAvailable(
  username: string,
  currentUserId?: string,
): Promise<boolean> {
  const lower = username.toLowerCase()
  if (!USERNAME_RE.test(lower) || RESERVED_USERNAMES.has(lower)) return false
  const rows = await db
    .select({ user_id: profiles.user_id })
    .from(profiles)
    .where(sql`lower(${profiles.username}) = ${lower}`)
    .limit(1)
  if (rows.length === 0) return true
  return currentUserId ? rows[0].user_id === currentUserId : false
}
