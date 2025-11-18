import { NextResponse } from 'next/server'
import { getCachedData, setCachedData } from '@/lib/cache'
import axios from 'axios'

interface Video {
  id: string
  thumbnail: string
  title: string
  url: string
  platform: string
}

export async function GET() {
  try {
    const cached = getCachedData<{ videos: Video[] }>('twitch_videos')
    if (cached) {
      return NextResponse.json(cached)
    }

    const username = 'mzanan'
    
    try {
      const response = await axios.get(`https://www.twitch.tv/${username}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Client-ID': 'kimne78kx3ncx6brgo4mv6wki5h1ko',
        },
        timeout: 10000,
      })

      console.log('Twitch response status:', response.status)
      const html = response.data
      const thumbnailRegex = /https:\/\/static-cdn\.jtvnw\.net\/[^\s"]+\.jpg/g
      const matches = html.match(thumbnailRegex)
      
      console.log('Twitch thumbnails found:', matches?.length || 0)
      
      if (matches && matches.length > 0) {
        const videos: Video[] = []
        const uniqueThumbnails = [...new Set(matches)].slice(0, 6) as string[]
        
        uniqueThumbnails.forEach((thumbnail, i) => {
          videos.push({
            id: `twitch-${i}`,
            thumbnail,
            title: `Clip ${i + 1}`,
            url: `https://www.twitch.tv/${username}/videos?filter=clips`,
            platform: 'twitch',
          })
        })

        console.log('Twitch videos created:', videos.length)
        if (videos.length > 0) {
          const result = { videos }
          setCachedData('twitch_videos', result)
          return NextResponse.json(result)
        }
      }
    } catch (error) {
      console.error('Twitch scraping error:', error)
    }

    console.log('Twitch: Using fallback placeholders')

    const videos: Video[] = []
    for (let i = 1; i <= 6; i++) {
      videos.push({
        id: `twitch-${i}`,
        thumbnail: `https://static-cdn.jtvnw.net/ttv-boxart/516575-285x380.jpg`,
        title: `Valorant Clip ${i}`,
        url: `https://www.twitch.tv/${username}/videos?filter=clips`,
        platform: 'twitch',
      })
    }

    const result = { videos }
    setCachedData('twitch_videos', result)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Twitch API error:', error)
    return NextResponse.json({ videos: [], error: String(error) })
  }
}

