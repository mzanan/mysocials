'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/Header/Header'
import { useAuth } from '@/hooks/useAuth'

export const dynamic = 'force-dynamic'

export default function HomePage() {
  const { user, loading } = useAuth()

  const getStartedHref = user ? '/dashboard' : '/signup'
  const getStartedText = user ? 'Go to Dashboard' : 'Create your Account'

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-16">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-12 bg-gray-200 rounded mb-4"></div>
              <div className="h-6 bg-gray-200 rounded mb-8"></div>
              <div className="h-10 bg-gray-200 rounded w-40 mx-auto"></div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-4xl mx-auto px-4 flex flex-col flex-1 gap-20 h-[calc(100vh-165px)] justify-center">
        {/* Hero Section */}
        <div className="text-center flex flex-col gap-2">
          <h1 className="text-5xl font-bold text-gray-900">
            All your links in one place
          </h1>
          <p className="text-xl text-gray-600">
            Create your personal link-in-bio page in minutes.
          </p>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-center text-white flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-3xl font-bold">
              Ready to get started?
            </h2>
            <p className="max-w-lg mx-auto opacity-90">
              Join thousands of users who already share their links with our platform. Create your page in minutes.
            </p>
          </div>

          <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-gray-100 self-center">
            <Link href={getStartedHref}>
              {getStartedText}
            </Link>
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center text-gray-500">
            <p>&copy; 2025 MySocials. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
