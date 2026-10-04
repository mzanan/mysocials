import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { StatusPage } from '@/components/ui/StatusPage'

export default function NotFound() {
  return (
    <StatusPage
      badge="404"
      lead="This page took"
      accent="a different link."
      message="The page you are looking for does not exist or has moved."
      action={
        <Button asChild variant="primary" size="auth" className="px-8">
          <Link href="/">Back home</Link>
        </Button>
      }
    />
  )
}
