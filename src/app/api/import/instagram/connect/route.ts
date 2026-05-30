import { randomUUID } from 'node:crypto'

import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

import { auth } from '@/lib/auth'
import { getAuthorizationUrl, instagramEnabled } from '@/lib/ig'

export const runtime = 'nodejs'

export async function GET() {
  if (!instagramEnabled()) {
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
