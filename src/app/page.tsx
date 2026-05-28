import { PublicProfile } from '@/components/PublicProfile/PublicProfile'
import { getInstagramImages } from '@/lib/instagram'

export default function HomePage() {
  const initialImages = getInstagramImages()
  return <PublicProfile initialImages={initialImages} />
}
