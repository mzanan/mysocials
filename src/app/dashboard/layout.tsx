import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { profiles } from '@/lib/db/schema'
import { UserMenu } from '@/components/account/UserMenu'
import { ThemeToggle } from '@/components/ThemeToggle'
import { AmbientBackground } from '@/components/ui/AmbientBackground'
import { BrandFooter } from '@/components/ui/BrandFooter'
import { billingEnabled } from '@/lib/subscription'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect('/')

  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.user_id, session.user.id),
    columns: { subscription_status: true },
  })

  return (
    <div className="relative min-h-dvh overflow-hidden bg-app-bg text-fg">
      <AmbientBackground />
      <header className="sticky top-0 z-20 border-b border-hairline-subtle bg-app-bg/70 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <Link href="/dashboard" className="text-sm font-semibold tracking-tight">
            mySocials
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <UserMenu
              email={session.user.email}
              billingEnabled={billingEnabled()}
              subscriptionStatus={profile?.subscription_status ?? null}
            />
          </div>
        </div>
      </header>
      <main className="relative z-10 mx-auto max-w-3xl px-4 py-8">{children}</main>
      <BrandFooter />
      <div aria-hidden className="grain-overlay" />
    </div>
  )
}
