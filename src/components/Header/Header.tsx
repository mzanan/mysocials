'use client'

import Link from 'next/link'
import { useHeader } from './useHeader'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

export function Header() {
  const { user, loading, isAuthenticated, handleSignOut } = useHeader()

  if (loading) {
    return (
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="h-8 bg-gray-200 rounded animate-pulse w-32"></div>
            <div className="h-8 bg-gray-200 rounded animate-pulse w-24"></div>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="bg-white border-b">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Avatar>
                  <AvatarFallback>
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="font-semibold">MySocials</h1>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                </div>
              </>
            ) : (
              <Link href="/" className="text-2xl font-bold text-gray-900">
                MySocials
              </Link>
            )}
          </div>
          
          <div className="flex gap-3">
            {isAuthenticated ? (
              <Button variant="outline" onClick={handleSignOut}>
                Sign Out
              </Button>
            ) : (
              <>
                <Button asChild variant="outline">
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link href="/signup">Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
} 