import { cookies, headers } from 'next/headers'
import { NextResponse } from 'next/server'

import { eq } from 'drizzle-orm'

import { auth } from '@/lib/auth'
import { setAvatarFromBuffer } from '@/lib/avatar'
import { db } from '@/lib/db'
import { ig_connections, profiles } from '@/lib/db/schema'
import { exchangeCodeForToken, fetchProfile, getLongLivedToken, instagramEnabled } from '@/lib/ig'

export const runtime = 'nodejs'

export async function GET(req: Request) {
  if (!instagramEnabled()) {
    return NextResponse.json({ error: 'Instagram import not configured' }, { status: 404 })
  }
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const base = process.env.BETTER_AUTH_URL ?? ''
  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const expected = (await cookies()).get('ig_oauth_state')?.value

  const finish = (status: string) => {
    const res = NextResponse.redirect(`${base}/dashboard?ig=${status}`)
    res.cookies.delete('ig_oauth_state')
    return res
  }

  if (url.searchParams.get('error')) return finish('declined')
  if (!code || !state || !expected || state !== expected) return finish('error')

  try {
    const short = await exchangeCodeForToken(code)
    const long = await getLongLivedToken(short.accessToken)
    const profile = await fetchProfile(long.accessToken)
    if (profile.accountType === 'PERSONAL') return finish('personal')

    const values = {
      user_id: session.user.id,
      ig_user_id: profile.id,
      username: profile.username,
      access_token: long.accessToken,
      token_expires_at: long.expiresAt,
    }
    await db
      .insert(ig_connections)
      .values(values)
      .onConflictDoUpdate({
        target: ig_connections.user_id,
        set: {
          ig_user_id: values.ig_user_id,
          username: values.username,
          access_token: values.access_token,
          token_expires_at: values.token_expires_at,
        },
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

    return finish('connected')
  } catch {
    return finish('error')
  }
}
