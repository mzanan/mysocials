'use client'

import { usePublicProfile } from './usePublicProfile'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Link } from '@/types/link'
import { SocialIcon } from 'react-social-icons'

interface PublicProfileProps {
  username: string
}

export function PublicProfile({ username }: PublicProfileProps) {
  const { profile, links, loading, error, handleLinkClick } = usePublicProfile({ username })

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500">
        <div className="max-w-md mx-auto px-4 py-8">
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <div className="text-center space-y-4">
              <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto animate-pulse"></div>
              <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="space-y-3">
                <div className="h-12 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="h-12 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="h-12 bg-gray-200 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500">
        <div className="max-w-md mx-auto px-4 py-8">
          <Card className="rounded-3xl shadow-xl">
            <CardContent className="p-8 text-center">
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Oops!</h1>
              <p className="text-gray-600">{error}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!profile) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500">
      <div className="max-w-md mx-auto px-4 py-8">
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <div className="text-center mb-8">
            <Avatar className="w-24 h-24 mx-auto mb-4">
              {profile.avatar_url && (
                <AvatarImage src={profile.avatar_url} alt={profile.full_name || profile.username} />
              )}
              <AvatarFallback className="text-2xl">
                {profile.full_name?.charAt(0).toUpperCase() || profile.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              {profile.full_name || `@${profile.username}`}
            </h1>
            {profile.full_name && (
              <p className="text-gray-600 mb-2">@{profile.username}</p>
            )}
            {profile.bio && (
              <p className="text-gray-600 text-sm">{profile.bio}</p>
            )}
          </div>

          <div className="space-y-3">
            {links.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-gray-500">No links available</p>
                </CardContent>
              </Card>
            ) : (
              links.map((link: Link) => (
                <Button
                  key={link.id}
                  variant="outline"
                  className="w-full h-14 text-lg font-medium bg-white hover:bg-gray-50 border-2 flex items-center gap-3 justify-start px-4"
                  onClick={() => handleLinkClick(link.id)}
                >
                  <SocialIcon 
                    url={link.url} 
                    style={{ height: 32, width: 32 }}
                  />
                  <span className="flex-1 text-left">{link.title}</span>
                </Button>
              ))
            )}
          </div>

          <div className="text-center mt-8 pt-6 border-t">
            <p className="text-sm text-gray-500">
              Powered by <span className="font-semibold">MySocials</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 