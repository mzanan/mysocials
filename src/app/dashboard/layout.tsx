import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { SignOutButton } from '@/components/auth/SignOutButton'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect('/login')

  return (
    <div className="min-h-dvh bg-app-bg text-white">
      <header className="sticky top-0 z-20 border-b border-white/[0.08] bg-app-bg/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <Link href="/dashboard" className="text-sm font-semibold tracking-tight">
            mySocials
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-white/45 sm:inline">{session.user.email}</span>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-8">{children}</main>
    </div>
  )
}
