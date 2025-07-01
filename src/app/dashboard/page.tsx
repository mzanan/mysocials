'use client'

import { useAuth } from '@/hooks/useAuth'
import { useLinks } from '@/hooks/useLinks'
import { useProfile } from '@/hooks/useProfile'
import { useAnalytics } from '@/hooks/useAnalytics'
import { Header } from '@/components/Header/Header'
import { LinkList } from '@/components/LinkList/LinkList'
import { ShareProfile } from '@/components/ShareProfile/ShareProfile'
import { UpdateUsername } from '@/components/UpdateUsername/UpdateUsername'
import { Card, CardContent } from '@/components/ui/card'
import { User, MousePointer, Link as LinkIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export const dynamic = 'force-dynamic'

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  const { 
    links, 
    loading, 
    error, 
    createLink, 
    updateLink, 
    deleteLink 
  } = useLinks()
  
  const { profile, loading: profileLoading } = useProfile()
  const { stats, loading: analyticsLoading } = useAnalytics()

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k'
    }
    return num.toString()
  }

  const statsData = [
    { 
      label: 'Total Links', 
      value: links.length.toString(), 
      icon: LinkIcon, 
      color: 'text-blue-600 bg-blue-100',
      loading: loading
    },
    { 
      label: 'Profile Views', 
      value: stats ? formatNumber(stats.profileViews) : '0', 
      icon: User, 
      color: 'text-green-600 bg-green-100',
      loading: analyticsLoading
    },
    { 
      label: 'Total Clicks', 
      value: stats ? formatNumber(stats.totalClicks) : '0', 
      icon: MousePointer, 
      color: 'text-purple-600 bg-purple-100',
      loading: analyticsLoading
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}
        
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {statsData.map((stat, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    {stat.loading ? (
                      <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                    ) : (
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    )}
                  </div>
                  <div className={`p-3 rounded-lg ${stat.color}`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Profile Management Section */}
        <div className="grid gap-6 mb-8 lg:grid-cols-2">
          {profileLoading ? (
            <>
              <div className="h-48 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-48 bg-gray-200 rounded animate-pulse"></div>
            </>
          ) : (
            <>
              <ShareProfile username={profile?.username} />
              <UpdateUsername />
            </>
          )}
        </div>
        
        {/* Links Section */}
        <LinkList
          links={links}
          loading={loading}
          onCreateLink={createLink}
          onUpdateLink={updateLink}
          onDeleteLink={deleteLink}
        />
      </main>
    </div>
  )
} 