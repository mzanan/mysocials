import { headers } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { isAdminUser } from '@/lib/admin'
import { SignOutButton } from '@/components/auth/SignOutButton'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect('/')
  if (!isAdminUser(session.user)) notFound()

  return (
    <div className="relative min-h-dvh overflow-hidden bg-app-bg text-fg">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgba(167,139,250,0.08),transparent_55%)]"
      />
      <header className="sticky top-0 z-20 border-b border-hairline-subtle bg-app-bg/70 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold tracking-tight">mySocials · admin</span>
            <Link href="/dashboard" className="text-sm text-fg-subtle hover:text-fg-muted">
              Dashboard
            </Link>
          </div>
          <SignOutButton />
        </div>
      </header>
      <main className="relative z-10 mx-auto max-w-5xl px-4 py-8">{children}</main>
      <div aria-hidden className="grain-overlay" />
    </div>
  )
}
