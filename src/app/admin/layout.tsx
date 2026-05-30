import { headers } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { isAdminUser } from '@/lib/admin'
import { SignOutButton } from '@/components/auth/SignOutButton'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect('/login')
  if (!isAdminUser(session.user)) notFound()

  return (
    <div className="min-h-dvh bg-app-bg text-white">
      <header className="sticky top-0 z-20 border-b border-white/[0.08] bg-app-bg/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold tracking-tight">mySocials · admin</span>
            <Link href="/dashboard" className="text-sm text-white/45 hover:text-white/80">
              Dashboard
            </Link>
          </div>
          <SignOutButton />
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  )
}
