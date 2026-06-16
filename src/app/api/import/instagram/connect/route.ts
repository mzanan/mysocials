import { randomUUID } from 'node:crypto'

import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'

import { auth } from '@/lib/auth'
import { setAvatarFromBuffer } from '@/lib/avatar'
import { db } from '@/lib/db'
import { ig_connections, profiles } from '@/lib/db/schema'
import { fetchApifyProfile, getAuthorizationUrl, igMode, officialConfigured } from '@/lib/ig'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function GET() {
  if (!officialConfigured()) {
    return NextResponse.json({ error: 'Instagram import not configured' }, { status: 404 })
  }
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const state = randomUUID()
  const res = NextResponse.redirect(getAuthorizationUrl(state))
  res.cookies.set('ig_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 600,
  })
  return res
}

export async function POST(req: Request) {
  if (igMode() !== 'apify') {
    return NextResponse.json({ error: 'Instagram import not configured' }, { status: 404 })
  }
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { username } = (await req.json().catch(() => ({}))) as { username?: string }
  if (!username?.trim()) return NextResponse.json({ error: 'Missing username' }, { status: 400 })

  try {
    const profile = await fetchApifyProfile(username)
    const values = {
      user_id: session.user.id,
      ig_user_id: profile.id,
      username: profile.username,
      access_token: '',
      token_expires_at: null,
    }
    await db
      .insert(ig_connections)
      .values(values)
      .onConflictDoUpdate({
        target: ig_connections.user_id,
        set: { ig_user_id: values.ig_user_id, username: values.username, access_token: '' },
      })

    const userProfile = await db.query.profiles.findFirst({
      where: eq(profiles.user_id, session.user.id),
    })
    if (!userProfile?.avatar_url && profile.profilePictureUrl) {
      try {
        const r = await fetch(profile.profilePictureUrl)
        if (r.ok) await setAvatarFromBuffer(session.user.id, Buffer.from(await r.arrayBuffer()))
      } catch {}
    }

    return NextResponse.json({ username: profile.username })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "We couldn't connect that Instagram profile." },
      { status: 422 },
    )
  }
}
