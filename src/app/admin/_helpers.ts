import { headers } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { isAdminUser } from '@/lib/admin'

export async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect('/')
  if (!isAdminUser(session.user)) notFound()
  return session
}
