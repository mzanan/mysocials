import Link from 'next/link'
import { SignOutButton } from '@/components/auth/SignOutButton'
import { AmbientBackground } from '@/components/ui/AmbientBackground'
import { requireAdmin } from './_helpers'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin()

  return (
    <div className="relative min-h-dvh overflow-clip bg-app-bg text-fg">
      <AmbientBackground />
      <header className="sticky top-0 z-20 border-b border-hairline-subtle bg-app-bg/70 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold tracking-tight">mySocials · admin</span>
            <Link href="/dashboard" className="text-sm text-fg-subtle hover:text-fg-muted">
              Dashboard
            </Link>
          </div>
          <SignOutButton />
        </div>
      </header>
      <main className="relative z-10 mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-12">{children}</main>
      <div aria-hidden className="grain-overlay" />
    </div>
  )
}
