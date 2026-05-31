import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { LandingHero } from '@/components/Landing/LandingHero'

export default async function HomePage() {
  const session = await auth.api.getSession({ headers: await headers() })
  return <LandingHero isAuthed={Boolean(session)} />
}
