import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

import { auth } from '@/lib/auth'
import { setAvatarFromBuffer } from '@/lib/avatar'

export const runtime = 'nodejs'

const MAX_FILE_BYTES = 10 * 1024 * 1024

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const form = await req.formData()
  const file = form.get('file')
  if (!(file instanceof File)) return NextResponse.json({ error: 'Missing file' }, { status: 400 })
  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json({ error: 'Image is too large' }, { status: 413 })
  }

  const url = await setAvatarFromBuffer(session.user.id, Buffer.from(await file.arrayBuffer()))
  return NextResponse.json({ url })
}
