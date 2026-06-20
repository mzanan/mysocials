import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

import { auth } from '@/lib/auth'
import { PublicProfile } from '@/components/PublicProfile/PublicProfile'
import { getPreviewProfileForUser } from '@/lib/profile/getPublicProfile'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default async function PreviewPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect('/')

  const profile = await getPreviewProfileForUser(session.user.id)
  if (!profile) redirect('/dashboard')

  return <PublicProfile profile={profile} />
}
