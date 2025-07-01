import { PublicProfile } from '@/components/PublicProfile/PublicProfile'

export const dynamic = 'force-dynamic'

interface UserProfilePageProps {
  params: Promise<{
    username: string
  }>
}

export default async function UserProfilePage({ params }: UserProfilePageProps) {
  const { username } = await params
  return <PublicProfile username={username} />
} 