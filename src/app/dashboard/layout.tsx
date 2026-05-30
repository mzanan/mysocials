import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { SignOutButton } from '@/components/auth/SignOutButton'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect('/login')

  return (
    <div className="relative min-h-dvh overflow-hidden bg-app-bg text-white">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgba(167,139,250,0.08),transparent_55%)]"
      />
      <header className="sticky top-0 z-20 border-b border-white/[0.08] bg-app-bg/70 backdrop-blur-xl">
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
      <main className="relative z-10 mx-auto max-w-3xl px-4 py-8">{children}</main>
      <div aria-hidden className="grain-overlay" />
    </div>
  )
}
