import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PublicProfile } from '@/components/PublicProfile/PublicProfile'
import { getPublicProfileByUsername } from '@/lib/profile/getPublicProfile'

export const dynamic = 'force-dynamic'

type Params = { params: Promise<{ username: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { username } = await params
  const profile = await getPublicProfileByUsername(username)
  if (!profile) return { title: 'Not found' }
  const name = profile.displayName || `@${profile.username}`
  const description = profile.bio ?? `${name} — all links in one place`
  return {
    title: name,
    description,
    openGraph: { title: name, description },
    alternates: { canonical: `/${profile.username}` },
  }
}

export default async function UserPage({ params }: Params) {
  const { username } = await params
  const profile = await getPublicProfileByUsername(username)
  if (!profile) notFound()
  return <PublicProfile profile={profile} />
}
