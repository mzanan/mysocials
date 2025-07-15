'use client'

import { usePublicProfile } from './usePublicProfile'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Link } from '@/types/link'
import { SocialIcon } from 'react-social-icons'
import Image from 'next/image'

export function PublicProfile() {
  const { profile, links, handleLinkClick } = usePublicProfile()

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 flex flex-col items-center justify-center">
      <div className="max-w-md px-4 py-8">
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <div className="text-center mb-8">
            <Avatar className="w-24 h-24 mx-auto mb-4">
              {profile.avatar_url && (
                <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
              )}
              <AvatarFallback className="text-2xl">
                {profile.full_name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              {profile.full_name}
            </h1>
            {profile.bio && (
              <p className="text-gray-600 text-sm">{profile.bio}</p>
            )}
          </div>

          <div className="space-y-3">
            {
              links.map((link: Link) => (
                <Button
                  key={link.id}
                  variant="outline"
                  className="w-full h-14 text-lg font-medium bg-white hover:bg-gray-50 border-2 flex items-center gap-3 justify-start px-4"
                  onClick={() => handleLinkClick(link.id)}
                >
                  {link.icon_url ? (
                    <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                      <Image 
                        src={link.icon_url} 
                        alt={`${link.title} icon`}
                        width={20}
                        height={20}
                        className="object-contain"
                      />
                    </div>
                  ) : (
                  <SocialIcon 
                    url={link.url} 
                    style={{ height: 32, width: 32 }}
                  />
                  )}
                  <span className="flex-1 text-left">{link.title}</span>
                </Button>
              ))
            }
          </div>

          <div className="text-center mt-8 pt-6 border-t">
            <p className="text-sm text-gray-500">
              Powered by <span className="font-semibold">Matias Zanan</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 