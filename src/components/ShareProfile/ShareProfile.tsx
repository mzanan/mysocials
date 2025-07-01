'use client'

import Link from 'next/link'
import { useShareProfile } from './useShareProfile'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Copy, ExternalLink, Share2, Link as LinkIcon } from 'lucide-react'

interface ShareProfileProps {
  username?: string
}

export function ShareProfile({ username }: ShareProfileProps) {
  const { copying, profileUrl, handleCopyUrl } = useShareProfile({ username })

  if (!username) {
    return (
      <Card className="hover:shadow-lg transition-all duration-300">
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <Share2 className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p>Profile not found</p>
            <p className="text-sm">You need to create a profile first.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="hover:shadow-lg transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LinkIcon className="w-5 h-5 text-green-600" />
          Share Your Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Your public profile URL:
          </label>
          <div className="flex gap-2">
            <Input 
              value={profileUrl} 
              readOnly 
              className="flex-1 bg-gray-50 font-mono text-sm"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyUrl}
              disabled={copying}
              className="flex items-center gap-1 hover:bg-green-50 hover:border-green-300"
            >
              <Copy className="w-4 h-4" />
              {copying ? 'Copied!' : 'Copy'}
            </Button>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button asChild variant="outline" className="flex-1 hover:bg-blue-50 hover:border-blue-300">
            <Link href={`/${username}`} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-2" />
              View Profile
            </Link>
          </Button>
          <Button 
            onClick={handleCopyUrl} 
            disabled={copying} 
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            <Share2 className="w-4 h-4 mr-2" />
            {copying ? 'Copied!' : 'Share Link'}
          </Button>
        </div>
        
        <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
          <Share2 className="w-4 h-4 text-blue-600" />
          <div className="text-xs text-blue-800">
            Share this link on social media, email signatures, or anywhere you want people to find all your links.
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 